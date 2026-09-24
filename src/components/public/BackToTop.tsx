import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      // Show button after scrolling down 350px
      if (currentScrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate progress percentage (0 - 100)
      if (totalScrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalScrollHeight) * 100));
        setScrollProgress(progress);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    // Check if smooth Lenis scroll instance is active
    if ((window as any).__lenis) {
      try {
        (window as any).__lenis.scrollTo(0, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        return;
      } catch {
        // Fallback to native window scrollTo
      }
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG circular progress parameters
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 select-none"
        >
          <motion.button
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            title="Back to top"
            className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-indigo-500/10 dark:shadow-indigo-950/40 backdrop-blur-md hover:border-indigo-400 dark:hover:border-indigo-500/80 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            {/* Circular Progress Ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-[2px]"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              {/* Background Track */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-slate-200/60 dark:stroke-slate-800/80 fill-none"
                strokeWidth="2.5"
              />
              {/* Animated Progress Indicator */}
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-indigo-600 dark:stroke-indigo-400 fill-none transition-all duration-150 ease-out"
                strokeWidth="2.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Central Arrow Icon */}
            <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />

            {/* Micro Tooltip */}
            <span className="sr-only">Back to top</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
