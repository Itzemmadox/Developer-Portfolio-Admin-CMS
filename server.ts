import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Auto-populate process.env from data/env.json if available
try {
  const envJsonPath = path.join(process.cwd(), 'data', 'env.json');
  if (fs.existsSync(envJsonPath)) {
    const envData = JSON.parse(fs.readFileSync(envJsonPath, 'utf8'));
    for (const [k, v] of Object.entries(envData)) {
      if (typeof v === 'string' && v.trim() !== '') {
        process.env[k] = v;
      }
    }
  }
} catch (e) {
  // ignore
}

import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { authMiddleware, generateToken, AuthenticatedRequest } from './server/auth.js';
import { fetchDevToArticles, initNewsCron } from './server/newsCron.js';
import { connectMongoDB, getMongoStatus, syncMongoWithLocalData, seedMongoFromLocalData } from './server/mongodb.js';
import { uploadMediaFile, isCloudinaryConfigured, deleteCloudinaryAsset, getSignedDownloadUrl } from './server/cloudinary.js';

const app = express();
const PORT = 3000;

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.png';
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage });

// Middlewares
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve static uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------- API ROUTES ----------------- //

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH ENDPOINTS
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const admin = db.getAdmin();
  if (email !== admin.email || !bcrypt.compareSync(password, admin.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = generateToken({ email: admin.email });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({ success: true, token, user: { email: admin.email } });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

app.put('/api/auth/update-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword, newEmail } = req.body;
  const admin = db.getAdmin();

  if (!bcrypt.compareSync(currentPassword, admin.passwordHash)) {
    res.status(400).json({ error: 'Current password is incorrect' });
    return;
  }

  const updatedAdmin = {
    email: newEmail ? newEmail.trim() : admin.email,
    passwordHash: newPassword ? bcrypt.hashSync(newPassword, 10) : admin.passwordHash
  };

  db.setAdmin(updatedAdmin);
  res.json({ success: true, message: 'Admin details updated successfully', user: { email: updatedAdmin.email } });
});

// SYSTEM STATUS (DATABASE & STORAGE STATUS)
app.get('/api/system/status', async (req: Request, res: Response) => {
  let mongo = getMongoStatus();

  // If configured but not connected yet, attempt reconnection dynamically
  if (!mongo.connected && process.env.MONGODB_URI) {
    const reconnected = await connectMongoDB();
    if (reconnected) {
      await seedMongoFromLocalData(db);
    }
    mongo = getMongoStatus();
  }

  const cloudinaryConfigured = isCloudinaryConfigured();
  const folderName = process.env.CLOUDINARY_FOLDER || 'portfolio_uploads';

  res.json({
    database: {
      type: mongo.connected ? 'MongoDB' : 'Local JSON Store',
      status: mongo.connected ? 'Connected' : mongo.configured ? (mongo.error ? 'Connection Notice' : 'Connecting...') : 'Active (Local Fallback)',
      details: mongo
    },
    storage: {
      type: cloudinaryConfigured ? 'Cloudinary CDN' : 'Local Disk Storage',
      status: cloudinaryConfigured ? 'Connected' : 'Active (Local Fallback)',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
      folder: cloudinaryConfigured ? folderName : 'uploads'
    }
  });
});

// FILE UPLOAD (CLOUDINARY + LOCAL FALLBACK)
app.post('/api/upload', authMiddleware, (req: Request, res: Response) => {
  upload.array('files', 10)(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      res.status(400).json({ error: err.message || 'File upload failed' });
      return;
    }
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const customFolder = (req.body?.folder || req.query?.folder) as string | undefined;

    try {
      const uploadPromises = files.map(file => uploadMediaFile(file, customFolder));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.url);

      res.json({
        success: true,
        urls,
        url: urls[0],
        provider: results[0]?.provider || 'local',
        folder: results[0]?.folder || (process.env.CLOUDINARY_FOLDER || 'portfolio_uploads')
      });
    } catch (uploadErr: any) {
      console.error('File upload processing error:', uploadErr);
      res.status(500).json({ error: uploadErr.message || 'Failed to process file upload' });
    }
  });
});

