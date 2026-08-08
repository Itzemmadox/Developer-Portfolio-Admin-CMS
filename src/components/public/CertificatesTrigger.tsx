import React from 'react';
import { Award, Sparkles } from 'lucide-react';

interface CertificatesTriggerProps {
  count: number;
  onClick: () => void;
}

export const CertificatesTrigger: React.FC<CertificatesTriggerProps> = ({ count, onClick }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/90 dark:bg-emerald-950/80 hover:bg-slate-800 dark:hover:bg-emerald-900/90 text-emerald-400 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 backdrop-blur-md cursor-pointer font-mono text-xs sm:text-sm font-bold tracking-tight active:scale-95"
    >
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
      </span>

      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
        <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
      </div>

      <span className="flex items-center gap-1.5 text-slate-100 dark:text-emerald-100 font-semibold">
        View certificates <span className="text-emerald-400 font-mono font-bold">({count})</span>
      </span>

      <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};
