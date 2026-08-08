import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Certificate } from '../../types';
import { X, ExternalLink, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface CertificateDetailModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateDetailModal: React.FC<CertificateDetailModalProps> = ({ certificate, onClose }) => {
  // Listen for Escape key to close ONLY detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-lg overflow-y-auto">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-slate-900/95 dark:bg-slate-900 border border-slate-800 dark:border-slate-700/80 rounded-3xl p-5 sm:p-7 space-y-6 text-slate-100 shadow-2xl z-10 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                VERIFIED CREDENTIAL
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                {certificate.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans mt-2">
              {certificate.title}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Award className="w-3.5 h-3.5" />
                Issuer: {certificate.issuer}
              </span>
              {certificate.issueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Issued: {certificate.issueDate}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700 flex-shrink-0"
            title="Close certificate details (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Image Frame */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-xl group">
          <img
            src={certificate.imageUrl}
            alt={certificate.title}
            className="w-full h-auto max-h-[60vh] object-contain rounded-2xl mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <p className="text-xs font-mono text-slate-400">
            Official verified certificate record stored on CDN
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <span>Open in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all cursor-pointer"
            >
              Back to List
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
