import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

/**
 * Custom hook providing cinematic, tactile scroll-driven section transitions
 * powered by GSAP ScrollTrigger and Lenis smooth momentum scrolling.
 *
 * Key features:
 * 1. Apple/Awwwards-style card-stacking section transitions:
 *    - Current section pins & scales down (1.0 -> 0.92) with depth blur/opacity
 *    - Next section slides smoothly over it on scroll scrub
 * 2. Alternating transition variations (scale zoom-out vs vertical parallax lift)
 * 3. Parallax micro-interactions for titles, project cards, and badges
 * 4. Smooth anchor link scrolling (#about, #projects, #contact)
 * 5. Full responsiveness and prefers-reduced-motion accessibility support
 */
export function useScrollAnimations(enabled: boolean = true) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. Accessibility: Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // 2. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger);

    // 3. Initialize Lenis Smooth Scroll Engine
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 2.0,
    });

    lenisRef.current = lenis;

    // Sync Lenis scroll updates directly with GSAP ScrollTrigger
    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    // Dedicated requestAnimationFrame loop driving Lenis smooth momentum scrolling
    let rafId: number;
    const updateRaf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(updateRaf);
    };
    rafId = requestAnimationFrame(updateRaf);

    // 4. Smooth Anchor Link Navigation (#about, #projects, etc.)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target?.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          try {
            const targetElement = document.querySelector(href);
            if (targetElement) {
              e.preventDefault();
              lenis.scrollTo(targetElement as HTMLElement, {
                offset: -70,
                duration: 1.4,
              });
            }
          } catch {
            // ignore invalid selectors
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // 5. GSAP ScrollTrigger Animations Context
    const ctx = gsap.context(() => {
      // Find all top-level sections inside <main>
      const sections = gsap.utils.toArray<HTMLElement>('main > section');

      sections.forEach((section, index) => {
        const isLast = index === sections.length - 1;

        // Ensure section container has standard card-stack styling
        section.style.position = 'relative';

        // --- Dedicated GSAP Timeline for Section Exit & Backdrop Blur ---
        // Content remains 100% crystal clear throughout the viewport.
        // The backdrop blur & fade timeline triggers when the last content/bottom of the section is half off the viewport (bottom 50% / center).
        if (!isLast) {
          const nextSection = sections[index + 1];

          // Dedicated GSAP Timeline for section exit & backdrop-blur
          const exitTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: 'bottom 50%', // Triggers when the bottom of the section reaches the middle (50%) of the viewport (half off / exiting)
              end: 'bottom top',    // Reaches full blur & fade as the section completely exits the top of the window
              scrub: true,          // Direct 1:1 scroll drive
              invalidateOnRefresh: true,
            },
          });

          exitTimeline.to(section, {
            scale: index % 2 === 0 ? 0.92 : 0.94,
            opacity: 0.65,
            filter: 'blur(8px)',
            backdropFilter: 'blur(8px)',
            borderRadius: '28px',
            transformOrigin: 'center top',
            ease: 'power1.out',
          });

          // Incoming next section parallax overlap timeline
          if (nextSection) {
            const nextTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: section,
                start: 'bottom 50%',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
              },
            });

            nextTimeline.fromTo(
              nextSection,
              { y: 40, opacity: 0.9 },
              {
                y: 0,
                opacity: 1,
                ease: 'none',
              }
            );
          }
        }

        // --- Section Internal Parallax & Header Reveals ---
        const h2 = section.querySelector('h2');
        if (h2) {
          gsap.fromTo(
            h2,
            { y: 35, opacity: 0.3 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: h2,
                start: 'top 92%',
                end: 'top 65%',
                scrub: 0.5,
              },
            }
          );
        }

        // Stagger card reveals inside grid/list sections (projects, skills, experience)
        const cards = section.querySelectorAll('.grid > div, .space-y-6 > div, .space-y-4 > div');
        if (cards && cards.length > 0) {
          gsap.fromTo(
            cards,
            { y: 30, opacity: 0.8 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.08,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 40%',
                scrub: 0.6,
              },
            }
          );
        }
      });

      // Dedicated Hero Exit Blur Backdrop GSAP Timeline
      const hero = document.querySelector('#hero');
      if (hero) {
        const heroContent = hero.querySelector('div.max-w-7xl');
        if (heroContent) {
          const heroExitTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: hero,
              start: 'bottom 50%', // Triggers when hero bottom reaches middle of viewport (half off / exiting)
              end: 'bottom top',
              scrub: true,
            },
          });

          heroExitTimeline.to(heroContent, {
            y: 70,
            scale: 0.93,
            opacity: 0.6,
            filter: 'blur(8px)',
            backdropFilter: 'blur(8px)',
            ease: 'power1.out',
          });
        }
      }

      // Refresh ScrollTrigger calculations
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleAnchorClick);
      ctx.revert();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
