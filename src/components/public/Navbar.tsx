import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ShieldAlert,
  Sparkles,
  Terminal,
  Sun,
  Moon,
  User,
  Code2,
  Briefcase,
  FolderGit2,
  Quote,
  Newspaper,
  Send,
  ChevronRight
} from 'lucide-react';
import { SiteSettings } from '../../types';

interface NavbarProps {
  settings: SiteSettings;
  onOpenAdmin: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, onOpenAdmin, darkMode, onToggleDarkMode }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section on scroll
      const sections = ['contact', 'news', 'testimonials', 'projects', 'experience', 'skills', 'about'];
      const scrollPos = window.scrollY + 140;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            return;
          }
        }
      }
      if (window.scrollY < 200) {
        setActiveSection('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about', id: 'about', icon: User },
    { name: 'Skills & Certs', shortName: 'Skills', href: '#skills', id: 'skills', icon: Code2 },
    { name: 'Experience', href: '#experience', id: 'experience', icon: Briefcase },
    { name: 'Projects', href: '#projects', id: 'projects', icon: FolderGit2 },
    { name: 'Testimonials', shortName: 'Reviews', href: '#testimonials', id: 'testimonials', icon: Quote },
    { name: 'News', shortName: 'News', href: '#news', id: 'news', icon: Newspaper },
    { name: 'Contact', href: '#contact', id: 'contact', icon: Send },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '#' || href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      const navOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      id="main-navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 py-3 shadow-xs'
          : 'bg-white/50 dark:bg-slate-950/50 md:bg-transparent py-3 md:py-4 backdrop-blur-xs md:backdrop-blur-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
        {/* Brand Name */}
        <a
          id="nav-brand-link"
          href="#"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base sm:text-lg tracking-tight hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xs sm:text-sm md:text-base text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-[200px] md:max-w-[160px] lg:max-w-[220px] xl:max-w-none">
            {settings.name || 'Developer'}
          </span>
        </a>

        {/* Desktop Links - Strictly visible on desktop (md: and up), hidden on mobile */}
        <nav
          id="desktop-navigation"
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-white/90 dark:bg-slate-900/90 p-1 lg:p-1.5 rounded-full border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-xs"
        >
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.name}
                id={`desktop-nav-${link.id}`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-2.5 lg:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                }`}
              >
                <span className="inline lg:hidden">{link.shortName || link.name}</span>
                <span className="hidden lg:inline">{link.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Desktop Right CTA / Controls - Visible on desktop */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          {onToggleDarkMode && (
            <button
              id="desktop-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-slate-600 dark:text-amber-300 hover:text-indigo-600 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:scale-105 transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Toggle theme"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          {/* CMS Admin Button */}
          <button
            id="desktop-cms-button"
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-2xs transition-all group shrink-0"
            title="Access Admin CMS"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="hidden lg:inline">CMS Admin</span>
          </button>

          {/* Hire Me CTA */}
          <a
            id="desktop-hire-me-button"
            href="#contact"
            onClick={(e) => handleNavClick(e, '#contact')}
            className="flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Hire Me</span>
          </a>
        </div>

        {/* Mobile & Tablet Controls - STRICTLY HIDDEN ON DESKTOP (md:hidden) */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          {onToggleDarkMode && (
            <button
              id="mobile-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-amber-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          )}

          {/* Hamburger toggle button - Only on mobile screens */}
          <button
            id="mobile-hamburger-button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Small Tablet Navigation Dropdown - Only renders when toggled on mobile */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu-drawer"
          className="md:hidden w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-xl transition-all"
        >
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  id={`mobile-nav-${link.id}`}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </a>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              id="mobile-cms-button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>CMS Admin Panel</span>
            </button>

            <a
              id="mobile-hire-me-button"
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Get In Touch / Hire Me</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
