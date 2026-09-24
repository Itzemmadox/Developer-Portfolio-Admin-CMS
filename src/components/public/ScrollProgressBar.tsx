import React, { useState, useEffect } from 'react';

export const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const calculateScrollProgress = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollHeight > 0) {
        const currentProgress = Math.min(100, Math.max(0, (scrollY / scrollHeight) * 100));
        setProgress(currentProgress);
      } else {
        setProgress(0);
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateScrollProgress);
        ticking = true;
      }
    };

    // Calculate immediately on mount
    calculateScrollProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Sync with smooth Lenis instance if available
    let lenisUnsubscribe: (() => void) | null = null;
    const connectLenis = () => {
      if ((window as any).__lenis) {
        const lenis = (window as any).__lenis;
        lenis.on('scroll', handleScroll);
        lenisUnsubscribe = () => {
          try {
            lenis.off('scroll', handleScroll);
          } catch {
            // ignore
          }
        };
      }
    };

    connectLenis();
    const lenisTimer = setTimeout(connectLenis, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      clearTimeout(lenisTimer);
      if (lenisUnsubscribe) {
        lenisUnsubscribe();
      }
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] pointer-events-none select-none"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Background Track (Subtle Hairline) */}
      <div className="absolute inset-0 bg-slate-200/20 dark:bg-slate-800/30" />

      {/* Dynamic Progress Fill Bar */}
      <div
        className="relative h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 origin-left shadow-[0_0_10px_rgba(99,102,241,0.6)] dark:shadow-[0_0_12px_rgba(129,140,248,0.7)] transition-transform duration-75 ease-out will-change-transform"
        style={{
          transform: `scaleX(${progress / 100})`,
        }}
      >
        {/* Glowing Head Indicator at the right edge when active */}
        {progress > 0 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white dark:bg-cyan-200 shadow-[0_0_8px_#818cf8] -mr-1" />
        )}
      </div>
    </div>
  );
};
