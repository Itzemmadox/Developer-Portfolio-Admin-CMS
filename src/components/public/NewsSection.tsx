import React, { useState } from 'react';
import { CachedArticle } from '../../types';
import { Newspaper, ExternalLink, RefreshCw, Clock, Tag } from 'lucide-react';
import { api } from '../../lib/api';

interface NewsSectionProps {
  articles: CachedArticle[];
  onRefreshSuccess?: (newArticles: CachedArticle[]) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ articles, onRefreshSuccess }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [localArticles, setLocalArticles] = useState<CachedArticle[]>(articles);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatusMsg(null);
    try {
      const res = await api.refreshNews();
      if (res.articles) {
        setLocalArticles(res.articles);
        if (onRefreshSuccess) onRefreshSuccess(res.articles);
        setStatusMsg(`Updated! Fetched ${res.count} articles from Dev.to.`);
      }
    } catch (err: any) {
      setStatusMsg('Failed to refresh news feed.');
    } finally {
      setRefreshing(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const displayArticles = localArticles.length > 0 ? localArticles : articles;

  return (
    <section id="news" className="py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-900/50 text-teal-600 dark:text-teal-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Latest Tech News & Engineering Feed</h2>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Auto-Refreshed Hourly from Dev.to API Cache</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">{statusMsg}</span>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-teal-600 dark:text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh News Feed'}</span>
            </button>
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayArticles.slice(0, 6).map((art) => (
            <div
              key={art.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-950">
                  <img
                    src={art.coverImageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-teal-700 dark:text-teal-300 backdrop-blur-xs">
                    Dev.to Feed
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span>{art.author}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(art.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  {art.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href={art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold"
                >
                  <span>Read Article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
