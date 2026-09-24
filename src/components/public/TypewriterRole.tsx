import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';

interface TypewriterRoleProps {
  role?: string;
  className?: string;
}

export const TypewriterRole: React.FC<TypewriterRoleProps> = ({ role, className = '' }) => {
  // Parse role into an array of titles if delimited by |, •, ;, or /
  const roles = useMemo(() => {
    if (!role || !role.trim()) {
      return [
        'Senior Full-Stack Engineer',
        'Cloud & Distributed Systems',
        'Creative UI/UX Developer'
      ];
    }

    const trimmed = role.trim();
    const delimiters = ['|', '•', ';', '/'];
    for (const delim of delimiters) {
      if (trimmed.includes(delim)) {
        const parts = trimmed
          .split(delim)
          .map((item) => item.trim())
          .filter(Boolean);
        if (parts.length > 1) {
          return parts;
        }
      }
    }

    // Also support comma-separated roles if multiple distinct phrases exist
    if (trimmed.includes(',')) {
      const parts = trimmed
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      if (parts.length > 1) {
        return parts;
      }
    }

    return [trimmed];
  }, [role]);

  // Check user preference for reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);

      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset indices if roles change
  useEffect(() => {
    setRoleIndex(0);
    setDisplayedText('');
    setIsDeleting(false);
  }, [roles]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayedText(roles[roleIndex] || '');
      return;
    }

    const currentRole = roles[roleIndex] || '';
    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      // Currently typing forward
      if (displayedText.length < currentRole.length) {
        // Natural typing speed variation (55ms - 85ms)
        const typingSpeed = Math.floor(Math.random() * 30) + 55;
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing full word - pause before deleting
        // If only 1 role, pause longer (3.5s) before cycling/re-typing; if multiple, pause 2.2s
        const holdDuration = roles.length === 1 ? 3500 : 2200;
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, holdDuration);
      }
    } else {
      // Currently deleting backwards
      if (displayedText.length > 0) {
        // Quick deletion speed (30ms - 45ms)
        const deleteSpeed = 35;
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length - 1));
        }, deleteSpeed);
      } else {
        // Finished deleting - brief pause before typing next role
        timer = setTimeout(() => {
          setIsDeleting(false);
          setRoleIndex((prev) => (prev + 1) % roles.length);
        }, 400);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex, roles, reducedMotion]);

  const currentFullRole = roles[roleIndex] || role || 'Senior Full-Stack Engineer';

  if (reducedMotion) {
    return (
      <div className={`min-h-[1.75rem] flex items-center justify-center ${className}`}>
        <p className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400">
          {currentFullRole}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`min-h-[1.75rem] sm:min-h-[2rem] flex items-center justify-center select-none ${className}`}
      aria-label={currentFullRole}
    >
      {/* Screen-reader accessible full text */}
      <span className="sr-only">{currentFullRole}</span>

      {/* Visual Typewriter Text */}
      <p
        aria-hidden="true"
        className="text-lg sm:text-xl font-semibold text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center"
      >
        <span className="inline-block">{displayedText}</span>
        {/* Blinking Cursor Bar */}
        <span
          className="inline-block w-[2.5px] h-[1.15em] ml-1 bg-indigo-600 dark:text-indigo-400 bg-current rounded-full align-middle animate-cursor-blink"
          aria-hidden="true"
        />
      </p>
    </motion.div>
  );
};
