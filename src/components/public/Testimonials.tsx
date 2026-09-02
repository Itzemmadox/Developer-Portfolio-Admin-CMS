import React from 'react';
import { Testimonial } from '../../types';
import { Quote, MessageSquare, Star } from 'lucide-react';
import { RevealOnScroll } from './RevealOnScroll';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section id="testimonials" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealOnScroll>
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Client & Peer Testimonials</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Endorsements from Engineering Leadership & Technical Collaborators</p>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => {
              const author = t.authorName || t.name || 'Anonymous';
              const role = t.authorRole || t.role || 'Collaborator';
              const quoteText = t.quote || t.content || '';
              const photo = t.authorPhotoUrl || t.avatar || '';
              const initial = author.trim() ? author.trim().charAt(0).toUpperCase() : 'A';
              const ratingCount = typeof t.rating === 'number' ? Math.max(1, Math.min(5, t.rating)) : 5;

              return (
                <div
                  key={t.id}
                  className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 relative group"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-200 dark:text-slate-800 group-hover:text-indigo-100 dark:group-hover:text-indigo-900/50 transition-colors" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(ratingCount)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
                      "{quoteText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    {photo ? (
                      <img
                        src={photo}
                        alt={author}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400">
                        {initial}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{author}</h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{role}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
};
