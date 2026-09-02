import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import {
  AdminModel,
  SettingsModel,
  ProjectModel,
  ExperienceModel,
  EducationModel,
  SkillModel,
  CertificationModel,
  CertificateModel,
  TestimonialModel,
  ContactMessageModel,
  VisitorAnalyticsModel
} from './models.js';
import { writeJSON } from './db.js';

let isConnected = false;
let connectionError: string | null = null;

export function getEffectiveMongoUri(): string {
  try {
    const configPath = path.join(process.cwd(), 'data', 'env.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data.MONGODB_URI && typeof data.MONGODB_URI === 'string' && data.MONGODB_URI.trim()) {
        return data.MONGODB_URI.trim();
      }
    }
  } catch (e) {
    // ignore
  }
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI.trim();
  return '';
}

export const getMongoStatus = () => {
  const uri = getEffectiveMongoUri();
  return {
    configured: Boolean(uri),
    connected: isConnected,
    connectionState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    error: connectionError
  };
};

export async function connectMongoDB(): Promise<boolean> {
  const uri = getEffectiveMongoUri();
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not provided. Running on local storage engine.');
    return false;
  }

  // Filter out dummy placeholder connection strings or unreplaced angle brackets
  if (
    uri.includes('username:password') ||
    uri.includes('<username>') ||
    uri.includes('your_mongodb_uri') ||
    (uri.includes('<') && uri.includes('>'))
  ) {
    connectionError = 'MONGODB_URI contains angle brackets `<` or `>`. Please remove `<` and `>` from around your password in MONGODB_URI (e.g., change `:<password>@` to `:yourpassword@`).';
    console.log('ℹ️ ' + connectionError + ' Falling back to local storage engine.');
    return false;
  }

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }

    console.log('⏳ Connecting to MongoDB Atlas / Database...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000 // 4 seconds connection timeout
    });

    isConnected = true;
    connectionError = null;
    console.log('✅ Successfully connected to MongoDB Database!');
    return true;
  } catch (err: any) {
    isConnected = false;
    const rawError = err?.message || 'Failed to connect to MongoDB';

    if (rawError.includes('whitelisted') || rawError.includes('IP') || rawError.includes('selection timed out') || rawError.includes('connect ECONNREFUSED')) {
      connectionError = 'MongoDB Atlas IP Whitelist Error: Your MongoDB Atlas cluster is blocking connections from external IPs. To fix this, go to MongoDB Atlas -> Security -> Network Access -> Add IP Address -> Add 0.0.0.0/0 (Allow access from anywhere).';
    } else if (rawError.includes('bad auth') || rawError.includes('authentication failed') || rawError.includes('AuthenticationFailed')) {
      connectionError = 'MongoDB Authentication Failed ("bad auth"): MongoDB Atlas rejected the username or password. To resolve: (1) Open MongoDB Atlas (cloud.mongodb.com) -> Security -> Database Access, (2) Edit user "kehindeoluwaseunemmanuel_db_user" and click "Edit Password" to assign a new password, (3) Ensure Built-in Role is set to "Read and write to any database", (4) Update MONGODB_URI in your Environment Variables or Settings with the new password.';
    } else {
      connectionError = rawError;
    }

    console.warn('⚠️ MongoDB Connection Notice:', connectionError);
    console.log('ℹ️ App is running safely on local persistent JSON storage engine.');
    return false;
  }
}

/**
 * Synchronize MongoDB and local storage bidirectionally:
 * - If MongoDB already has data (e.g. after container redeploy), pull and sync MongoDB data to local storage.
 * - If MongoDB is empty for any collection, seed it with the default local data.
 */