// DOCUMENT / RESUME PROXY ENDPOINT
app.get('/api/document/proxy', async (req: Request, res: Response) => {
  const fileUrl = req.query.url as string;
  const isDownload = req.query.download === '1' || req.query.mode === 'download';

  if (!fileUrl) {
    res.status(400).send('Missing url parameter');
    return;
  }

  const filename = isDownload ? 'Oluwaseun_Emmanuel_Kehinde_CV.pdf' : 'Oluwaseun_Emmanuel_Kehinde_Resume.pdf';
  const disposition = isDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`;

  try {
    // If local path: e.g. /uploads/sample_resume.pdf
    if (fileUrl.startsWith('/uploads/') || fileUrl.startsWith('uploads/')) {
      const relativePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
      const filePath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', disposition);
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    // Remote URL (Cloudinary or external)
    // Clean URL so it doesn't have fl_attachment when viewing inline
    let cleanUrl = fileUrl.replace(/fl_attachment[,/]?/g, '').replace(/\/+/g, '/').replace(':/', '://');
    let fetchUrl = isDownload ? cleanUrl.replace('/image/upload/', '/image/upload/fl_attachment/') : cleanUrl;

    let response = await fetch(fetchUrl);

    // If fetch failed, try direct clean URL
    if (!response.ok && fetchUrl !== cleanUrl) {
      response = await fetch(cleanUrl);
    }

    // If still failed, try raw URL format in Cloudinary
    if (!response.ok && cleanUrl.includes('res.cloudinary.com') && cleanUrl.includes('/image/upload/')) {
      const rawUrl = cleanUrl.replace('/image/upload/', '/raw/upload/');
      const rawResp = await fetch(rawUrl);
      if (rawResp.ok) {
        response = rawResp;
      }
    }

    // If still failed and it's a Cloudinary URL, use signed private_download_url
    if (!response.ok && (cleanUrl.includes('cloudinary.com') || fileUrl.includes('cloudinary.com'))) {
      const signedUrl = getSignedDownloadUrl(cleanUrl) || getSignedDownloadUrl(fileUrl);
      if (signedUrl) {
        const signedResp = await fetch(signedUrl);
        if (signedResp.ok) {
          response = signedResp;
        }
      }
    }

    if (!response.ok) {
      res.status(404).send('Document could not be retrieved from storage.');
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'application/pdf';

    res.setHeader('Content-Type', contentType.includes('pdf') || fileUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : contentType);
    res.setHeader('Content-Disposition', disposition);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (error: any) {
    console.error('Document proxy error:', error);
    res.status(500).send('Failed to fetch document: ' + (error.message || 'Unknown error'));
  }
});

// SITE SETTINGS
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.getSettings());
});

const handleSettingsUpdate = (req: Request, res: Response) => {
  const updated = db.setSettings(req.body);
  res.json(updated);
};

app.put('/api/settings', authMiddleware, handleSettingsUpdate);
app.post('/api/settings', authMiddleware, handleSettingsUpdate);
app.patch('/api/settings', authMiddleware, handleSettingsUpdate);

// GITHUB CONTRIBUTIONS API
app.get('/api/github/contributions', async (req: Request, res: Response) => {
  const rawUsername = (req.query.username as string) || '';
  let username = rawUsername.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0];
  if (!username) {
    const settings = db.getSettings();
    const githubLink = settings.socialLinks?.github || '';
    username = githubLink.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0] || 'octocat';
  }

  try {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`, {
      headers: { 'User-Agent': 'Portfolio-App' }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && Array.isArray(data.contributions)) {
        const contributions = data.contributions;
        const total = data.total
          ? (Object.values(data.total).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number)
          : contributions.reduce((acc: number, c: any) => acc + (c.count || 0), 0);

        const sorted = [...contributions].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;

        for (let i = sorted.length - 1; i >= 0; i--) {
          if (sorted[i].count > 0) {
            currentStreak++;
          } else {
            if (i === sorted.length - 1) continue;
            break;
          }
        }

        for (const day of sorted) {
          if (day.count > 0) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
          } else {
            tempStreak = 0;
          }
        }

        res.json({
          username,
          totalContributions: total || contributions.reduce((acc: number, c: any) => acc + (c.count || 0), 0),
          contributions,
          currentStreak,
          maxStreak
        });
        return;
      }
    }
  } catch (err) {
    console.warn(`GitHub contribution fetch notice for ${username}:`, err);
  }

  // Fallback generation if external API fails or is rate-limited
  const today = new Date();
  const contributions: Array<{ date: string; count: number; level: number }> = [];
  let totalCount = 0;
  let tempStreak = 0;
  let maxStreak = 0;

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayOfWeek = d.getDay();
    const seed = (d.getFullYear() * 1000 + (d.getMonth() + 1) * 31 + d.getDate() + username.length * 7) % 100;

    let count = 0;
    let level = 0;

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && seed > 30) {
      if (seed > 85) { count = Math.floor(seed / 10) + 4; level = 4; }
      else if (seed > 65) { count = Math.floor(seed / 12) + 2; level = 3; }
      else if (seed > 45) { count = Math.floor(seed / 15) + 1; level = 2; }
      else { count = 1; level = 1; }
    } else if (seed > 75) {
      count = 2;
      level = 1;
    }

    totalCount += count;
    if (count > 0) {
      tempStreak++;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 0;
    }

    contributions.push({ date: dateStr, count, level });
  }

  res.json({
    username,
    totalContributions: totalCount,
    contributions,
    currentStreak: tempStreak,
    maxStreak,
    isFallback: true
  });
});

