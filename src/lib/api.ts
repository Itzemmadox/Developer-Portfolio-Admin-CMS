import {
  SiteSettings,
  Project,
  Skill,
  Experience,
  Education,
  Testimonial,
  Certification,
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

  // Settings
  getSettings: () => request<SiteSettings>('/api/settings'),
  updateSettings: (data: Partial<SiteSettings>) =>
    request<SiteSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Projects
  getProjects: () => request<Project[]>('/api/projects'),
  getProjectBySlug: (slug: string) => request<Project>(`/api/projects/${slug}`),
  createProject: (data: Partial<Project>) =>
    request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateProject: (id: string, data: Partial<Project>) =>
    request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteProject: (id: string) =>
    request<{ success: boolean }>(`/api/projects/${id}`, {
      method: 'DELETE'
    }),
  reorderProjects: (orders: { id: string; order: number }[]) =>
    request<{ success: boolean }>('/api/projects/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orders })
    }),

  // Skills
  getSkills: () => request<Skill[]>('/api/skills'),
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

  // Experience
  getExperience: () => request<Experience[]>('/api/experience'),
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
  getEducation: () => request<Education[]>('/api/education'),
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
  getTestimonials: () => request<Testimonial[]>('/api/testimonials'),
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

  // Certifications
  getCertifications: () => request<Certification[]>('/api/certifications'),
  createCertification: (data: Partial<Certification>) =>
    request<Certification>('/api/certifications', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateCertification: (id: string, data: Partial<Certification>) =>
    request<Certification>(`/api/certifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteCertification: (id: string) =>
    request<{ success: boolean }>(`/api/certifications/${id}`, {
      method: 'DELETE'
    }),

  // News
  getNews: () => request<CachedArticle[]>('/api/news'),
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
    })
};
