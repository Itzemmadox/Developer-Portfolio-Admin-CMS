import mongoose from 'mongoose';
import {
  AdminModel,
  SettingsModel,
  ProjectModel,
  ExperienceModel,
  EducationModel,
  SkillModel,
  CertificationModel,
  TestimonialModel,
  ContactMessageModel,
  VisitorAnalyticsModel
} from './models';

let isConnected = false;
let connectionError: string | null = null;

export const getMongoStatus = () => {
  return {
    configured: Boolean(process.env.MONGODB_URI),
    connected: isConnected,
    connectionState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    error: connectionError
  };
};

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️ MONGODB_URI not provided. Running on local storage engine.');
    return false;
  }

  // Filter out dummy placeholder connection strings
  if (
    uri.includes('username:password') ||
    uri.includes('<username>') ||
    uri.includes('your_mongodb_uri')
  ) {
    connectionError = 'MONGODB_URI is set to default placeholder. Please set your actual MongoDB Atlas URI in environment variables.';
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
