import React, { useState, useEffect } from 'react';
import { HeroBackground } from '../three/HeroBackground';
import { SiteSettings } from '../../types';
import { Github, Linkedin, Twitter, Mail, ArrowDownRight, FileText, Sparkles, Code2 } from 'lucide-react';

interface HeroProps {
  settings: SiteSettings;
}

export const Hero: React.FC<HeroProps> = ({ settings }) => {
  const taglines = settings.heroTaglines && settings.heroTaglines.length > 0
    ? settings.heroTaglines
    : ['Building Scalable Systems', 'Crafting Seamless UI', 'Full-Stack Software Architecture'];

  const [taglineIndex, setTaglineIndex] = useState(0);
  const [fadeState, setFadeState] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState(false);
      setTimeout(() => {
        setTaglineIndex((prev) => (prev + 1) % taglines.length);
        setFadeState(true);
      }, 300);
    }, 3800);

    return () => clearInterval(interval);
  }, [taglines.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Three.js Interactive WebGL Background */}
      <HeroBackground />

      {/* Decorative Gradient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Availability Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-8 shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Available for Senior Roles & Architecture Consulting</span>
        </div>

        {/* Profile Image Avatar */}
        {settings.profilePictureUrl && (
          <div className="relative mb-6 group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 blur opacity-30 group-hover:opacity-60 transition duration-500" />
            <img
              src={settings.profilePictureUrl}
              alt={settings.name}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-lg"
            />
          </div>
        )}

        {/* Name */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Hello, I'm{' '}
          <span className="text-indigo-600 dark:text-indigo-400">
            {settings.name}
          </span>
        </h1>

        {/* Role */}
        <p className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
          {settings.role || 'Senior Full-Stack Engineer'}
        </p>

        {/* Dynamic Rotating Tagline */}
        <div className="h-9 mb-6 flex items-center justify-center">
          <div
            className={`transition-all duration-300 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-2 ${
              fadeState ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{taglines[taglineIndex]}</span>
          </div>
        </div>

        {/* Bio */}
        <p className="max-w-2xl text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
          {settings.bio}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <a
            href="#projects"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>View Projects</span>
          </a>

          <a
            href="#contact"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-semibold text-sm shadow-2xs transition-all transform hover:-translate-y-0.5"
          >
            <span>Contact Me</span>
            <ArrowDownRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </a>

          {settings.resumeUrl && (
            <a
              href={settings.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-sm transition-all border border-transparent dark:border-indigo-900/50"
            >
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Resume</span>
            </a>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
          {settings.socialLinks?.github && (
            <a
              href={settings.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors"
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
          {settings.socialLinks?.linkedin && (
            <a
              href={settings.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {settings.socialLinks?.twitter && (
            <a
              href={settings.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors"
              aria-label="Twitter/X Profile"
            >
              <Twitter className="w-5 h-5" />
            </a>
          )}
          {settings.socialLinks?.email && (
            <a
              href={`mailto:${settings.socialLinks.email}`}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-2xs transition-colors"
              aria-label="Email Contact"
            >
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