// PROJECTS
app.get('/api/projects', (req: Request, res: Response) => {
  const projects = db.getProjects();
  projects.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(projects);
});

app.get('/api/projects/:slug', (req: Request, res: Response) => {
  const projects = db.getProjects();
  const found = projects.find((p: any) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!found) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  res.json(found);
});

app.post('/api/projects', authMiddleware, (req: Request, res: Response) => {
  const projects = db.getProjects();
  const newProject = {
    ...req.body,
    id: `proj-${Date.now()}`,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    order: req.body.order ?? projects.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  projects.push(newProject);
  db.setProjects(projects);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', authMiddleware, (req: Request, res: Response) => {
  const projects = db.getProjects();
  const index = projects.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Project not found' });
    return;
  }
  projects[index] = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  db.setProjects(projects);
  res.json(projects[index]);
});

app.delete('/api/projects/:id', authMiddleware, (req: Request, res: Response) => {
  let projects = db.getProjects();
  projects = projects.filter((p: any) => p.id !== req.params.id);
  db.setProjects(projects);
  res.json({ success: true, message: 'Project deleted' });
});

app.patch('/api/projects/reorder', authMiddleware, (req: Request, res: Response) => {
  const { orders } = req.body; // Array of { id: string, order: number }
  if (!Array.isArray(orders)) {
    res.status(400).json({ error: 'Invalid orders array' });
    return;
  }
  const projects = db.getProjects();
  orders.forEach(({ id, order }) => {
    const item = projects.find((p: any) => p.id === id);
    if (item) item.order = order;
  });
  db.setProjects(projects);
  res.json({ success: true, projects });
});

// SKILLS
app.get('/api/skills', (req: Request, res: Response) => {
  const skills = db.getSkills();
  skills.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(skills);
});

app.post('/api/skills', authMiddleware, (req: Request, res: Response) => {
  const skills = db.getSkills();
  const newSkill = {
    ...req.body,
    id: `sk-${Date.now()}`,
    order: req.body.order ?? skills.length + 1
  };
  skills.push(newSkill);
  db.setSkills(skills);
  res.status(201).json(newSkill);
});

