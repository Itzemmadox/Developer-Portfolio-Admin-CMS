import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { X, ExternalLink, Github, Sparkles } from 'lucide-react';
import { formatExternalUrl } from '../../lib/utils';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const thumb = project?.thumbnailUrl || (project as any)?.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  const rawGallery = Array.isArray(project?.galleryUrls) && project.galleryUrls.length > 0
    ? project.galleryUrls
    : (Array.isArray((project as any)?.images) && (project as any).images.length > 0 ? (project as any).images : []);

  const images = rawGallery.length > 0 ? rawGallery : [thumb];
  const [selectedImage, setSelectedImage] = useState(images[0] || thumb);

  // Update selected image whenever project changes
  useEffect(() => {
    if (project) {
      const pThumb = project.thumbnailUrl || (project as any).image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
      const pGallery = Array.isArray(project.galleryUrls) && project.galleryUrls.length > 0
        ? project.galleryUrls
        : (Array.isArray((project as any).images) && (project as any).images.length > 0 ? (project as any).images : []);
      setSelectedImage(pGallery[0] || pThumb);
    }
  }, [project]);

  // Lock background scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!project) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Compensate for scrollbar removal to prevent layout jump
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const shortDesc = project.shortDescription || (project as any).description || (project as any).tagline || '';
  const techList = Array.isArray(project.techStack) && project.techStack.length > 0
    ? project.techStack
    : (Array.isArray((project as any).tags) ? (project as any).tags : []);

  const formattedLiveUrl = formatExternalUrl(project.liveUrl);
  const formattedGithubUrl = formatExternalUrl(project.githubUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      {/* Modal Dialog Container - Fixed and isolated */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[88vh] sm:max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200"
      >
        {/* Fixed Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0 z-10">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {project.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Featured Project
                </span>
              )}
              {project.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {project.category}
                </span>
              )}
            </div>
            <h2 id="project-modal-title" className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
              {project.title}
            </h2>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8 space-y-6">
          {/* Short Description */}
          {shortDesc && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {shortDesc}
            </p>
          )}

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={selectedImage}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {images.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                      selectedImage === imgUrl ? 'border-indigo-600 dark:border-indigo-400 scale-105' : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tech Stack Chips */}
          {techList.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full Description / Case Study */}
          {project.fullDescription && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Case Study & Architecture</h3>
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3 whitespace-pre-line">
                {project.fullDescription}
              </div>
            </div>
          )}

          {/* Action Links inside scroll area */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {formattedLiveUrl ? (
              <a
                href={formattedLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Live App</span>
              </a>
            ) : null}

            {formattedGithubUrl ? (
              <a
                href={formattedGithubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <Github className="w-4 h-4" />
                <span>View Source Code</span>
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
