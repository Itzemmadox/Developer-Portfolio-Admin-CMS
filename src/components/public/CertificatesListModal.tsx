import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Certificate } from '../../types';
import { X, Search, Award, ExternalLink, ShieldCheck, Eye, Sparkles } from 'lucide-react';
import { CertificateDetailModal } from './CertificateDetailModal';

interface CertificatesListModalProps {
  certificates: Certificate[];
  onClose: () => void;
}

export const CertificatesListModal: React.FC<CertificatesListModalProps> = ({
  certificates,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Keyboard accessibility: Close list modal on Escape if no nested detail modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !selectedCertificate) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedCertificate]);

  // Live search filter matching title, issuer, or category
  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return certificates;
    return certificates.filter((cert) => {
      return (
        cert.title.toLowerCase().includes(query) ||
        cert.issuer.toLowerCase().includes(query) ||
        cert.category.toLowerCase().includes(query)
      );
    });
  }, [certificates, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative w-full max-w-xl bg-slate-900/95 dark:bg-slate-900 border border-slate-800 dark:border-slate-700/80 rounded-3xl p-5 sm:p-7 space-y-5 text-slate-100 shadow-2xl z-10 backdrop-blur-xl flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-sans text-white flex items-center gap-2">
                <span>Certificates</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  {certificates.length}
                </span>
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {certificates.length} verified credentials. Search or click to view.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer border border-slate-700"
            title="Close list (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/80" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search certificates..."
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-slate-100 placeholder-slate-500 text-xs sm:text-sm font-mono outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Certificates List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[50vh] min-h-[220px]">
          {filteredCertificates.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Award className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs font-mono text-slate-400">No matching certificates found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-mono text-emerald-400 hover:underline"
                >
                  Clear search query
                </button>
              )}
            </div>
          ) : (
            filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setSelectedCertificate(cert)}
                className="group p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/90 hover:border-emerald-500/40 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer shadow-sm"
              >
                {/* Left side: Icon/Thumbnail & Meta */}
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors truncate font-sans">
                      {cert.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        {cert.category}
                      </span>
                      {cert.issuer && (
                        <span className="text-[10px] font-mono text-emerald-400/80 font-medium">
                          • {cert.issuer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: View button + External link button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCertificate(cert);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-mono font-extrabold text-xs transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span>View</span>
                  </button>

                  {cert.credentialUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(cert.credentialUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                      title="Open external credential URL in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Credential System
          </span>
          <span>Click any row or 'View' for full image</span>
        </div>
      </motion.div>

      {/* Nested Certificate Detail Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <CertificateDetailModal
            certificate={selectedCertificate}
            onClose={() => setSelectedCertificate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