app.put('/api/skills/:id', authMiddleware, (req: Request, res: Response) => {
  const skills = db.getSkills();
  const index = skills.findIndex((s: any) => s.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Skill not found' });
    return;
  }
  skills[index] = { ...skills[index], ...req.body };
  db.setSkills(skills);
  res.json(skills[index]);
});

app.delete('/api/skills/:id', authMiddleware, (req: Request, res: Response) => {
  let skills = db.getSkills();
  skills = skills.filter((s: any) => s.id !== req.params.id);
  db.setSkills(skills);
  res.json({ success: true, message: 'Skill deleted' });
});

app.patch('/api/skills/reorder', authMiddleware, (req: Request, res: Response) => {
  const orders = req.body.orders || req.body;
  if (!Array.isArray(orders)) {
    res.status(400).json({ error: 'Invalid orders array' });
    return;
  }
  const skills = db.getSkills();
  orders.forEach(({ id, order }: { id: string; order: number }) => {
    const item = skills.find((s: any) => s.id === id);
    if (item) item.order = Number(order);
  });
  skills.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  db.setSkills(skills);
  res.json({ success: true, skills });
});

// EXPERIENCE
app.get('/api/experience', (req: Request, res: Response) => {
  const exp = db.getExperience();
  exp.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(exp);
});

app.post('/api/experience', authMiddleware, (req: Request, res: Response) => {
  const exp = db.getExperience();
  const newExp = {
    ...req.body,
    id: `exp-${Date.now()}`,
    order: req.body.order ?? exp.length + 1
  };
  exp.push(newExp);
  db.setExperience(exp);
  res.status(201).json(newExp);
});

app.put('/api/experience/:id', authMiddleware, (req: Request, res: Response) => {
  const exp = db.getExperience();
  const index = exp.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Experience entry not found' });
    return;
  }
  exp[index] = { ...exp[index], ...req.body };
  db.setExperience(exp);
  res.json(exp[index]);
});

app.delete('/api/experience/:id', authMiddleware, (req: Request, res: Response) => {
  let exp = db.getExperience();
  exp = exp.filter((e: any) => e.id !== req.params.id);
  db.setExperience(exp);
  res.json({ success: true, message: 'Experience deleted' });
});

// EDUCATION
app.get('/api/education', (req: Request, res: Response) => {
  const edu = db.getEducation();
  edu.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(edu);
});

app.post('/api/education', authMiddleware, (req: Request, res: Response) => {
  const edu = db.getEducation();
  const newEdu = {
    ...req.body,
    id: `edu-${Date.now()}`,
    order: req.body.order ?? edu.length + 1
  };
  edu.push(newEdu);
  db.setEducation(edu);
  res.status(201).json(newEdu);
});

app.put('/api/education/:id', authMiddleware, (req: Request, res: Response) => {
  const edu = db.getEducation();
  const index = edu.findIndex((e: any) => e.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Education entry not found' });
    return;
  }
  edu[index] = { ...edu[index], ...req.body };
  db.setEducation(edu);
  res.json(edu[index]);
});

app.delete('/api/education/:id', authMiddleware, (req: Request, res: Response) => {
  let edu = db.getEducation();
  edu = edu.filter((e: any) => e.id !== req.params.id);
  db.setEducation(edu);
  res.json({ success: true, message: 'Education deleted' });
});

// TESTIMONIALS
app.get('/api/testimonials', (req: Request, res: Response) => {
  const items = db.getTestimonials();
  items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(items);
});

app.post('/api/testimonials', authMiddleware, (req: Request, res: Response) => {
  const items = db.getTestimonials();
  const newItem = {
    ...req.body,
    id: `test-${Date.now()}`,
    order: req.body.order ?? items.length + 1
  };
  items.push(newItem);
  db.setTestimonials(items);
  res.status(201).json(newItem);
});

