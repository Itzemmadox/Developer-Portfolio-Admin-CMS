import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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
  name: 'Emmanuel Oluwaseun',
  role: 'Senior Full-Stack Engineer & System Architect',
  heroTaglines: [
    'Building Scalable Full-Stack Systems',
    'Crafting Intuitive User Interfaces',
    'Architecting Cloud-Native Applications',
    'Automating Modern Workflows'
  ],
  bio: 'Passionate Senior Full-Stack Engineer with 6+ years of experience designing high-throughput web architectures, real-time interactive apps, and elegant client solutions.',
  aboutContent: `I am a Senior Full-Stack Engineer with a deep passion for building robust, scalable applications that solve real-world problems. Over the past 6+ years, I have engineered complex enterprise platforms, high-performance APIs, and interactive web tools.

My expertise spans across modern frontend frameworks (React, Next.js, Vue, Three.js) and backend ecosystems (Node.js, Express, Python, PostgreSQL, Redis, Docker). I care deeply about clean code, performance optimization, modular component design, and seamless user experiences.

When I'm not coding, I contribute to open-source software, mentor aspiring developers, and publish articles about modern web engineering and cloud systems.`,
  profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  resumeUrl: '/uploads/sample_resume.pdf',
  socialLinks: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    twitter: 'https://x.com',
    email: 'emmanuel@portfolio.dev'
  },
  seo: {
    siteTitle: 'Emmanuel Oluwaseun | Senior Full-Stack Engineer',
    metaDescription: 'Personal portfolio & interactive project showcase for Emmanuel Oluwaseun, Senior Full-Stack Engineer specializing in React, Node.js, and Cloud Systems.',
    faviconUrl: ''
  },
  updatedAt: new Date().toISOString()
};

