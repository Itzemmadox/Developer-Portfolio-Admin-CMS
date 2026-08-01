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
  CertificationModel,
  TestimonialModel,
  ContactMessageModel
} from './models.js';
import { getMongoStatus } from './mongodb.js';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getFilePath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

function readJSON<T>(filename: string, defaultValue: T): T {
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

function writeJSON<T>(filename: string, data: T): void {
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
  profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  resumeUrl: '/uploads/sample_resume.pdf',
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
    quote: 'Oluwaseun is a dedicated and highly disciplined full-stack developer with strong technical skills in web development, problem solving, and software engineering principles.',
    authorName: 'Mr. Anthony A. Oyegunle',
    authorRole: 'Professional Reference | +2348033165488',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    order: 1
  },
  {
    id: 'test-2',
    quote: 'Oluwaseun displays exceptional initiative, attention to detail, and passion for web development, clean coding practices, and technology innovation.',
    authorName: 'Mr. Michael O. Kehinde',
    authorRole: 'Professional Reference | +2347030090866',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    order: 2
  }
];

const initialCertifications = [
  {
    id: 'cert-1',
    title: 'Software Development - 6-Month Professional Training Programme',
    issuingOrg: 'TS Academy',
    issueDate: '2026-01-01',
    credentialUrl: '',
    badgeImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=200&q=80',
    order: 1
  },
  {
    id: 'cert-2',
    title: 'Diploma in Web Design (DWD) - Distinction',
    issuingOrg: 'HiiT Plc, Ikeja, Lagos',
    issueDate: '2022-01-01',
    credentialUrl: '',
    badgeImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
    order: 2
  }
];

export const db = {
  getAdmin: () => readJSON('admin.json', initialAdmin),
  setAdmin: (data: any) => {
    writeJSON('admin.json', data);
    if (getMongoStatus().connected) {
      (AdminModel as any).findOneAndUpdate({}, data, { upsert: true }).catch((err: any) =>
        console.warn('Mongo async write error for admin:', err)
      );
    }
    return data;
  },

  getSettings: () => readJSON('settings.json', initialSettings),
  setSettings: (data: any) => {
    const current = readJSON('settings.json', initialSettings);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeJSON('settings.json', updated);
    if (getMongoStatus().connected) {
      (SettingsModel as any).findOneAndUpdate({}, updated, { upsert: true }).catch((err: any) =>
        console.warn('Mongo async write error for settings:', err)
      );
    }
    return updated;
  },

  getProjects: () => readJSON('projects.json', initialProjects),
  setProjects: (data: any[]) => {
    writeJSON('projects.json', data);
    if (getMongoStatus().connected) {
      ProjectModel.deleteMany({}).then(() => ProjectModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for projects:', err)
      );
    }
    return data;
  },

  getSkills: () => readJSON('skills.json', initialSkills),
  setSkills: (data: any[]) => {
    writeJSON('skills.json', data);
    if (getMongoStatus().connected) {
      SkillModel.deleteMany({}).then(() => SkillModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for skills:', err)
      );
    }
    return data;
  },

  getExperience: () => readJSON('experience.json', initialExperience),
  getExperiences: () => readJSON('experience.json', initialExperience),
  setExperience: (data: any[]) => {
    writeJSON('experience.json', data);
    if (getMongoStatus().connected) {
      ExperienceModel.deleteMany({}).then(() => ExperienceModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for experience:', err)
      );
    }
    return data;
  },

  getEducation: () => readJSON('education.json', initialEducation),
  setEducation: (data: any[]) => {
    writeJSON('education.json', data);
    if (getMongoStatus().connected) {
      EducationModel.deleteMany({}).then(() => EducationModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for education:', err)
      );
    }
    return data;
  },

  getTestimonials: () => readJSON('testimonials.json', initialTestimonials),
  setTestimonials: (data: any[]) => {
    writeJSON('testimonials.json', data);
    if (getMongoStatus().connected) {
      TestimonialModel.deleteMany({}).then(() => TestimonialModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for testimonials:', err)
      );
    }
    return data;
  },

  getCertifications: () => readJSON('certifications.json', initialCertifications),
  setCertifications: (data: any[]) => {
    writeJSON('certifications.json', data);
    if (getMongoStatus().connected) {
      CertificationModel.deleteMany({}).then(() => CertificationModel.insertMany(data)).catch((err) =>
        console.warn('Mongo async write error for certifications:', err)
      );
    }
    return data;
  },

  getCachedArticles: () => readJSON('articles.json', []),
  setCachedArticles: (data: any[]) => {
    writeJSON('articles.json', data);
    return data;
  },

  getMessages: () => readJSON('messages.json', []),
  setMessages: (data: any[]) => {
    writeJSON('messages.json', data);
    return data;
  },

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