app.put('/api/testimonials/:id', authMiddleware, (req: Request, res: Response) => {
  const items = db.getTestimonials();
  const index = items.findIndex((t: any) => t.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Testimonial not found' });
    return;
  }
  items[index] = { ...items[index], ...req.body };
  db.setTestimonials(items);
  res.json(items[index]);
});

app.delete('/api/testimonials/:id', authMiddleware, (req: Request, res: Response) => {
  let items = db.getTestimonials();
  items = items.filter((t: any) => t.id !== req.params.id);
  db.setTestimonials(items);
  res.json({ success: true, message: 'Testimonial deleted' });
});

// CERTIFICATIONS
app.get('/api/certifications', (req: Request, res: Response) => {
  const items = db.getCertifications();
  items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(items);
});

app.post('/api/certifications', authMiddleware, (req: Request, res: Response) => {
  const items = db.getCertifications();
  const newItem = {
    ...req.body,
    id: `cert-${Date.now()}`,
    order: req.body.order ?? items.length + 1
  };
  items.push(newItem);
  db.setCertifications(items);
  res.status(201).json(newItem);
});

app.put('/api/certifications/:id', authMiddleware, (req: Request, res: Response) => {
  const items = db.getCertifications();
  const index = items.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Certification not found' });
    return;
  }
  items[index] = { ...items[index], ...req.body };
  db.setCertifications(items);
  res.json(items[index]);
});

app.delete('/api/certifications/:id', authMiddleware, (req: Request, res: Response) => {
  let items = db.getCertifications();
  items = items.filter((c: any) => c.id !== req.params.id);
  db.setCertifications(items);
  res.json({ success: true, message: 'Certification deleted' });
});

// CERTIFICATES (VERIFIED CREDENTIALS)
app.get('/api/certificates', (req: Request, res: Response) => {
  const items = db.getCertificates ? db.getCertificates() : [];
  items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(items);
});

app.post('/api/certificates', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const items = db.getCertificates ? db.getCertificates() : [];
    let imageUrl = req.body.imageUrl || '';
    let imagePublicId = req.body.imagePublicId || '';

    if (req.file) {
      const uploadRes = await uploadMediaFile(req.file);
      imageUrl = uploadRes.url;
      imagePublicId = uploadRes.publicId || '';
    }

    const newItem = {
      id: `vcert-${Date.now()}`,
      title: req.body.title || 'Untitled Certificate',
      issuer: req.body.issuer || 'Issuer',
      category: req.body.category || 'GENERAL',
      imageUrl,
      imagePublicId,
      credentialUrl: req.body.credentialUrl || '',
      issueDate: req.body.issueDate || '',
      order: req.body.order !== undefined ? Number(req.body.order) : items.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    items.push(newItem);
    db.setCertificates(items);
    res.status(201).json(newItem);
  } catch (err: any) {
    console.error('Error creating certificate:', err);
    res.status(500).json({ error: err.message || 'Failed to create certificate' });
  }
});

app.put('/api/certificates/:id', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
  try {
    const items = db.getCertificates ? db.getCertificates() : [];
    const index = items.findIndex((c: any) => c.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    const existing = items[index];
    let imageUrl = req.body.imageUrl !== undefined ? req.body.imageUrl : existing.imageUrl;
    let imagePublicId = req.body.imagePublicId !== undefined ? req.body.imagePublicId : existing.imagePublicId;

    if (req.file) {
      if (existing.imagePublicId) {
        await deleteCloudinaryAsset(existing.imagePublicId);
      }
      const uploadRes = await uploadMediaFile(req.file);
      imageUrl = uploadRes.url;
      imagePublicId = uploadRes.publicId || '';
    }

    items[index] = {
      ...existing,
      ...req.body,
      imageUrl,
      imagePublicId,
      order: req.body.order !== undefined ? Number(req.body.order) : existing.order,
      updatedAt: new Date().toISOString()
    };

    db.setCertificates(items);
    res.json(items[index]);
  } catch (err: any) {
    console.error('Error updating certificate:', err);
    res.status(500).json({ error: err.message || 'Failed to update certificate' });
  }
});

