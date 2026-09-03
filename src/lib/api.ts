import {
  SiteSettings,
  Project,
  Skill,
  Experience,
  Education,
  Testimonial,
  Certificate,
  CachedArticle,
  ContactMessage,
  VisitorStats
} from '../types';

let currentAuthToken: string | null = localStorage.getItem('admin_token');

export function setAuthToken(token: string | null) {
  currentAuthToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function getAuthToken(): string | null {
  return currentAuthToken || localStorage.getItem('admin_token');
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorText = await response.text();
      if (errorText) {
        const json = JSON.parse(errorText);
        if (json.error || json.message) {
          errorMessage = json.error || json.message;
        }
      }
    } catch {
      // Ignore JSON parse error on non-ok response
    }
    throw new Error(errorMessage);
  }

  const responseText = await response.text();
  if (!responseText || responseText.trim() === '') {
    return {} as T;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText as unknown as T;
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: { email: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(data.token);
    return data;
  },
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setAuthToken(null);
  },
  checkAuth: async () => {
    return request<{ user: { email: string } }>('/api/auth/me');
  },
  updateAdminPassword: async (data: { currentPassword: string; newPassword?: string; newEmail?: string }) => {
    return request<{ success: boolean; message: string }>('/api/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Upload
  uploadFiles: async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) {
      throw new Error('No files selected');
    }

    try {
      const formData = new FormData();
      fileArray.forEach((file) => formData.append('files', file));
      const res = await request<{ urls: string[]; url: string }>('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res && res.url) {
        return res;
      }
      throw new Error('Invalid upload response');
    } catch (err) {
      console.warn('Server upload error, falling back to data URL:', err);
      const urls = await Promise.all(fileArray.map((file) => fileToDataUrl(file)));
      return { urls, url: urls[0] };
    }
  },

  // Cache helpers
  getLocalCache: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setLocalCache: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
    try {
      const serverData = await request<SiteSettings>('/api/settings');
      if (serverData && typeof serverData === 'object') {
        api.setLocalCache('settings', serverData);
        return serverData;
      }
      return api.getLocalCache<SiteSettings>('settings') || serverData;
    } catch (err) {
      console.warn('Error fetching settings, using cache:', err);
      const cached = api.getLocalCache<SiteSettings>('settings');
      if (cached) return cached;
      throw err;
    }
  },

  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await request<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    api.setLocalCache('settings', res);
    return res;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    try {
      const projects = await request<Project[]>('/api/projects');
      const cached = api.getLocalCache<Project[]>('projects');

      if (Array.isArray(projects) && projects.length > 0) {
        // If cached has different length or modified items, keep cache synced
        if (cached && cached.length > projects.length) {
          console.log('🔄 Restoring user projects from persistent local cache...');
          for (const proj of cached) {
            const exists = projects.some((p) => p.id === proj.id);
            if (!exists) {
              await request<Project>('/api/projects', {
                method: 'POST',
                body: JSON.stringify(proj)
              }).catch(() => {});
            }
          }
          const resynced = await request<Project[]>('/api/projects');
          api.setLocalCache('projects', resynced);
          return resynced;
        }
        api.setLocalCache('projects', projects);
        return projects;
      }
      return cached || projects;
    } catch (err) {
      console.warn('Error fetching projects, using cache:', err);
      const cached = api.getLocalCache<Project[]>('projects');
      if (cached) return cached;
      throw err;
    }
  },
  getProjectBySlug: (slug: string) => request<Project>(`/api/projects/${slug}`),
  createProject: async (data: Partial<Project>) => {
    const res = await request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    const current = api.getLocalCache<Project[]>('projects') || [];
    api.setLocalCache('projects', [...current, res]);
    return res;
  },
  updateProject: async (id: string, data: Partial<Project>) => {
    const res = await request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    const current = api.getLocalCache<Project[]>('projects') || [];
    const updated = current.map((p) => (p.id === id ? { ...p, ...res } : p));
    api.setLocalCache('projects', updated);
    return res;
  },
  deleteProject: async (id: string) => {
    const res = await request<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE'
    });
    const current = api.getLocalCache<Project[]>('projects') || [];
    api.setLocalCache(
      'projects',
      current.filter((p) => p.id !== id)
    );
    return res;
  },
  reorderProjects: (orders: { id: string; order: number }[]) =>
    request<{ success: boolean }>('/api/projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    }),

  // Skills
  getSkills: async (): Promise<Skill[]> => {
    try {
      const skills = await request<Skill[]>('/api/skills');
      if (Array.isArray(skills)) {
        api.setLocalCache('skills', skills);
        return skills;
      }
      return api.getLocalCache<Skill[]>('skills') || [];
    } catch {
      return api.getLocalCache<Skill[]>('skills') || [];
    }
  },
  createSkill: (data: Partial<Skill>) =>
    request<Skill>('/api/skills', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateSkill: (id: string, data: Partial<Skill>) =>
    request<Skill>(`/api/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteSkill: (id: string) =>
    request<{ success: boolean }>(`/api/skills/${id}`, {
      method: 'DELETE'
    }),
  reorderSkills: (orders: { id: string; order: number }[]) =>
    request<{ success: boolean; skills: Skill[] }>('/api/skills/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    }),

  // Experience
  getExperience: async (): Promise<Experience[]> => {
    try {
      const exp = await request<Experience[]>('/api/experience');
      if (Array.isArray(exp)) {
        api.setLocalCache('experience', exp);
        return exp;
      }
      return api.getLocalCache<Experience[]>('experience') || [];
    } catch {
      return api.getLocalCache<Experience[]>('experience') || [];
    }
  },
  createExperience: (data: Partial<Experience>) =>
    request<Experience>('/api/experience', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateExperience: (id: string, data: Partial<Experience>) =>
    request<Experience>(`/api/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteExperience: (id: string) =>
    request<{ success: boolean }>(`/api/experience/${id}`, {
      method: 'DELETE'
    }),

  // Education
  getEducation: async (): Promise<Education[]> => {
    try {
      const edu = await request<Education[]>('/api/education');
      if (Array.isArray(edu)) {
        api.setLocalCache('education', edu);
        return edu;
      }
      return api.getLocalCache<Education[]>('education') || [];
    } catch {
      return api.getLocalCache<Education[]>('education') || [];
    }
  },
  createEducation: (data: Partial<Education>) =>
    request<Education>('/api/education', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateEducation: (id: string, data: Partial<Education>) =>
    request<Education>(`/api/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteEducation: (id: string) =>
    request<{ success: boolean }>(`/api/education/${id}`, {
      method: 'DELETE'
    }),

  // Testimonials
  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
      const test = await request<Testimonial[]>('/api/testimonials');
      if (Array.isArray(test)) {
        api.setLocalCache('testimonials', test);
        return test;
      }
      return api.getLocalCache<Testimonial[]>('testimonials') || [];
    } catch {
      return api.getLocalCache<Testimonial[]>('testimonials') || [];
    }
  },
  createTestimonial: (data: Partial<Testimonial>) =>
    request<Testimonial>('/api/testimonials', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTestimonial: (id: string, data: Partial<Testimonial>) =>
    request<Testimonial>(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTestimonial: (id: string) =>
    request<{ success: boolean }>(`/api/testimonials/${id}`, {
      method: 'DELETE'
    }),

  // Certificates (Verified Credentials)
  getCertificates: async (): Promise<Certificate[]> => {
    try {
      const certs = await request<Certificate[]>('/api/certificates');
      if (Array.isArray(certs)) {
        api.setLocalCache('certificates', certs);
        return certs;
      }
      return api.getLocalCache<Certificate[]>('certificates') || [];
    } catch {
      return api.getLocalCache<Certificate[]>('certificates') || [];
    }
  },
  createCertificate: (data: Partial<Certificate> | FormData) => {
    const isFormData = data instanceof FormData;
    return request<Certificate>('/api/certificates', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  updateCertificate: (id: string, data: Partial<Certificate> | FormData) => {
    const isFormData = data instanceof FormData;
    return request<Certificate>(`/api/certificates/${id}`, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  deleteCertificate: (id: string) =>
    request<{ success: boolean }>(`/api/certificates/${id}`, {
      method: 'DELETE'
    }),
  reorderCertificates: (orders: { id: string; order: number }[]) =>
    request<{ success: boolean; certificates: Certificate[] }>('/api/certificates/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    }),

  // News
  getNews: async (): Promise<CachedArticle[]> => {
    try {
      const news = await request<CachedArticle[]>('/api/news');
      if (Array.isArray(news)) {
        api.setLocalCache('news', news);
        return news;
      }
      return api.getLocalCache<CachedArticle[]>('news') || [];
    } catch {
      return api.getLocalCache<CachedArticle[]>('news') || [];
    }
  },
  refreshNews: () =>
    request<{ success: boolean; count: number; articles: CachedArticle[] }>('/api/news/refresh', {
      method: 'POST'
    }),

  // Contact
  sendContactMessage: (data: { name: string; email: string; message: string }) =>
    request<{ success: boolean; message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getContactMessages: () => request<ContactMessage[]>('/api/contact'),
  markContactRead: (id: string) =>
    request<{ success: boolean }>(`/api/contact/${id}/read`, { method: 'PATCH' }),
  deleteContactMessage: (id: string) =>
    request<{ success: boolean }>(`/api/contact/${id}`, { method: 'DELETE' }),

  // Visitor & Traffic Analytics
  getVisitorStats: () => request<VisitorStats>('/api/analytics/stats'),
  recordVisit: (data: { sessionId: string; path?: string; userAgent?: string }) =>
    request<{ success: boolean; stats: VisitorStats }>('/api/analytics/visit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  sendHeartbeat: (sessionId: string) =>
    request<{ success: boolean; activeNow: number }>('/api/analytics/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ sessionId })
    }),

  // System & Database Engine Status
  getSystemStatus: () =>
    request<{
      database: { type: string; status: string; details: any };
      storage: { type: string; status: string; cloudName: string | null };
    }>('/api/system/status'),

  // GitHub Contributions
  getGithubContributions: (username?: string) =>
    request<{
      username: string;
      totalContributions: number;
      contributions: Array<{ date: string; count: number; level: number }>;
      currentStreak: number;
      maxStreak: number;
      isFallback?: boolean;
    }>(`/api/github/contributions${username ? `?username=${encodeURIComponent(username)}` : ''}`)
};

export function getSafeDocumentUrl(url?: string, mode: 'view' | 'download' = 'view'): string {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  const downloadParam = mode === 'download' ? '&download=1' : '';
  if (trimmed.startsWith('/api/document/proxy')) {
    if (mode === 'download' && !trimmed.includes('download=1')) {
      return `${trimmed}${trimmed.includes('?') ? '&' : '?'}download=1`;
    }
    return trimmed;
  }
  return `/api/document/proxy?url=${encodeURIComponent(trimmed)}${downloadParam}`;
}

