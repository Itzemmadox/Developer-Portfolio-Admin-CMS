import React, { useEffect, useRef, useState } from 'react';

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

export const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  className = '',
  threshold = 0.05,
  rootMargin = '100px 0px 100px 0px',
  delay = 0
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Fallback if IntersectionObserver isn't available
    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => setIsRevealed(true), delay);
          } else {
            setIsRevealed(true);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [threshold, rootMargin, delay]);

  return (
    <div
      ref={ref}
      className={`max-w-full overflow-x-clip ${className} ${
        isRevealed
          ? 'animate-fade-in-up opacity-100'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
};