app.delete('/api/certificates/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    let items = db.getCertificates ? db.getCertificates() : [];
    const found = items.find((c: any) => c.id === req.params.id);
    if (found && found.imagePublicId) {
      await deleteCloudinaryAsset(found.imagePublicId);
    }
    items = items.filter((c: any) => c.id !== req.params.id);
    db.setCertificates(items);
    res.json({ success: true, message: 'Certificate deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting certificate:', err);
    res.status(500).json({ error: err.message || 'Failed to delete certificate' });
  }
});

app.patch('/api/certificates/reorder', authMiddleware, (req: Request, res: Response) => {
  const orders = req.body.orders || req.body;
  if (!Array.isArray(orders)) {
    res.status(400).json({ error: 'Invalid orders array' });
    return;
  }
  const items = db.getCertificates ? db.getCertificates() : [];
  orders.forEach(({ id, order }: { id: string; order: number }) => {
    const item = items.find((c: any) => c.id === id);
    if (item) item.order = Number(order);
  });
  items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  db.setCertificates(items);
  res.json({ success: true, certificates: items });
});

// NEWS (DEV.TO CACHE)
app.get('/api/news', (req: Request, res: Response) => {
  const articles = db.getCachedArticles();
  res.json(articles);
});

app.post('/api/news/refresh', async (req: Request, res: Response) => {
  try {
    const articles = await fetchDevToArticles();
    res.json({ success: true, count: articles.length, articles });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to refresh news' });
  }
});

// CONTACT MESSAGES
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  const messages = db.getMessages();
  const newMessage = {
    id: `msg-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  messages.unshift(newMessage);
  db.setMessages(messages);
  res.status(201).json({ success: true, message: 'Thank you for your message! I will respond shortly.' });
});

app.get('/api/contact', authMiddleware, (req: Request, res: Response) => {
  const messages = db.getMessages();
  res.json(messages);
});

app.patch('/api/contact/:id/read', authMiddleware, (req: Request, res: Response) => {
  const messages = db.getMessages();
  const msg = messages.find((m: any) => m.id === req.params.id);
  if (msg) {
    msg.read = true;
    db.setMessages(messages);
  }
  res.json({ success: true });
});

app.delete('/api/contact/:id', authMiddleware, (req: Request, res: Response) => {
  let messages = db.getMessages();
  messages = messages.filter((m: any) => m.id !== req.params.id);
  db.setMessages(messages);
  res.json({ success: true });
});

// ANALYTICS & VISITOR TRACKING ENDPOINTS
app.get('/api/analytics/stats', (req: Request, res: Response) => {
  const stats = db.getVisitorStats();
  res.json(stats);
});

app.post('/api/analytics/visit', (req: Request, res: Response) => {
  const { sessionId, path: visitPath, userAgent } = req.body || {};
  const sid = sessionId || `anon-${req.ip || 'session'}`;
  const ua = userAgent || req.headers['user-agent'] || 'Web Browser';
  const stats = db.recordVisit(sid, visitPath || '/', ua);
  res.json({ success: true, stats });
});

app.post('/api/analytics/heartbeat', (req: Request, res: Response) => {
  const { sessionId } = req.body || {};
  if (sessionId) {
    db.recordHeartbeat(sessionId);
  }
  const stats = db.getVisitorStats();
  res.json({ success: true, activeNow: stats.activeNow });
});

// ----------------- VITE SERVER INTEGRATION ----------------- //

async function startServer() {
  // Initialize cron for news fetch
  initNewsCron();

  // Attempt MongoDB connection if MONGODB_URI is provided
  const mongoConnected = await connectMongoDB();
  if (mongoConnected) {
    await seedMongoFromLocalData(db);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Portfolio API & App Server running at http://localhost:${PORT}`);
  });
}

startServer();
