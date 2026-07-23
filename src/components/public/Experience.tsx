import React from 'react';
import { Experience as ExperienceType } from '../../types';
import { Briefcase, Calendar, Building2 } from 'lucide-react';

interface ExperienceProps {
  experience: ExperienceType[];
}

export const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <section id="experience" className="py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-12">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Work Experience</h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Professional Engineering Roles & Milestones</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 sm:ml-8 space-y-8 pl-6 sm:pl-10">
          {experience.map((item) => {
            const isPresent = !item.endDate || item.endDate.toLowerCase() === 'present';
            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot Node */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 group-hover:bg-indigo-600 transition-all shadow-xs" />

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      {item.companyLogoUrl ? (
                        <img
                          src={item.companyLogoUrl}
                          alt={item.company}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.role}</h3>
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{item.company}</p>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 shadow-2xs self-start sm:self-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>
                        {item.startDate} — {isPresent ? 'Present' : item.endDate}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