export async function syncMongoWithLocalData(localDb: any) {
  if (!isConnected) return;

  try {
    // 1. SKILLS
    const mongoSkills = await SkillModel.find().lean();
    if (mongoSkills && mongoSkills.length > 0) {
      const cleanSkills = mongoSkills.map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category || 'Frontend',
        level: s.level ?? s.proficiency ?? 85,
        proficiency: s.proficiency ?? s.level ?? 85,
        yearsExperience: s.yearsExperience ?? s.years ?? 2,
        years: s.years ?? s.yearsExperience ?? 2,
        iconUrl: s.iconUrl || '',
        iconName: s.iconName || '',
        order: s.order !== undefined ? Number(s.order) : 0,
        featured: Boolean(s.featured)
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('skills.json', cleanSkills);
      console.log(`📥 Loaded ${cleanSkills.length} skills from MongoDB into active memory & local storage`);
    } else {
      const localSkills = localDb.getSkills();
      if (localSkills && localSkills.length > 0) {
        const normalizedSkills = localSkills.map((s: any) => ({
          ...s,
          proficiency: s.proficiency ?? s.level ?? 90,
          years: s.years ?? s.yearsExperience ?? 3
        }));
        await SkillModel.insertMany(normalizedSkills);
        console.log(`📤 Seeded ${normalizedSkills.length} local skills into MongoDB`);
      }
    }

    // 2. PROJECTS
    const mongoProjects = await ProjectModel.find().lean();
    if (mongoProjects && mongoProjects.length > 0) {
      const cleanProjects = mongoProjects.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        tagline: p.tagline || '',
        description: p.description || '',
        fullDescription: p.fullDescription || '',
        category: p.category || 'Full-Stack',
        tags: Array.isArray(p.tags) ? p.tags : [],
        image: p.image || '',
        images: Array.isArray(p.images) ? p.images : [],
        liveUrl: p.liveUrl || '',
        githubUrl: p.githubUrl || '',
        featured: Boolean(p.featured),
        order: p.order !== undefined ? Number(p.order) : 0,
        metrics: p.metrics || { stars: 0, forks: 0 }
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('projects.json', cleanProjects);
      console.log(`📥 Loaded ${cleanProjects.length} projects from MongoDB`);
    } else {
      const localProjects = localDb.getProjects();
      if (localProjects && localProjects.length > 0) {
        await ProjectModel.insertMany(localProjects);
      }
    }

    // 3. SETTINGS
    const mongoSettings = await SettingsModel.findOne().lean();
    if (mongoSettings) {
      const { _id, __v, createdAt, updatedAt, ...cleanSettings } = mongoSettings as any;
      writeJSON('settings.json', cleanSettings);
      console.log('📥 Loaded site settings from MongoDB');
    } else {
      const localSettings = localDb.getSettings();
      if (localSettings) {
        await SettingsModel.create(localSettings);
      }
    }

    // 4. CERTIFICATES (Verified Credentials)
    const mongoCertificates = await CertificateModel.find().lean();
    if (mongoCertificates && mongoCertificates.length > 0) {
      const cleanCertificates = mongoCertificates.map((c: any) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        category: c.category || 'Engineering',
        imageUrl: c.imageUrl || '',
        imagePublicId: c.imagePublicId || '',
        credentialUrl: c.credentialUrl || '',
        issueDate: c.issueDate || '',
        order: c.order !== undefined ? Number(c.order) : 0
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('certificates.json', cleanCertificates);
      console.log(`📥 Loaded ${cleanCertificates.length} certificates from MongoDB`);
    } else {
      const localCertificates = localDb.getCertificates ? localDb.getCertificates() : [];
      if (localCertificates && localCertificates.length > 0) {
        await CertificateModel.insertMany(localCertificates);
      }
    }

    // 5. CERTIFICATIONS
    const mongoCerts = await CertificationModel.find().lean();
    if (mongoCerts && mongoCerts.length > 0) {
      const cleanCerts = mongoCerts.map((c: any) => ({
        id: c.id,
        name: c.name || c.title || 'Certification',
        issuer: c.issuer || c.issuingOrg || '',
        issueDate: c.issueDate || '',
        credentialId: c.credentialId || '',
        credentialUrl: c.credentialUrl || c.url || '',
        url: c.url || c.credentialUrl || '',
        badgeImage: c.badgeImage || c.badgeImageUrl || '',
        order: c.order !== undefined ? Number(c.order) : 0
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('certifications.json', cleanCerts);
    } else {
      const localCerts = localDb.getCertifications();
      if (localCerts && localCerts.length > 0) {
        await CertificationModel.insertMany(localCerts);
      }
    }

    // 6. EXPERIENCE
    const mongoExp = await ExperienceModel.find().lean();
    if (mongoExp && mongoExp.length > 0) {
      const cleanExp = mongoExp.map((e: any) => ({
        id: e.id,
        role: e.role,
        company: e.company,
        companyUrl: e.companyUrl || '',
        companyLogoUrl: e.companyLogoUrl || '',
        location: e.location || '',
        period: e.period || (e.startDate ? `${e.startDate} - ${e.endDate || 'Present'}` : ''),
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        description: e.description || '',
        achievements: Array.isArray(e.achievements) ? e.achievements : [],
        technologies: Array.isArray(e.technologies) ? e.technologies : [],
        current: Boolean(e.current),
        order: e.order !== undefined ? Number(e.order) : 0
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('experience.json', cleanExp);
    } else {
      const getExpFn = localDb.getExperience || localDb.getExperiences;
      const localExps = getExpFn ? getExpFn.call(localDb) : [];
      if (localExps && localExps.length > 0) {
        await ExperienceModel.insertMany(localExps);
      }
    }

    // 7. EDUCATION
    const mongoEdu = await EducationModel.find().lean();
    if (mongoEdu && mongoEdu.length > 0) {
      const cleanEdu = mongoEdu.map((e: any) => ({
        id: e.id,
        degree: e.degree,
        field: e.field || e.fieldOfStudy || '',
        institution: e.institution,
        location: e.location || '',
        period: e.period || '',
        startDate: e.startDate || '',
        endDate: e.endDate || '',
        grade: e.grade || '',
        description: e.description || '',
        achievements: Array.isArray(e.achievements) ? e.achievements : [],
        order: e.order !== undefined ? Number(e.order) : 0
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      writeJSON('education.json', cleanEdu);
    } else {
      const localEdus = localDb.getEducation();
      if (localEdus && localEdus.length > 0) {
        await EducationModel.insertMany(localEdus);
      }
    }

    // 8. TESTIMONIALS
    const mongoTests = await TestimonialModel.find().lean();
    if (mongoTests && mongoTests.length > 0) {
      const cleanTests = mongoTests.map((t: any) => {
        const authorName = t.authorName || t.name || 'Client';
        const authorRole = t.authorRole || t.role || '';
        const quote = t.quote || t.content || '';
        const authorPhotoUrl = t.authorPhotoUrl || t.avatar || '';
        return {
          id: t.id,
          name: authorName,
          authorName: authorName,
          role: authorRole,
          authorRole: authorRole,
          company: t.company || '',
          content: quote,
          quote: quote,
          avatar: authorPhotoUrl,
          authorPhotoUrl: authorPhotoUrl,
          rating: t.rating || 5,
          order: t.order !== undefined ? Number(t.order) : 0
        };
      }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      writeJSON('testimonials.json', cleanTests);
    } else {
      const localTests = localDb.getTestimonials();
      if (localTests && localTests.length > 0) {
        const normalizedTests = localTests.map((t: any) => {
          const authorName = t.authorName || t.name || 'Client';
          const authorRole = t.authorRole || t.role || '';
          const quote = t.quote || t.content || '';
          const authorPhotoUrl = t.authorPhotoUrl || t.avatar || '';
          return {
            id: t.id,
            name: authorName,
            authorName: authorName,
            role: authorRole,
            authorRole: authorRole,
            company: t.company || '',
            content: quote,
            quote: quote,
            avatar: authorPhotoUrl,
            authorPhotoUrl: authorPhotoUrl,
            rating: t.rating || 5,
            order: t.order !== undefined ? Number(t.order) : 0
          };
        });
        await TestimonialModel.insertMany(normalizedTests);
      }
    }

    // 9. ADMIN
    const mongoAdmin = await AdminModel.findOne().lean();
    if (mongoAdmin) {
      writeJSON('admin.json', { email: mongoAdmin.email, passwordHash: mongoAdmin.passwordHash });
    } else {
      const localAdmin = localDb.getAdmin();
      if (localAdmin) {
        await AdminModel.create(localAdmin);
      }
    }

    // 10. CONTACT MESSAGES
    const mongoMsgs = await ContactMessageModel.find().lean();
    if (mongoMsgs && mongoMsgs.length > 0) {
      const cleanMsgs = mongoMsgs.map((m: any) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject || '',
        message: m.message,
        read: Boolean(m.read),
        timestamp: m.timestamp || new Date().toISOString()
      }));
      writeJSON('messages.json', cleanMsgs);
    } else {
      const localMsgs = localDb.getMessages();
      if (localMsgs && localMsgs.length > 0) {
        await ContactMessageModel.insertMany(localMsgs);
      }
    }

    console.log('✅ MongoDB database verified and full two-way synchronization complete!');
  } catch (err) {
    console.error('Error synchronizing MongoDB with local data:', err);
  }
}

// Alias for backward compatibility
export const seedMongoFromLocalData = syncMongoWithLocalData;
