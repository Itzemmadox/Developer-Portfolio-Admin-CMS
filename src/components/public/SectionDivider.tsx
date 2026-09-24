import React, { useEffect, useRef, useState } from 'react';

interface SectionDividerProps {
  className?: string;
  glow?: boolean;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  className = '',
  glow = true
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsRevealed(true);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: '50px 0px -20px 0px',
      }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="separator"
      aria-hidden="true"
      className={`relative w-full flex items-center justify-center h-px z-10 select-none pointer-events-none ${className}`}
    >
      <div
        className={`w-full max-w-5xl sm:max-w-6xl px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-out will-change-transform ${
          isRevealed
            ? 'opacity-100 scale-x-100 translate-y-0'
            : 'opacity-0 scale-x-50 translate-y-1'
        }`}
      >
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300/80 dark:via-slate-700/80 to-transparent">
          {/* Subtle indigo accent gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-indigo-400/50 to-transparent" />

          {/* Ambient center flare */}
          {glow && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-44 h-3 bg-indigo-500/10 dark:bg-indigo-400/15 blur-sm pointer-events-none rounded-full" />
          )}

          {/* Delicate center diamond node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rotate-45 rounded-[0.5px] bg-indigo-600/90 dark:bg-indigo-400/90 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
