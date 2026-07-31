import React, { useEffect, useState, useMemo } from 'react';
import { Github, ExternalLink, Flame, Calendar as CalendarIcon, RefreshCw, Trophy } from 'lucide-react';
import { api } from '../../lib/api';

interface GitHubCalendarProps {
  githubUrlOrUsername?: string;
  className?: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface ContributionData {
  username: string;
  totalContributions: number;
  contributions: ContributionDay[];
  currentStreak: number;
  maxStreak: number;
  isFallback?: boolean;
}

export const GitHubCalendar: React.FC<GitHubCalendarProps> = ({
  githubUrlOrUsername,
  className = ''
}) => {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);

  // Extract clean username
  const cleanUsername = useMemo(() => {
    if (!githubUrlOrUsername) return '';
    return githubUrlOrUsername
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
      .replace(/^@/, '')
      .split('/')[0];
  }, [githubUrlOrUsername]);

  const loadContributions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGithubContributions(cleanUsername);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load GitHub contributions:', err);
      setError('Unable to fetch GitHub activity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, [cleanUsername]);

  // Group contributions by weeks (7 days each, Sun through Sat)
  const weeks = useMemo(() => {
    if (!data || !data.contributions || data.contributions.length === 0) return [];

    const result: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    data.contributions.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === data.contributions.length - 1) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    return result;
  }, [data]);

  // Calculate month labels spanning columns
  const monthLabels = useMemo(() => {
    if (!weeks || weeks.length === 0) return [];
    const months: Array<{ name: string; index: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIdx) => {
      const firstDayInWeek = week[0];
      if (firstDayInWeek) {
        const dateObj = new Date(firstDayInWeek.date);
        const monthIdx = dateObj.getMonth();
        if (monthIdx !== lastMonth) {
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
          months.push({ name: monthName, index: weekIdx });
          lastMonth = monthIdx;
        }
      }
    });

    return months;
  }, [weeks]);

  // Get color styling classes for level 0-4
  const getCellBgClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-emerald-200 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800/80 hover:ring-2 hover:ring-emerald-400';
      case 2:
        return 'bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600 hover:ring-2 hover:ring-emerald-400';
      case 3:
        return 'bg-emerald-500 dark:bg-emerald-500 border-emerald-600 dark:border-emerald-400 hover:ring-2 hover:ring-emerald-300';
      case 4:
        return 'bg-emerald-700 dark:bg-emerald-400 border-emerald-800 dark:border-emerald-300 hover:ring-2 hover:ring-emerald-200';
      case 0:
      default:
        return 'bg-slate-100 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/60 hover:border-slate-400 dark:hover:border-slate-600';
    }
  };

  const formattedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const targetUsername = data?.username || cleanUsername || 'octocat';
  const profileUrl = `https://github.com/${targetUsername}`;

  return (
    <div className={`p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-2xs max-w-full overflow-hidden ${className}`}>
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white shadow-xs">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                GitHub Contribution Activity
              </h3>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                @{targetUsername}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Live engineering commits, pull requests, & open-source contributions
            </p>
          </div>
        </div>

        <button
          onClick={loadContributions}
          disabled={loading}
          className="self-start sm:self-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh GitHub Calendar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Summary Pills */}
      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yearly Contributions</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {data.totalContributions.toLocaleString()} <span className="text-xs font-normal text-slate-500">commits</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Current Streak</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {data.currentStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Longest Streak</p>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {data.maxStreak} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Fetching contribution matrix for @{targetUsername}...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-xs font-medium text-center">
          {error}
        </div>
      )}

      {/* Contribution Calendar Heatmap */}
      {!loading && !error && weeks.length > 0 && (
        <div className="space-y-3 relative">
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            <div className="min-w-[700px]">
              {/* Month Header Row */}
              <div className="relative h-5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-2 pl-7 overflow-hidden">
                {monthLabels.map((m, idx) => (
                  <div
                    key={idx}
                    className="absolute"
                    style={{ left: `${m.index * 13 + 30}px` }}
                  >
                    {m.name}
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="flex items-start pt-5 gap-1.5">
                {/* Day Labels */}
                <div className="flex flex-col justify-between h-[92px] text-[9px] font-semibold text-slate-400 dark:text-slate-500 pr-1 select-none">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Weeks Columns */}
                <div className="flex gap-[3px]">
                  {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[3px]">
                      {week.map((day) => (
                        <div
                          key={day.date}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredDay({
                              day,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8
                            });
                          }}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-2.5 h-2.5 rounded-[2px] transition-all cursor-pointer ${getCellBgClass(
                            day.level
                          )}`}
                          title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${formattedDate(day.date)}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legend */}
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-xs text-slate-400">
              {data?.isFallback ? 'Simulated pattern (GitHub API rate limited)' : `Data synced with GitHub API`}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-2.5 h-2.5 rounded-[2px] ${getCellBgClass(lvl)}`}
                />
              ))}
              <span className="text-[10px] font-semibold text-slate-400">More</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
