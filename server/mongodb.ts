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
} from './models';

let isConnected = false;
let connectionError: string | null = null;

export function getEffectiveMongoUri(): string {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const configPath = path.join(process.cwd(), 'data', 'env.json');
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (data.MONGODB_URI) return data.MONGODB_URI;
    }
  } catch (e) {
    // ignore
  }
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
      serverSelectionTimeoutMS: 3500 // 3.5 seconds connection timeout
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
 * Seed MongoDB with initial data from local JSON storage if MongoDB collections are currently empty.
 */
export async function seedMongoFromLocalData(localDb: any) {
  if (!isConnected) return;

  try {
    // Admin
    const adminCount = await AdminModel.countDocuments();
    if (adminCount === 0) {
      const localAdmin = localDb.getAdmin();
      if (localAdmin) {
        await AdminModel.create(localAdmin);
      }
    }

    // Settings
    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      const localSettings = localDb.getSettings();
      if (localSettings) {
        await SettingsModel.create(localSettings);
      }
    }

    // Projects
    const projectCount = await ProjectModel.countDocuments();
    if (projectCount === 0) {
      const localProjects = localDb.getProjects();
      if (localProjects && localProjects.length > 0) {
        await ProjectModel.insertMany(localProjects);
      }
    }

    // Experience
    const expCount = await ExperienceModel.countDocuments();
    if (expCount === 0) {
      const getExpFn = localDb.getExperience || localDb.getExperiences;
      const localExps = getExpFn ? getExpFn.call(localDb) : [];
      if (localExps && localExps.length > 0) {
        const normalizedExps = localExps.map((e: any) => ({
          ...e,
          period: e.period || (e.startDate ? `${e.startDate} - ${e.endDate || 'Present'}` : '2021 - Present')
        }));
        await ExperienceModel.insertMany(normalizedExps);
      }
    }

    // Education
    const eduCount = await EducationModel.countDocuments();
    if (eduCount === 0) {
      const localEdus = localDb.getEducation();
      if (localEdus && localEdus.length > 0) {
        const normalizedEdus = localEdus.map((e: any) => ({
          ...e,
          period: e.period || (e.startDate ? `${e.startDate} - ${e.endDate || 'Present'}` : '2015 - 2019'),
          field: e.field || e.fieldOfStudy || ''
        }));
        await EducationModel.insertMany(normalizedEdus);
      }
    }

    // Skills
    const skillCount = await SkillModel.countDocuments();
    if (skillCount === 0) {
      const localSkills = localDb.getSkills();
      if (localSkills && localSkills.length > 0) {
        const normalizedSkills = localSkills.map((s: any) => ({
          ...s,
          proficiency: s.proficiency ?? s.level ?? 90,
          years: s.years ?? s.yearsExperience ?? 3
        }));
        await SkillModel.insertMany(normalizedSkills);
      }
    }

    // Certifications
    const certCount = await CertificationModel.countDocuments();
    if (certCount === 0) {
      const localCerts = localDb.getCertifications();
      if (localCerts && localCerts.length > 0) {
        const normalizedCerts = localCerts.map((c: any) => ({
          ...c,
          name: c.name || c.title || 'Certification',
          issuer: c.issuer || c.issuingOrg || 'Organization',
          url: c.url || c.credentialUrl || '',
          badgeImage: c.badgeImage || c.badgeImageUrl || ''
        }));
        await CertificationModel.insertMany(normalizedCerts);
      }
    }

    // Certificates (Verified Credentials)
    const certificateCount = await CertificateModel.countDocuments();
    if (certificateCount === 0) {
      const localCertificates = localDb.getCertificates ? localDb.getCertificates() : [];
      if (localCertificates && localCertificates.length > 0) {
        await CertificateModel.insertMany(localCertificates);
      }
    }

    // Testimonials
    const testCount = await TestimonialModel.countDocuments();
    if (testCount === 0) {
      const localTests = localDb.getTestimonials();
      if (localTests && localTests.length > 0) {
        const normalizedTests = localTests.map((t: any) => ({
          ...t,
          name: t.name || t.authorName || 'Client',
          role: t.role || t.authorRole || '',
          content: t.content || t.quote || '',
          avatar: t.avatar || t.authorPhotoUrl || ''
        }));
        await TestimonialModel.insertMany(normalizedTests);
      }
    }

    // Messages
    const msgCount = await ContactMessageModel.countDocuments();
    if (msgCount === 0) {
      const localMsgs = localDb.getMessages();
      if (localMsgs && localMsgs.length > 0) {
        await ContactMessageModel.insertMany(localMsgs);
      }
    }

    console.log('✅ MongoDB database verified and synchronized!');
  } catch (err) {
    console.error('Error seeding MongoDB from local JSON data:', err);
  }
}
