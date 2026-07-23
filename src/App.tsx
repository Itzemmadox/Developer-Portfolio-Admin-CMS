import React, { useState, useEffect } from 'react';
import {
  SiteSettings,
  Project,
  Skill,
  Experience,
  Education,
  Testimonial,
  Certification,
  CachedArticle,
  ContactMessage
} from './types';
import { api } from './lib/api';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { About } from './components/public/About';
import { Skills } from './components/public/Skills';
import { Experience as ExperienceSection } from './components/public/Experience';
import { Education as EducationSection } from './components/public/Education';
import { Projects } from './components/public/Projects';
import { Testimonials } from './components/public/Testimonials';
import { Certifications } from './components/public/Certifications';
import { NewsSection } from './components/public/NewsSection';
import { ContactSection } from './components/public/ContactSection';
import { Footer } from './components/public/Footer';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProjectsManager } from './components/admin/ProjectsManager';
import { SkillsManager } from './components/admin/SkillsManager';
import { ExperienceManager } from './components/admin/ExperienceManager';
import { EducationManager } from './components/admin/EducationManager';
import { TestimonialsManager } from './components/admin/TestimonialsManager';
import { CertificationsManager } from './components/admin/CertificationsManager';
import { SettingsManager } from './components/admin/SettingsManager';
import { MessagesManager } from './components/admin/MessagesManager';

export default function App() {
  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('portfolio_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('portfolio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('portfolio_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Public Data State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [news, setNews] = useState<CachedArticle[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Admin View State
  const [isAdminView, setIsAdminView] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshingNews, setRefreshingNews] = useState(false);

  // Load all public portfolio data
  const loadPublicData = async () => {
    try {
      const [
        settingsRes,
        projectsRes,
        skillsRes,
        expRes,
        eduRes,
        testRes,
        certRes,
        newsRes
      ] = await Promise.all([
        api.getSettings(),
        api.getProjects(),
        api.getSkills(),
        api.getExperience(),
        api.getEducation(),
        api.getTestimonials(),
        api.getCertifications(),
        api.getNews()
      ]);

      setSettings(settingsRes);
      setProjects(projectsRes);
      setSkills(skillsRes);
      setExperience(expRes);
      setEducation(eduRes);
      setTestimonials(testRes);
      setCertifications(certRes);
      setNews(newsRes);

      // Update browser head title
      if (settingsRes?.seo?.siteTitle) {
        document.title = settingsRes.seo.siteTitle;
      }
    } catch (err) {
      console.error('Error loading portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load messages if authenticated
  const loadAdminMessages = async () => {
    try {
      const msgs = await api.getContactMessages();
      setMessages(msgs);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadPublicData();

    // Initialize public portfolio visitor tracking & heartbeat
    let sessionId = sessionStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      sessionStorage.setItem('portfolio_session_id', sessionId);
    }

    // Ping visit
    api.recordVisit({
      sessionId,
      path: window.location.pathname + (window.location.hash || ''),
      userAgent: navigator.userAgent
    }).catch(() => {});

    // Periodic heartbeat every 15 seconds
    const heartbeatInterval = setInterval(() => {
      api.sendHeartbeat(sessionId!).catch(() => {});
    }, 15000);

    // Check if token exists in localStorage
    api.checkAuth()
      .then(() => {
        setIsAuthenticated(true);
        loadAdminMessages();
      })
      .catch(() => {
        setIsAuthenticated(false);
      });

    return () => clearInterval(heartbeatInterval);
  }, []);

  const handleOpenAdmin = () => {
    if (isAuthenticated) {
      setIsAdminView(true);
      loadAdminMessages();
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setIsAdminView(true);
    loadAdminMessages();
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setIsAdminView(false);
  };

  const handleRefreshNews = async () => {
    setRefreshingNews(true);
    try {
      const res = await api.refreshNews();
      setNews(res.articles);
    } catch (err) {
      console.error('Failed news refresh:', err);
    } finally {
      setRefreshingNews(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900 font-sans text-sm space-y-4">
        <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading Portfolio Architecture...</p>
      </div>
    );
  }

  const defaultSettings: SiteSettings = settings || {
    name: 'Emmanuel Oluwaseun',
    role: 'Senior Full-Stack Engineer',
    heroTaglines: ['Building Scalable Systems', 'Crafting Intuitive UI'],
    bio: 'Passionate Senior Full-Stack Engineer with 6+ years of experience.',
    aboutContent: 'Senior Full-Stack Engineer specializing in scalable web systems.',
    profilePictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    resumeUrl: '',
    socialLinks: { email: 'emmanuel@portfolio.dev' },
    seo: { siteTitle: 'Emmanuel Oluwaseun | Senior Software Engineer', metaDescription: '' },
    updatedAt: new Date().toISOString()
  };

  // Render Admin CMS View if active
  if (isAdminView && isAuthenticated) {
    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        onLogout={handleLogout}
        onCloseAdmin={() => {
          setIsAdminView(false);
          loadPublicData();
        }}
        unreadCount={messages.filter((m) => !m.read).length}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            projects={projects}
            skills={skills}
            experience={experience}
            messages={messages}
            articles={news}
            setActiveTab={setAdminTab}
            onRefreshNews={handleRefreshNews}
            refreshingNews={refreshingNews}
          />
        )}
        {adminTab === 'projects' && (
          <ProjectsManager projects={projects} onRefresh={loadPublicData} />
        )}
        {adminTab === 'skills' && (
          <SkillsManager skills={skills} onRefresh={loadPublicData} />
        )}
        {adminTab === 'experience' && (
          <ExperienceManager experience={experience} onRefresh={loadPublicData} />
        )}
        {adminTab === 'education' && (
          <EducationManager education={education} onRefresh={loadPublicData} />
        )}
        {adminTab === 'testimonials' && (
          <TestimonialsManager testimonials={testimonials} onRefresh={loadPublicData} />
        )}
        {adminTab === 'certifications' && (
          <CertificationsManager certifications={certifications} onRefresh={loadPublicData} />
        )}
        {adminTab === 'settings' && (
          <SettingsManager settings={defaultSettings} onRefresh={loadPublicData} />
        )}
        {adminTab === 'messages' && (
          <MessagesManager messages={messages} onRefresh={loadAdminMessages} />
        )}
      </AdminLayout>
    );
  }

  // Render Public Portfolio View
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors duration-300">
      <Navbar settings={defaultSettings} onOpenAdmin={handleOpenAdmin} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <main>
        <Hero settings={defaultSettings} />
        <About settings={defaultSettings} />
        <Skills skills={skills} />
        <ExperienceSection experience={experience} />
        <EducationSection education={education} />
        <Projects projects={projects} />
        <Testimonials testimonials={testimonials} />
        <Certifications certifications={certifications} />
        <NewsSection articles={news} onRefreshSuccess={setNews} />
        <ContactSection settings={defaultSettings} />
      </main>

      <Footer settings={defaultSettings} onOpenAdmin={handleOpenAdmin} darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      {/* Admin Login Modal */}
      {showLoginModal && (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
