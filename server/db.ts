import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AdminModel,
  SettingsModel,
  ProjectModel,
  ExperienceModel,
  EducationModel,
  SkillModel,
  CertificateModel,
  TestimonialModel,
  ContactMessageModel
} from './models.js';
import { getMongoStatus } from './mongodb.js';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

export function readJSON<T>(filename: string, defaultValue: T): T {
  const filePath = getFilePath(filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultValue;
  }
}

export function writeJSON<T>(filename: string, data: T): void {
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
  }
}

// Initial Seed Data
const defaultAdminPassword = bcrypt.hashSync('admin123', 10);

const initialAdmin = {
  email: 'admin@portfolio.dev',
  passwordHash: defaultAdminPassword
};

const initialSettings = {
  name: 'Oluwaseun Emmanuel Kehinde',
  role: 'Junior Full-Stack Developer',
  heroTaglines: [
    'Junior Full-Stack Developer',
    'Building Mobile-First & Responsive Web Applications',
    'HTML5, CSS3, JavaScript, TailwindCSS & PHP/Node.js',
    'Passionate about Web3 & Blockchain Technology'
  ],
  bio: 'Motivated and detail-oriented Junior Full-Stack Developer with hands-on experience in front-end development and a strong foundation in modern web technologies including HTML5, CSS3, JavaScript, TailwindCSS, PHP, Laravel, Node.js, Express.js, MySQL, MongoDB, and Web3.',
  aboutContent: `I am a motivated and detail-oriented Junior Full-Stack Developer with hands-on experience in front-end development and a strong foundation in modern web technologies.

Skilled in building responsive, mobile-first interfaces using HTML5, CSS3, JavaScript, TailwindCSS, and Bootstrap, with exposure to back-end development using PHP, Laravel, Node.js, Express.js, and databases including MySQL and MongoDB.

Eager to contribute to collaborative development projects, improve user experience, and grow within a dynamic engineering team. I am also deeply passionate about Web3, blockchain technology, and writing clean, maintainable code.

📍 Location: 33 Yemogun Road, Ogere-Remo, Ogun, Nigeria
📞 Phone: +2349037286083
✉️ Email: kehindeoluwaseunemmanuel@gmail.com
⚽ Hobbies & Interests: Coding, watching movies & anime, sports enthusiast (boxing, MMA, football - passionate Barcelona FC supporter), volleyball player, driving, cryptocurrency trading and Web3 exploration.`,
  profilePictureUrl: '',
  avatarUrl: '',
  resumeUrl: '/uploads/sample_resume.pdf',
  aboutStats: {
    yearsExperience: '2+',
    projectsDelivered: '20+',
    certifications: 'auto',
    clientRating: 'auto'
  },
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
    email: 'kehindeoluwaseunemmanuel@gmail.com'
  },
  seo: {
    siteTitle: 'Oluwaseun Emmanuel Kehinde | Junior Full-Stack Developer',
    metaDescription: 'Personal portfolio & interactive developer showcase for Oluwaseun Emmanuel Kehinde, Junior Full-Stack Developer specializing in HTML5, CSS3, JavaScript, TailwindCSS, Node.js, PHP, Laravel, and Web3.',
    faviconUrl: ''
  },
  updatedAt: new Date().toISOString()
};

