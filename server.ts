import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { authMiddleware, generateToken, AuthenticatedRequest } from './server/auth.js';
import { fetchDevToArticles, initNewsCron } from './server/newsCron.js';

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

// FILE UPLOAD
app.post('/api/upload', authMiddleware, (req: Request, res: Response) => {
  upload.array('files', 10)(req, res, (err: any) => {
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

    const urls = files.map(file => `/uploads/${file.filename}`);
    res.json({ success: true, urls, url: urls[0] });
  });
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
