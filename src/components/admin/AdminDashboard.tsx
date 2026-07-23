import React, { useState, useEffect } from 'react';
import {
  Project,
  Skill,
  Experience,
  ContactMessage,
  CachedArticle,
  VisitorStats
} from '../../types';
import { api } from '../../lib/api';
import {
  FolderGit2,
  Cpu,
  Mail,
  Newspaper,
  Plus,
  RefreshCw,
  Clock,
  ArrowRight,
  Users,
  Activity,
  Eye,
  TrendingUp,
  Globe,
  Radio,
  Zap,
  Smartphone,
  Laptop
} from 'lucide-react';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  projects: Project[];
  skills: Skill[];
  experience: Experience[];
  messages: ContactMessage[];
  articles: CachedArticle[];
  setActiveTab: (tab: AdminTab) => void;
  onRefreshNews: () => void;
  refreshingNews: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  skills,
  experience,
  messages,
  articles,
  setActiveTab,
  onRefreshNews,
  refreshingNews
}) => {
  const unreadMessages = messages.filter((m) => !m.read);

  // Real-Time Visitor Stats State
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [loadingVisitorStats, setLoadingVisitorStats] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [simulatingVisit, setSimulatingVisit] = useState(false);

  const fetchStats = async () => {
    try {
      const stats = await api.getVisitorStats();
      setVisitorStats(stats);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Failed to fetch visitor stats:', err);
    } finally {
      setLoadingVisitorStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Live real-time polling every 4 seconds when autoRefresh is active
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulateVisit = async () => {
    setSimulatingVisit(true);
    try {
      const fakeSessionId = 'sim-' + Math.random().toString(36).substring(2, 7);
      const paths = ['/', '/#projects', '/#skills', '/#contact', '/#about'];
      const randomPath = paths[Math.floor(Math.random() * paths.length)];
      await api.recordVisit({
        sessionId: fakeSessionId,
        path: randomPath,
        userAgent: 'Simulated Admin Test Visitor'
      });
      await fetchStats();
    } catch (err) {
      // ignore
    } finally {
      setSimulatingVisit(false);
    }
  };

  const cmsStats = [
    { label: 'Total Projects', value: projects.length, icon: FolderGit2, tab: 'projects' as AdminTab, color: 'text-cyan-400' },
    { label: 'Technical Skills', value: skills.length, icon: Cpu, tab: 'skills' as AdminTab, color: 'text-indigo-400' },
    { label: 'Unread Messages', value: unreadMessages.length, icon: Mail, tab: 'messages' as AdminTab, color: 'text-rose-400' },
    { label: 'Cached Articles', value: articles.length, icon: Newspaper, tab: 'dashboard' as AdminTab, color: 'text-teal-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono text-slate-100 flex items-center gap-2.5">
            <span>CMS & Traffic Dashboard</span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              LIVE METRICS
            </span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time public portfolio traffic tracking, active visitor sessions, and dynamic CMS content overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs border transition-all cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Toggle automatic 4-second live polling"
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'text-emerald-400 animate-pulse' : ''}`} />
            <span>{autoRefresh ? 'Live Poll: ON' : 'Live Poll: PAUSED'}</span>
          </button>

          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Refresh analytics manually"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* REAL-TIME TRAFFIC & VISITOR DISPLAY */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-slate-100 flex items-center gap-2">
                Real-Time Public Portfolio Traffic
              </h2>
              <p className="text-xs font-mono text-slate-400">
                Tracking live visitors, pageviews, and session activity in real time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateVisit}
              disabled={simulatingVisit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${simulatingVisit ? 'animate-spin' : ''}`} />
              <span>Simulate Ping</span>
            </button>
            <span className="text-[10px] font-mono text-slate-500">
              Sync: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* 4 Traffic Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Active Now */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Active Right Now
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 flex items-baseline gap-2">
              {visitorStats ? visitorStats.activeNow : '1'}
              <span className="text-xs font-mono font-normal text-slate-400">live user{visitorStats && visitorStats.activeNow > 1 ? 's' : ''}</span>
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">Pings received in last 3 minutes</p>
          </div>

          {/* Metric 2: Total Pageviews */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Total Pageviews
              </span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-100 group-hover:text-cyan-400 transition-colors">
              {visitorStats ? visitorStats.totalVisits.toLocaleString() : '---'}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">Cumulative portfolio visits</p>
          </div>

          {/* Metric 3: Unique Visitors */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Unique Visitors
              </span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-100 group-hover:text-indigo-400 transition-colors">
              {visitorStats ? visitorStats.uniqueVisitors.toLocaleString() : '---'}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">Unique session tokens</p>
          </div>

          {/* Metric 4: Today's Visits */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                Today's Visits
              </span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-slate-100 group-hover:text-teal-400 transition-colors">
              {visitorStats ? visitorStats.todayVisits.toLocaleString() : '---'}
            </div>
            <p className="text-[10px] font-mono text-slate-500 mt-2">Visits recorded today</p>
          </div>
        </div>

        {/* 7-Day Velocity Chart & Live Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* 7-Day Trend Chart (5 cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center justify-between mb-4">
                <span>7-Day Visitor Trend</span>
                <Globe className="w-3.5 h-3.5 text-slate-400" />
              </h3>

              {/* Bar Chart */}
              <div className="h-36 flex items-end gap-2 pt-4 px-2 border-b border-slate-800">
                {visitorStats?.dailyTrend?.map((item, idx) => {
                  const maxVal = Math.max(...(visitorStats.dailyTrend.map((d) => d.count) || [1]), 20);
                  const heightPct = Math.max(12, Math.round((item.count / maxVal) * 100));
                  const isToday = idx === visitorStats.dailyTrend.length - 1;

                  return (
                    <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-slate-800 text-cyan-300 font-mono text-[10px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-10 border border-slate-700">
                        {item.count} visits
                      </div>
                      <div className="w-full bg-slate-900 rounded-t overflow-hidden h-28 flex items-end">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full transition-all duration-500 rounded-t ${
                            isToday
                              ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 shadow-md shadow-cyan-500/20'
                              : 'bg-slate-700 group-hover:bg-slate-600'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-mono ${isToday ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
                        {item.date}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Average Daily Traffic:</span>
              <span className="font-bold text-slate-200">
                {visitorStats && visitorStats.dailyTrend?.length
                  ? Math.round(
                      visitorStats.dailyTrend.reduce((acc, curr) => acc + curr.count, 0) /
                        visitorStats.dailyTrend.length
                    )
                  : 0}{' '}
                visits/day
              </span>
            </div>
          </div>

          {/* Real-Time Live Activity Feed (7 cols) */}
          <div className="lg:col-span-7 p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span>Recent Live Traffic Logs</span>
                <span className="text-[10px] font-normal text-slate-500">({visitorStats?.recentVisits?.length || 0} entries)</span>
              </h3>
            </div>

            {!visitorStats?.recentVisits || visitorStats.recentVisits.length === 0 ? (
              <p className="text-xs font-mono text-slate-500 py-8 text-center">No recent visits recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {visitorStats.recentVisits.slice(0, 8).map((visit) => {
                  const isMobile = visit.device?.toLowerCase().includes('mobile');
                  const timeAgo = new Date(visit.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <div
                      key={visit.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="p-1.5 rounded-md bg-slate-800 text-slate-400 flex-shrink-0">
                          {isMobile ? <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> : <Laptop className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 truncate">{visit.device || 'Web Visitor'}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-cyan-300">
                              {visit.path || '/'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{visit.userAgent || 'Browser Client'}</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* METRIC CARDS FOR CONTENT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cmsStats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              onClick={() => setActiveTab(item.tab)}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-400">{item.label}</span>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="text-3xl font-extrabold font-mono text-slate-100 group-hover:text-cyan-400 transition-colors">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold font-mono text-slate-200">Quick Content Actions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('projects')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Project</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Add Technical Skill</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <span>Edit Profile & Taglines</span>
          </button>

          <button
            onClick={onRefreshNews}
            disabled={refreshingNews}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-mono text-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingNews ? 'animate-spin' : ''}`} />
            <span>Trigger Dev.to News Sync</span>
          </button>
        </div>
      </div>

      {/* Recent Contact Submissions */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-slate-200">Recent Contact Form Inquiries</h2>
          <button
            onClick={() => setActiveTab('messages')}
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({messages.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {messages.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 py-4 text-center">No contact form messages received yet.</p>
        ) : (
          <div className="space-y-2">
            {messages.slice(0, 5).map((msg) => (
              <div
                key={msg.id}
                onClick={() => setActiveTab('messages')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  msg.read
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                    : 'bg-slate-900/80 border-cyan-500/40 text-slate-100 font-semibold'
                }`}
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-200">{msg.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">&lt;{msg.email}&gt;</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{msg.message}</p>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

