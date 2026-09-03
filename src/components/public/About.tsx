import React from 'react';
import { SiteSettings, Testimonial } from '../../types';
import { getSafeDocumentUrl } from '../../lib/api';
import { resolveClientRatingDisplay } from '../../lib/ratingUtils';
import { User, Download, Award, Briefcase, Code, CheckCircle2 } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';
import { GitHubCalendar } from './GitHubCalendar';

interface AboutProps {
  settings: SiteSettings;
  certificatesCount?: number;
  onOpenCertificates?: () => void;
  testimonials?: Testimonial[];
}

export const About: React.FC<AboutProps> = ({ settings, certificatesCount = 0, onOpenCertificates, testimonials = [] }) => {
  // Dynamic certificate count calculation based on user requirements:
  // - If less than 5: exact number (e.g. 2, 1 -> "1", 0 -> "0")
  // - If 5 to 9 (less than 10 and above or equal to 5): "5+"
  // - If 10 or more: "10+"
  // User can also override directly from the Admin CMS
  const certOverride = settings.aboutStats?.certifications?.trim();
  const count = typeof certificatesCount === 'number' ? certificatesCount : 0;

  let certValue = '';
  let certLabel = 'Certifications';

  if (certOverride && certOverride.toLowerCase() !== 'auto') {
    certValue = certOverride;
  } else {
    if (count < 5) {
      certValue = String(count);
      certLabel = count === 1 ? 'Certificate' : 'Certifications';
    } else if (count < 10) {
      certValue = '5+';
      certLabel = 'Certifications';
    } else {
      certValue = '10+';
      certLabel = 'Certifications';
    }
  }

  // Dynamic Client Satisfaction Rating calculation based on live testimonials:
  // - Accumulates all ratings: (Average Rating / 5) * 100 = Client Satisfaction Percentage
  // - Supports 'auto' (% or stars) or manual override in Admin CMS
  const { value: ratingValue, isAuto: isRatingAuto, satisfaction: ratingSatisfaction } =
    resolveClientRatingDisplay(settings.aboutStats?.clientRating, testimonials);

  const stats = [
    {
      label: 'Years Experience',
      value: settings.aboutStats?.yearsExperience || '2+',
      icon: Briefcase
    },
    {
      label: 'Projects Delivered',
      value: settings.aboutStats?.projectsDelivered || '20+',
      icon: Code
    },
    {
      label: certLabel,
      value: certValue,
      icon: Award,
      isCertificate: true,
      onClick: onOpenCertificates
    },
    {
      label: 'Client Rating',
      value: ratingValue,
      icon: CheckCircle2,
      sublabel: isRatingAuto && ratingSatisfaction.count > 0 ? `${ratingSatisfaction.starString} (${ratingSatisfaction.count} ${ratingSatisfaction.count === 1 ? 'review' : 'reviews'})` : undefined,
      onClick: () => {
        const el = document.getElementById('testimonials');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  ];

  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">About Me</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Background, Philosophy & Engineering Mindset</p>
            </div>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Profile Photo & Stats Column */}
          <RevealOnScroll className="lg:col-span-5 space-y-6" delay={100}>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 group shadow-sm">
              {(() => {
                const photo =
                  settings.profilePictureUrl ||
                  settings.avatarUrl ||
                  (settings as any).avatar ||
                  '';

                const initials = (settings.name || 'EK')
                  .split(' ')
                  .filter(Boolean)
                  .map((w: string) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                if (photo) {
                  return (
                    <img
                      src={photo}
                      alt={settings.name || 'About Developer'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-80 sm:h-96 object-cover rounded-xl group-hover:scale-102 transition-transform duration-500"
                    />
                  );
                }

                return (
                  <div className="w-full h-80 sm:h-96 rounded-xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-indigo-400/30 mb-4">
                      {initials}
                    </div>
                    <p className="text-base font-bold text-white mb-1">{settings.name}</p>
                    <p className="text-xs font-mono text-indigo-400">{settings.role}</p>
                  </div>
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 backdrop-blur-md shadow-md">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{settings.name}</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{settings.role}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((item) => {
                const Icon = item.icon;
                const isClickable = Boolean(item.onClick);
                const Tag = isClickable ? 'button' : 'div';
                return (
                  <Tag
                    key={item.label}
                    type={isClickable ? 'button' : undefined}
                    onClick={item.onClick}
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 transition-all shadow-2xs text-left w-full ${
                      isClickable
                        ? 'cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm active:scale-98 group/stat focus:outline-none focus:ring-2 focus:ring-indigo-500/40'
                        : 'hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 group-hover/stat:text-indigo-500 transition-colors">
                        {item.value}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover/stat:text-indigo-500 transition-colors" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
                        {item.sublabel && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{item.sublabel}</span>
                        )}
                      </div>
                      {isClickable && (
                        <span className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400 opacity-0 group-hover/stat:opacity-100 transition-opacity">
                          View &rarr;
                        </span>
                      )}
                    </div>
                  </Tag>
                );
              })}
            </div>
          </RevealOnScroll>

          {/* Text Story & Details Column */}
          <RevealOnScroll className="lg:col-span-7 space-y-6" delay={200}>
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-2xs">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Architecting Elegant, High-Performance Software
              </h3>
              <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {settings.aboutContent}
              </div>
            </div>

            {/* Action Buttons */}
            {settings.resumeUrl && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={getSafeDocumentUrl(settings.resumeUrl, 'download')}
                  download="Oluwaseun_Emmanuel_Kehinde_CV.pdf"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-sm font-semibold transition-all shadow-xs"
                >
                  <Download className="w-4 h-4 text-slate-300" />
                  <span>Download Curriculum Vitae</span>
                </a>
              </div>
            )}
          </RevealOnScroll>
        </div>

        {/* GitHub Contribution Calendar Section */}
        <RevealOnScroll className="mt-12" delay={250}>
          <GitHubCalendar githubUrlOrUsername={settings.socialLinks?.github} />
        </RevealOnScroll>
      </div>
    </section>
  );
};
