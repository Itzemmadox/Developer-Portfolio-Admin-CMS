import mongoose, { Schema } from 'mongoose';

// Admin Schema
const AdminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
}, { timestamps: true });

// Settings Schema
const SettingsSchema = new Schema({
  name: { type: String, default: 'Emmanuel Oluwaseun' },
  role: { type: String, default: 'Senior Full-Stack Engineer & System Architect' },
  heroTaglines: [{ type: String }],
  bio: { type: String },
  aboutContent: { type: String },
  avatarUrl: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  location: { type: String, default: 'London, UK / Remote' },
  statusText: { type: String, default: 'Available for high-impact projects' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    email: { type: String, default: 'emmanuel@portfolio.dev' }
  }
}, { timestamps: true });

// Project Schema
const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true },
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  category: { type: String, default: 'Full-Stack' },
  tags: [{ type: String }],
  image: { type: String, default: '' },
  images: [{ type: String }],
  liveUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  metrics: {
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Experience Schema
const ExperienceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  company: { type: String, required: true },
  companyUrl: { type: String, default: '' },
  companyLogoUrl: { type: String, default: '' },
  location: { type: String, default: '' },
  period: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  achievements: [{ type: String }],
  technologies: [{ type: String }],
  current: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Education Schema
const EducationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  fieldOfStudy: { type: String, default: '' },
  institution: { type: String, required: true },
  location: { type: String, default: '' },
  period: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  grade: { type: String, default: '' },
  description: { type: String, default: '' },
  achievements: [{ type: String }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Skill Schema
const SkillSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Frontend' },
  proficiency: { type: Number, default: 90 },
  level: { type: Number, default: 90 },
  years: { type: Number, default: 3 },
  yearsExperience: { type: Number, default: 3 },
  featured: { type: Boolean, default: false },
  iconName: { type: String, default: '' },
  iconUrl: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Certification Schema
const CertificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  title: { type: String, default: '' },
  issuer: { type: String, default: '' },
  issuingOrg: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  credentialId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  url: { type: String, default: '' },
  badgeImage: { type: String, default: '' },
  badgeImageUrl: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Certificate Schema (New verified credentials data model)
const CertificateSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  issuer: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, default: '' },
  credentialUrl: { type: String, default: '' },
  issueDate: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Testimonial Schema
const TestimonialSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  authorName: { type: String, default: '' },
  role: { type: String, default: '' },
  authorRole: { type: String, default: '' },
  company: { type: String, default: '' },
  avatar: { type: String, default: '' },
  authorPhotoUrl: { type: String, default: '' },
  content: { type: String, default: '' },
  quote: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  order: { type: Number, default: 0 }
}, { timestamps: true });

// Contact Message Schema
const ContactMessageSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

// Visitor Analytics Schema
const VisitorAnalyticsSchema = new Schema({
  key: { type: String, default: 'global_analytics', unique: true },
  totalVisits: { type: Number, default: 142 },
  uniqueVisitorIds: [{ type: String }],
  todayVisits: { type: Map, of: Number, default: {} },
  recentVisits: [{
    id: String,
    timestamp: String,
    path: String,
    userAgent: String,
    device: String
  }],
  activeSessions: { type: Map, of: String, default: {} }
}, { timestamps: true });

export const AdminModel = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
export const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export const ExperienceModel = mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
export const EducationModel = mongoose.models.Education || mongoose.model('Education', EducationSchema);
export const SkillModel = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
export const CertificationModel = mongoose.models.Certification || mongoose.model('Certification', CertificationSchema);
export const CertificateModel = mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);
export const TestimonialModel = mongoose.models.Testimonial || mongoose.model('Testimonial', TestimonialSchema);
export const ContactMessageModel = mongoose.models.ContactMessage || mongoose.model('ContactMessage', ContactMessageSchema);
export const VisitorAnalyticsModel = mongoose.models.VisitorAnalytics || mongoose.model('VisitorAnalytics', VisitorAnalyticsSchema);
