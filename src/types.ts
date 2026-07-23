export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  thumbnailUrl: string;
  galleryUrls: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  iconUrl?: string;
  level: number; // 0 to 100
  yearsExperience: number;
  category: 'Frontend' | 'Backend' | 'Cloud & DevOps' | 'Database' | 'Tools & Other';
  order: number;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  companyLogoUrl?: string;
  startDate: string;
  endDate?: string; // empty string or null means "Present"
  description: string;
  order: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  description: string;
  order: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
  authorPhotoUrl?: string;
  order: number;
}

export interface Certification {
  id: string;
  title: string;
  issuingOrg: string;
  issueDate: string;
  credentialUrl?: string;
  badgeImageUrl?: string;
  order: number;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
}

export interface SEOConfig {
  siteTitle: string;
  metaDescription: string;
  faviconUrl?: string;
}

export interface SiteSettings {
  name: string;
  role: string;
  heroTaglines: string[];
  aboutContent: string;
  bio: string;
  profilePictureUrl: string;
  resumeUrl: string;
  socialLinks: SocialLinks;
  seo: SEOConfig;
  updatedAt: string;
}

export interface CachedArticle {
  id: string;
  sourceId: string;
  title: string;
  description: string;
  coverImageUrl: string;
  url: string;
  author: string;
  publishedAt: string;
  tags: string[];
  fetchedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface RecentVisit {
  id: string;
  timestamp: string;
  path: string;
  userAgent: string;
  device: string;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  activeNow: number;
  recentVisits: RecentVisit[];
  dailyTrend: Array<{ date: string; count: number }>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
}