const initialProjects = [
  {
    id: 'proj-1',
    title: 'Aura AI - Distributed Intelligence Platform',
    slug: 'aura-ai-platform',
    shortDescription: 'Enterprise AI orchestration platform for context-aware multi-agent workflows and real-time streaming LLM analytics.',
    fullDescription: 'Aura AI is an enterprise-grade platform designed to streamline complex LLM workflow orchestration. Built with React, Express, WebSockets, and Redis, it handles streaming inferences, custom vector embeddings retrieval, and real-time agent execution pipelines.\n\n### Key Highlights\n- **Sub-100ms Latency**: Streamlined chunk token processing via SSE and WebSockets.\n- **Agent Visualizer**: Custom node-based flow editor for prompt chaining.\n- **Security**: Built-in OAuth2 authorization and granular token usage rate limits.',
    techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'Redis', 'Gemini API'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://example.com/aura-ai',
    githubUrl: 'https://github.com/example/aura-ai',
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    title: 'Nexus Cloud Monitoring & Observability',
    slug: 'nexus-cloud-observability',
    shortDescription: 'High-throughput telemetry dashboard tracking microservices metrics, request traces, and real-time incident alerts.',
    fullDescription: 'Nexus Cloud provides continuous visibility into microservice health and distributed infrastructure. It parses millions of telemetry events per second using Node.js stream processing and visualizes latency histograms and error budgets in real time.',
    techStack: ['TypeScript', 'React', 'D3.js', 'Express', 'Docker', 'PostgreSQL'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://example.com/nexus',
    githubUrl: 'https://github.com/example/nexus-cloud',
    featured: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    title: 'Vivid Studio - WebGL 3D Canvas Editor',
    slug: 'vivid-studio-3d-editor',
    shortDescription: 'In-browser 3D model customizer and interactive scene composer powered by Three.js and WebGL shaders.',
    fullDescription: 'Vivid Studio empowers creators to manipulate 3D geometry, apply physically-based rendering (PBR) materials, tweak lighting environments, and export optimized GLTF models directly in the browser.',
    techStack: ['Three.js', 'React', 'TypeScript', 'GLSL Shaders', 'Tailwind CSS'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://example.com/vivid-3d',
    githubUrl: 'https://github.com/example/vivid-studio',
    featured: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-4',
    title: 'Horizon Fintech - High-Frequency Trading UI',
    slug: 'horizon-fintech-trading',
    shortDescription: 'Ultra-fast financial trading terminal featuring real-time WebSocket order books and order execution tools.',
    fullDescription: 'Horizon Fintech is built for rapid market data processing. It renders live candlestick charts, order depth visualizers, and algorithmic execution controls with 60 FPS UI responsiveness under extreme load.',
    techStack: ['React', 'WebSockets', 'Recharts', 'Tailwind CSS', 'Node.js'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80'
    ],
    liveUrl: 'https://example.com/horizon-trade',
    githubUrl: 'https://github.com/example/horizon-trade',
    featured: false,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialSkills = [
  { id: 'sk-1', name: 'TypeScript / JavaScript', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', level: 95, yearsExperience: 6, category: 'Frontend', order: 1 },
  { id: 'sk-2', name: 'React / Next.js', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', level: 92, yearsExperience: 6, category: 'Frontend', order: 2 },
  { id: 'sk-3', name: 'Three.js / WebGL', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/threejs/threejs-original.svg', level: 85, yearsExperience: 3, category: 'Frontend', order: 3 },
  { id: 'sk-4', name: 'Node.js & Express', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', level: 90, yearsExperience: 5, category: 'Backend', order: 4 },
  { id: 'sk-5', name: 'Python & FastAPI', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', level: 82, yearsExperience: 4, category: 'Backend', order: 5 },
  { id: 'sk-6', name: 'PostgreSQL & MongoDB', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', level: 88, yearsExperience: 5, category: 'Database', order: 6 },
  { id: 'sk-7', name: 'Docker & Kubernetes', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', level: 80, yearsExperience: 4, category: 'Cloud & DevOps', order: 7 },
  { id: 'sk-8', name: 'AWS & Cloud Infrastructure', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg', level: 84, yearsExperience: 4, category: 'Cloud & DevOps', order: 8 },
  { id: 'sk-9', name: 'Tailwind CSS', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', level: 96, yearsExperience: 5, category: 'Frontend', order: 9 },
  { id: 'sk-10', name: 'Git / GitHub CI/CD', iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', level: 92, yearsExperience: 6, category: 'Tools & Other', order: 10 }
];

const initialExperience = [
  {
    id: 'exp-1',
    company: 'Apex Cloud Technologies',
    role: 'Lead Full-Stack Engineer',
    companyLogoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
    startDate: '2023-01-01',
    endDate: '', // Present
    description: 'Directed architectural decisions for microservices serving over 2M active monthly users. Mentored a team of 8 engineers, reduced bundle sizes by 42%, and spearheaded real-time collaboration features.',
    order: 1
  },
  {
    id: 'exp-2',
    company: 'Strata Software Labs',
    role: 'Senior Frontend Developer',
    companyLogoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=200&q=80',
    startDate: '2021-03-01',
    endDate: '2022-12-31',
    description: 'Engineered high-performance web dashboards with React and D3. Implemented robust state management patterns, optimized WebGL render pipelines, and improved test coverage from 55% to 90%.',
    order: 2
  },
  {
    id: 'exp-3',
    company: 'Quantum Digital Interactive',
    role: 'Full-Stack Software Engineer',
    companyLogoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&q=80',
    startDate: '2019-06-01',
    endDate: '2021-02-28',
    description: 'Developed REST APIs, database schemas, and client applications. Integrated payment webhooks, OAuth2 SSO, and multi-tenant user access control.',
    order: 3
  }
];

const initialEducation = [
  {
    id: 'edu-1',
    institution: 'University of Technology & Science',
    degree: 'Bachelor of Science (B.S.)',
    fieldOfStudy: 'Computer Science & Software Engineering',
    startDate: '2015-09-01',
    endDate: '2019-05-30',
    description: 'Graduated First Class Honors. Specialization in Distributed Systems, Data Structures, and Computer Graphics.',
    order: 1
  }
];

const initialTestimonials = [
  {
    id: 'test-1',
    quote: 'Emmanuel is an exceptional software engineer. His ability to take complex backend architectures and pair them with fluid, intuitive frontends transformed our product cycle speed.',
    authorName: 'Sarah Jenkins',
    authorRole: 'VP of Engineering at Apex Cloud',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    order: 1
  },
  {
    id: 'test-2',
    quote: 'Rarely do you find an engineer who excels at system performance, 3D graphics, and user experience simultaneously. Emmanuel delivered our core WebGL platform well ahead of schedule.',
    authorName: 'David Vance',
    authorRole: 'Chief Product Officer at Vivid Studio',
    authorPhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    order: 2
  }
];

const initialCertifications = [
  {
    id: 'cert-1',
    title: 'AWS Certified Solutions Architect – Associate',
    issuingOrg: 'Amazon Web Services (AWS)',
    issueDate: '2023-04-15',
    credentialUrl: 'https://aws.amazon.com/verification',
    badgeImageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=200&q=80',
    order: 1
  },
  {
    id: 'cert-2',
    title: 'Meta Senior Full-Stack Engineer Certification',
    issuingOrg: 'Meta Professional Certificates',
    issueDate: '2022-08-10',
    credentialUrl: 'https://coursera.org/verify/meta',
    badgeImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    order: 2
  }
];

export const db = {
  getAdmin: () => readJSON('admin.json', initialAdmin),
  setAdmin: (data: any) => {
    writeJSON('admin.json', data);
    return data;
  },

  getSettings: () => readJSON('settings.json', initialSettings),
  setSettings: (data: any) => {
    const current = readJSON('settings.json', initialSettings);
    const updated = { ...current, ...data, updatedAt: new Date().toISOString() };
    writeJSON('settings.json', updated);
    return updated;
  },

  getProjects: () => readJSON('projects.json', initialProjects),
  setProjects: (data: any[]) => {
    writeJSON('projects.json', data);
    return data;
  },

  getSkills: () => readJSON('skills.json', initialSkills),
  setSkills: (data: any[]) => {
    writeJSON('skills.json', data);
    return data;
  },

  getExperience: () => readJSON('experience.json', initialExperience),
  setExperience: (data: any[]) => {
    writeJSON('experience.json', data);
    return data;
  },

  getEducation: () => readJSON('education.json', initialEducation),
  setEducation: (data: any[]) => {
    writeJSON('education.json', data);
    return data;
  },

  getTestimonials: () => readJSON('testimonials.json', initialTestimonials),
  setTestimonials: (data: any[]) => {
    writeJSON('testimonials.json', data);
    return data;
  },

  getCertifications: () => readJSON('certifications.json', initialCertifications),
  setCertifications: (data: any[]) => {
    writeJSON('certifications.json', data);
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