const initialProjects = [
  {
    id: 'proj-1',
    title: 'Solar System Installation (Final Year Project)',
    slug: 'solar-system-installation',
    shortDescription: 'Led design and implementation of a solar power system for the Department of Computer Science in promoting sustainable energy and documenting installation processes.',
    fullDescription: 'Led the complete hardware design, load calculations, and physical implementation of a solar power system for the Department of Computer Science at Ambrose Alli University, Ekpoma.\n\n### Key Highlights\n- **Sustainable Energy**: Designed a reliable solar backup solution to power departmental computer hardware and lighting.\n- **Technical Documentation**: Authored comprehensive installation manuals, wiring schematics, and maintenance guides for department staff.\n- **Energy Management**: Conducted peak load audits to optimize battery capacity and inverter output efficiency.',
    techStack: ['Solar Power Systems', 'System Design', 'Energy Auditing', 'Technical Documentation'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: '',
    githubUrl: '',
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    title: 'Web3 Crypto Trading & Portfolio Analytics Portal',
    slug: 'web3-crypto-analytics-portal',
    shortDescription: 'Responsive Web3 dashboard built with Node.js, Express, and JavaScript for tracking cryptocurrency prices and market trends.',
    fullDescription: 'A modern responsive Web3 crypto portfolio and market exploration portal designed for real-time tracking of crypto assets, Web3 wallet metrics, and decentralized protocol analytics.',
    techStack: ['JavaScript', 'HTML5', 'TailwindCSS', 'Node.js', 'Express.js', 'Web3 API'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://github.com/kehindeoluwaseunemmanuel',
    githubUrl: 'https://github.com/kehindeoluwaseunemmanuel',
    featured: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    title: 'Interactive Secondary School Learning & Portal System',
    slug: 'school-portal-management-system',
    shortDescription: 'PHP & MySQL powered web application for lesson plan management, student grading, and academic event scheduling.',
    fullDescription: 'Designed during NYSC teaching service at Olcas College Int\'l to streamline SS student attendance, interactive problem-solving modules, and academic performance tracking.',
    techStack: ['PHP', 'Laravel', 'MySQL', 'Bootstrap', 'JavaScript', 'HTML5/CSS3'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://github.com/kehindeoluwaseunemmanuel',
    githubUrl: 'https://github.com/kehindeoluwaseunemmanuel',
    featured: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialSkills = [
  { id: 'sk-1', name: 'HTML5 & CSS3', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', level: 95, yearsExperience: 3, category: 'Frontend', order: 1 },
  { id: 'sk-2', name: 'JavaScript (ES6+)', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', level: 90, yearsExperience: 3, category: 'Frontend', order: 2 },
  { id: 'sk-3', name: 'TailwindCSS & Bootstrap', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', level: 92, yearsExperience: 3, category: 'Frontend', order: 3 },
  { id: 'sk-4', name: 'PHP & Laravel', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', level: 85, yearsExperience: 2, category: 'Backend', order: 4 },
  { id: 'sk-5', name: 'Node.js & Express.js', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', level: 85, yearsExperience: 2, category: 'Backend', order: 5 },
  { id: 'sk-6', name: 'MySQL & MongoDB', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', level: 85, yearsExperience: 2, category: 'Database', order: 6 },
  { id: 'sk-7', name: 'Web3 & Crypto Fundamentals', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', level: 80, yearsExperience: 2, category: 'Blockchain', order: 7 },
  { id: 'sk-8', name: 'Git, Figma, CorelDRAW & VS Code', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', level: 90, yearsExperience: 3, category: 'Tools & Other', order: 8 }
];

const initialExperience = [
  {
    id: 'exp-1',
    company: "Olcas College Int'l, Ipetumodu",
    role: 'Mathematics Teacher (NYSC)',
    companyLogoUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=200&q=80',
    startDate: '2024-04-01',
    endDate: '2025-02-28',
    description: '• Designed and delivered engaging lesson plans for SS (Senior Secondary) students.\n• Enhanced student problem-solving skills through interactive and practical mathematical methods.\n• Supported school events, academic activities, and overall student development.',
    order: 1
  },
  {
    id: 'exp-2',
    company: 'HiiT Plc, Ikeja, Lagos',
    role: 'Front-End Developer Intern',
    companyLogoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
    startDate: '2022-01-01',
    endDate: '2022-07-31',
    description: '• Built responsive HTML/CSS/JS web pages and mobile-first user interfaces.\n• Assisted in product design and UI/UX improvements across client applications.\n• Conducted cross-browser testing and performance audits for client web products.',
    order: 2
  }
];

const initialEducation = [
  {
    id: 'edu-1',
    institution: 'Ambrose Alli University, Ekpoma - Edo State, Nigeria',
    degree: 'BSc Computer Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2018-01-01',
    endDate: '2023-12-31',
    description: 'Graduated with Bachelor of Science in Computer Science. Specialized in software development, algorithms, web technologies, and systems engineering.',
    order: 1
  },
  {
    id: 'edu-2',
    institution: 'Ositelu Memorial College, Ogere Remo, Ogun State',
    degree: 'Secondary Education',
    fieldOfStudy: 'Science & Mathematics',
    startDate: '2012-09-01',
    endDate: '2018-07-01',
    description: 'Senior Secondary School Certificate Examination (SSCE) with distinction in science and mathematics.',
    order: 2
  }
];

const initialTestimonials = [
  {
    id: 'test-1',
    name: 'Mr. Anthony A. Oyegunle',
    authorName: 'Mr. Anthony A. Oyegunle',
    role: 'Professional Reference | +2348033165488',
    authorRole: 'Professional Reference | +2348033165488',
    company: '',
    content: 'Oluwaseun is a dedicated and highly disciplined full-stack developer with strong technical skills in web development, problem solving, and software engineering principles.',
    quote: 'Oluwaseun is a dedicated and highly disciplined full-stack developer with strong technical skills in web development, problem solving, and software engineering principles.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    order: 1
  },
  {
    id: 'test-2',
    name: 'Mr. Michael O. Kehinde',
    authorName: 'Mr. Michael O. Kehinde',
    role: 'Professional Reference | +2347030090866',
    authorRole: 'Professional Reference | +2347030090866',
    company: '',
    content: 'Oluwaseun displays exceptional initiative, attention to detail, and passion for web development, clean coding practices, and technology innovation.',
    quote: 'Oluwaseun displays exceptional initiative, attention to detail, and passion for web development, clean coding practices, and technology innovation.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    rating: 5,
    order: 2
  }
];

const initialCertificates = [
  {
    id: 'vcert-1',
    title: 'Software Development - 6-Month Professional Training Programme',
    issuer: 'TS Academy',
    category: 'WEB DEVELOPMENT',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    imagePublicId: '',
    credentialUrl: '',
    issueDate: 'Jan 01, 2026',
    order: 1
  },
  {
    id: 'vcert-2',
    title: 'Diploma in Web Design (DWD) - Distinction',
    issuer: 'HiiT Plc, Ikeja, Lagos',
    category: 'WEB DEVELOPMENT',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    imagePublicId: '',
    credentialUrl: '',
    issueDate: 'Jan 01, 2022',
    order: 2
  }
];

export const db = {
  // ADMIN
  getAdmin: async () => {
    if (getMongoStatus().connected) {
      try {
        const adminDoc = await AdminModel.findOne().lean();
        if (adminDoc) {
          return {
            email: adminDoc.email,
            passwordHash: adminDoc.passwordHash
          };
        }
      } catch (err) {
        console.warn('MongoDB query notice for admin, falling back to local storage:', err);
      }
    }
    return readJSON('admin.json', initialAdmin);
  },

  setAdmin: async (data: any) => {
    writeJSON('admin.json', data);
    if (getMongoStatus().connected) {
      try {
        await (AdminModel as any).findOneAndUpdate({}, data, { upsert: true });
      } catch (err) {
        console.warn('MongoDB write error for admin:', err);
      }
    }
    return data;
  },

  // SETTINGS
  getSettings: async () => {
    let settingsData: any = null;

    if (getMongoStatus().connected) {
      try {
        const mongoDoc = await SettingsModel.findOne().lean();
        if (mongoDoc) {
          settingsData = mongoDoc;
        }
      } catch (err) {
        console.warn('MongoDB query notice for settings, falling back to local storage:', err);
      }
    }

    if (!settingsData) {
      settingsData = readJSON('settings.json', initialSettings);
    }

    const photo =
      settingsData.profilePictureUrl ||
      settingsData.avatarUrl ||
      settingsData.avatar ||
      '';

    return {
      ...settingsData,
      aboutStats: {
        yearsExperience: '2+',
        projectsDelivered: '20+',
        certifications: 'auto',
        ...(settingsData.aboutStats || {}),
        clientRating: (!settingsData.aboutStats?.clientRating || settingsData.aboutStats.clientRating === '100%')
          ? 'auto'
          : settingsData.aboutStats.clientRating
      },
      profilePictureUrl: photo,
      avatarUrl: photo
    };
  },

  setSettings: async (data: any) => {
    let current: any = null;
    if (getMongoStatus().connected) {
      try {
        current = await SettingsModel.findOne().lean();
      } catch (e) {
        // ignore
      }
    }
    if (!current) {
      current = readJSON('settings.json', initialSettings);
    }

    const photo =
      data.profilePictureUrl !== undefined ? data.profilePictureUrl :
      data.avatarUrl !== undefined ? data.avatarUrl :
      data.avatar !== undefined ? data.avatar :
      (current.profilePictureUrl || current.avatarUrl || '');

    const updated = {
      ...current,
      ...data,
      aboutStats: {
        ...(current.aboutStats || {
          yearsExperience: '2+',
          projectsDelivered: '20+',
          certifications: 'auto',
          clientRating: 'auto'
        }),
        ...(data.aboutStats || {})
      },
      profilePictureUrl: photo,
      avatarUrl: photo,
      updatedAt: new Date().toISOString()
    };

    writeJSON('settings.json', updated);

    if (getMongoStatus().connected) {
      try {
        await (SettingsModel as any).findOneAndUpdate({}, updated, { upsert: true, new: true });
      } catch (err) {
        console.warn('MongoDB write error for settings:', err);
      }
    }

    return updated;
  },

  // PROJECTS
  getProjects: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await ProjectModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((p: any) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            tagline: p.tagline || '',
            description: p.description || '',
            shortDescription: p.shortDescription || p.description || '',
            fullDescription: p.fullDescription || '',
            category: p.category || 'Full-Stack',
            techStack: Array.isArray(p.techStack) ? p.techStack : (Array.isArray(p.tags) ? p.tags : []),
            tags: Array.isArray(p.tags) ? p.tags : (Array.isArray(p.techStack) ? p.techStack : []),
            thumbnailUrl: p.thumbnailUrl || p.image || '',
            image: p.image || p.thumbnailUrl || '',
            galleryUrls: Array.isArray(p.galleryUrls) ? p.galleryUrls : (Array.isArray(p.images) ? p.images : []),
            images: Array.isArray(p.images) ? p.images : (Array.isArray(p.galleryUrls) ? p.galleryUrls : []),
            liveUrl: p.liveUrl || '',
            githubUrl: p.githubUrl || '',
            featured: Boolean(p.featured),
            order: p.order !== undefined ? Number(p.order) : 0,
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: p.updatedAt || new Date().toISOString()
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for projects, falling back to local storage:', err);
      }
    }
    return readJSON('projects.json', []);
  },

  setProjects: async (data: any[]) => {
    writeJSON('projects.json', data);
    if (getMongoStatus().connected) {
      try {
        await ProjectModel.deleteMany({});
        if (data && data.length > 0) {
          await ProjectModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for projects:', err);
      }
    }
    return data;
  },

  deleteProject: async (id: string) => {
    let projects = await db.getProjects();
    projects = projects.filter((p: any) => p.id !== id && p._id !== id);
    writeJSON('projects.json', projects);
    if (getMongoStatus().connected) {
      try {
        await ProjectModel.deleteMany({
          $or: [
            { id: id },
            { slug: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for project:', err);
      }
    }
    return projects;
  },

  // SKILLS
  getSkills: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await SkillModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((s: any) => ({
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
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for skills, falling back to local storage:', err);
      }
    }
    return readJSON('skills.json', []);
  },

  setSkills: async (data: any[]) => {
    writeJSON('skills.json', data);
    if (getMongoStatus().connected) {
      try {
        await SkillModel.deleteMany({});
        if (data && data.length > 0) {
          await (SkillModel as any).insertMany(
            data.map((s: any) => ({
              id: s.id,
              name: s.name,
              category: s.category || 'Frontend',
              proficiency: s.level ?? s.proficiency ?? 85,
              level: s.level ?? s.proficiency ?? 85,
              years: s.yearsExperience ?? s.years ?? 2,
              yearsExperience: s.yearsExperience ?? s.years ?? 2,
              iconUrl: s.iconUrl || '',
              iconName: s.iconName || '',
              order: s.order !== undefined ? Number(s.order) : 0,
              featured: Boolean(s.featured)
            }))
          );
        }
      } catch (err) {
        console.warn('MongoDB write error for skills:', err);
      }
    }
    return data;
  },

  deleteSkill: async (id: string) => {
    let skills = await db.getSkills();
    skills = skills.filter((s: any) => s.id !== id && s._id !== id);
    writeJSON('skills.json', skills);
    if (getMongoStatus().connected) {
      try {
        await SkillModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for skill:', err);
      }
    }
    return skills;
  },

  // EXPERIENCE
  getExperience: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await ExperienceModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((e: any) => ({
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
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for experience, falling back to local storage:', err);
      }
    }
    return readJSON('experience.json', []);
  },

  getExperiences: async () => {
    return db.getExperience();
  },

  setExperience: async (data: any[]) => {
    writeJSON('experience.json', data);
    if (getMongoStatus().connected) {
      try {
        await ExperienceModel.deleteMany({});
        if (data && data.length > 0) {
          await ExperienceModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for experience:', err);
      }
    }
    return data;
  },

  deleteExperience: async (id: string) => {
    let exp = await db.getExperience();
    exp = exp.filter((e: any) => e.id !== id && e._id !== id);
    writeJSON('experience.json', exp);
    if (getMongoStatus().connected) {
      try {
        await ExperienceModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for experience:', err);
      }
    }
    return exp;
  },

  // EDUCATION
  getEducation: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await EducationModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((ed: any) => ({
            id: ed.id,
            institution: ed.institution,
            degree: ed.degree,
            fieldOfStudy: ed.fieldOfStudy || ed.field || '',
            field: ed.field || ed.fieldOfStudy || '',
            location: ed.location || '',
            period: ed.period || (ed.startDate ? `${ed.startDate} - ${ed.endDate || 'Present'}` : ''),
            startDate: ed.startDate || '',
            endDate: ed.endDate || '',
            grade: ed.grade || '',
            description: ed.description || '',
            achievements: Array.isArray(ed.achievements) ? ed.achievements : [],
            order: ed.order !== undefined ? Number(ed.order) : 0
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for education, falling back to local storage:', err);
      }
    }
    return readJSON('education.json', []);
  },

  setEducation: async (data: any[]) => {
    writeJSON('education.json', data);
    if (getMongoStatus().connected) {
      try {
        await EducationModel.deleteMany({});
        if (data && data.length > 0) {
          await EducationModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for education:', err);
      }
    }
    return data;
  },

  deleteEducation: async (id: string) => {
    let edu = await db.getEducation();
    edu = edu.filter((ed: any) => ed.id !== id && ed._id !== id);
    writeJSON('education.json', edu);
    if (getMongoStatus().connected) {
      try {
        await EducationModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for education:', err);
      }
    }
    return edu;
  },

  // TESTIMONIALS
  getTestimonials: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await TestimonialModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((t: any) => {
            const authorName = t.authorName || t.name || 'Client';
            const authorRole = t.authorRole || t.role || '';
            const quote = t.quote || t.content || '';
            const authorPhotoUrl = t.authorPhotoUrl || t.avatar || '';
            return {
              id: t.id,
              name: authorName,
              authorName,
              role: authorRole,
              authorRole,
              company: t.company || '',
              content: quote,
              quote,
              avatar: authorPhotoUrl,
              authorPhotoUrl,
              rating: t.rating || 5,
              order: t.order !== undefined ? Number(t.order) : 0
            };
          }).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for testimonials, falling back to local storage:', err);
      }
    }
    return readJSON('testimonials.json', []);
  },

  setTestimonials: async (data: any[]) => {
    writeJSON('testimonials.json', data);
    if (getMongoStatus().connected) {
      try {
        await TestimonialModel.deleteMany({});
        if (data && data.length > 0) {
          await TestimonialModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for testimonials:', err);
      }
    }
    return data;
  },

  deleteTestimonial: async (id: string) => {
    let items = await db.getTestimonials();
    items = items.filter((t: any) => t.id !== id && t._id !== id);
    writeJSON('testimonials.json', items);
    if (getMongoStatus().connected) {
      try {
        await TestimonialModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for testimonial:', err);
      }
    }
    return items;
  },

  // CERTIFICATES (Verified Credentials)
  getCertificates: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await CertificateModel.find().lean();
        if (Array.isArray(docs)) {
          const list = docs.map((c: any) => ({
            id: c.id,
            title: c.title,
            issuer: c.issuer,
            category: c.category || 'WEB DEVELOPMENT',
            imageUrl: c.imageUrl || '',
            imagePublicId: c.imagePublicId || '',
            credentialUrl: c.credentialUrl || '',
            issueDate: c.issueDate || '',
            order: c.order !== undefined ? Number(c.order) : 0
          })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
          return list;
        }
      } catch (err) {
        console.warn('MongoDB query notice for certificates, falling back to local storage:', err);
      }
    }
    return readJSON('certificates.json', []);
  },

  setCertificates: async (data: any[]) => {
    writeJSON('certificates.json', data);
    if (getMongoStatus().connected) {
      try {
        await CertificateModel.deleteMany({});
        if (data && data.length > 0) {
          await CertificateModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for certificates:', err);
      }
    }
    return data;
  },

  deleteCertificate: async (id: string) => {
    let items = await db.getCertificates();
    items = items.filter((c: any) => c.id !== id && c._id !== id);
    writeJSON('certificates.json', items);
    if (getMongoStatus().connected) {
      try {
        await CertificateModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for certificate:', err);
      }
    }
    return items;
  },

  // DEV.TO ARTICLES CACHE
  getCachedArticles: () => readJSON('articles.json', []),
  setCachedArticles: (data: any[]) => {
    writeJSON('articles.json', data);
    return data;
  },

  // MESSAGES
  getMessages: async () => {
    if (getMongoStatus().connected) {
      try {
        const docs = await ContactMessageModel.find().lean();
        if (Array.isArray(docs)) {
          return docs.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            subject: m.subject || '',
            message: m.message,
            read: Boolean(m.read),
            createdAt: m.timestamp || (m as any).createdAt || new Date().toISOString()
          })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        console.warn('MongoDB query notice for contact messages, falling back to local storage:', err);
      }
    }
    return readJSON('messages.json', []);
  },

  setMessages: async (data: any[]) => {
    writeJSON('messages.json', data);
    if (getMongoStatus().connected) {
      try {
        await ContactMessageModel.deleteMany({});
        if (data && data.length > 0) {
          await ContactMessageModel.insertMany(data);
        }
      } catch (err) {
        console.warn('MongoDB write error for messages:', err);
      }
    }
    return data;
  },

  deleteMessage: async (id: string) => {
    let msgs = await db.getMessages();
    msgs = msgs.filter((m: any) => m.id !== id && m._id !== id);
    writeJSON('messages.json', msgs);
    if (getMongoStatus().connected) {
      try {
        await ContactMessageModel.deleteMany({
          $or: [
            { id: id },
            ...(typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : [])
          ]
        });
      } catch (err) {
        console.warn('MongoDB delete error for message:', err);
      }
    }
    return msgs;
  },

  // VISITOR STATS
  getVisitorStats: () => {
    const defaultData = {
      totalVisits: 142,
      uniqueVisitorIds: ['vis-1', 'vis-2', 'vis-3', 'vis-4', 'vis-5'],
      todayVisits: {},
      recentVisits: [
        {
          id: 'v-1',
          timestamp: new Date(Date.now() - 1000 * 45).toISOString(),
          path: '/',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
          device: 'Desktop (macOS)'
        },
        {
          id: 'v-2',
          timestamp: new Date(Date.now() - 1000 * 180).toISOString(),
          path: '/#projects',
          userAgent: 'Mozilla/5.0 (iPhone; OS 17)',
          device: 'Mobile (iOS)'
        },
        {
          id: 'v-3',
          timestamp: new Date(Date.now() - 1000 * 600).toISOString(),
          path: '/#contact',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
          device: 'Desktop (Windows)'
        }
      ],
      activeSessions: {}
    };

    const data = readJSON('visitors.json', defaultData);
    const now = Date.now();
    const todayKey = new Date().toISOString().split('T')[0];

    // Clean active sessions older than 3 mins
    const activeSessions = { ...data.activeSessions };
    let activeNow = 0;
    Object.entries(activeSessions).forEach(([sid, lastActive]: [string, any]) => {
      if (now - Number(lastActive) < 180000) {
        activeNow++;
      } else {
        delete activeSessions[sid];
      }
    });

    const dailyTrend: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyTrend.push({
        date: label,
        count: data.todayVisits[dateStr] || (i === 0 ? (data.todayVisits[todayKey] || 15) : Math.floor(Math.random() * 20) + 8)
      });
    }

    return {
      totalVisits: data.totalVisits || 142,
      uniqueVisitors: (data.uniqueVisitorIds || []).length,
      todayVisits: data.todayVisits[todayKey] || 15,
      activeNow: Math.max(1, activeNow),
      recentVisits: (data.recentVisits || []).slice(0, 15),
      dailyTrend
    };
  },

  recordVisit: (sessionId: string, pathStr: string = '/', userAgent: string = '') => {
    const defaultData = {
      totalVisits: 142,
      uniqueVisitorIds: ['vis-1', 'vis-2', 'vis-3'],
      todayVisits: {},
      recentVisits: [],
      activeSessions: {}
    };

    const data = readJSON('visitors.json', defaultData);
    const now = Date.now();
    const todayKey = new Date().toISOString().split('T')[0];

    data.totalVisits = (data.totalVisits || 142) + 1;

    if (!data.uniqueVisitorIds) data.uniqueVisitorIds = [];
    if (!data.uniqueVisitorIds.includes(sessionId)) {
      data.uniqueVisitorIds.push(sessionId);
    }

    if (!data.todayVisits) data.todayVisits = {};
    data.todayVisits[todayKey] = (data.todayVisits[todayKey] || 0) + 1;

    if (!data.activeSessions) data.activeSessions = {};
    data.activeSessions[sessionId] = now;

    let device = 'Desktop Browser';
    if (/iphone|ipad|ipod|android/i.test(userAgent)) {
      device = 'Mobile Device';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      device = 'Mac Desktop';
    } else if (/windows/i.test(userAgent)) {
      device = 'Windows PC';
    } else if (/linux/i.test(userAgent)) {
      device = 'Linux Desktop';
    }

    const newVisit = {
      id: 'v-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      path: pathStr || '/',
      userAgent: userAgent ? userAgent.substring(0, 80) : 'Web Client',
      device
    };

    if (!data.recentVisits) data.recentVisits = [];
    data.recentVisits.unshift(newVisit);
    if (data.recentVisits.length > 50) {
      data.recentVisits = data.recentVisits.slice(0, 50);
    }

    writeJSON('visitors.json', data);
    return db.getVisitorStats();
  },

  recordHeartbeat: (sessionId: string) => {
    const defaultData = {
      totalVisits: 142,
      uniqueVisitorIds: ['vis-1', 'vis-2'],
      todayVisits: {},
      recentVisits: [],
      activeSessions: {}
    };

    const data = readJSON('visitors.json', defaultData);
    if (!data.activeSessions) data.activeSessions = {};
    data.activeSessions[sessionId] = Date.now();
    writeJSON('visitors.json', data);

    return db.getVisitorStats();
  }
};
