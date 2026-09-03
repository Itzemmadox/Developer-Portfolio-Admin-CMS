import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../../types';
import { Save, Upload, Plus, X, Lock, CheckCircle2, ShieldCheck, User, Globe, FileText, Database, HardDrive, Cloud, Server, Sparkles, Award, Briefcase, Code } from 'lucide-react';
import { api, getSafeDocumentUrl } from '../../lib/api';

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefresh: () => void;
  certificatesCount?: number;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onRefresh, certificatesCount = 0 }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [newTagline, setNewTagline] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // System Database & Cloudinary Status State
  const [systemStatus, setSystemStatus] = useState<{
    database: { type: string; status: string; details: any };
    storage: { type: string; status: string; cloudName: string | null };
  } | null>(null);

  // Admin Password state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', newEmail: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  useEffect(() => {
    api.getSystemStatus()
      .then((status) => setSystemStatus(status))
      .catch((err) => console.warn('Failed to load system status:', err));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await api.updateSettings(formData);
      setFormData(updated);
      setSuccessMsg('Site settings updated successfully! Public site view has been refreshed.');
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePictureUrl' | 'resumeUrl') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await api.uploadFiles(e.target.files);
      const updatedFormData = {
        ...formData,
        [field]: res.url,
        ...(field === 'profilePictureUrl' ? { avatarUrl: res.url, profilePictureUrl: res.url } : {})
      };
      const saved = await api.updateSettings(updatedFormData);
      setFormData(saved);
      const label = field === 'profilePictureUrl' ? 'Profile picture' : 'Resume / CV';
      setSuccessMsg(`${label} uploaded and saved! Live site view updated.`);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(`File upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTagline = () => {
    if (!newTagline.trim()) return;
    const current = formData.heroTaglines || [];
    setFormData({
      ...formData,
      heroTaglines: [...current, newTagline.trim()]
    });
    setNewTagline('');
  };

  const handleRemoveTagline = (index: number) => {
    const current = formData.heroTaglines || [];
    setFormData({
      ...formData,
      heroTaglines: current.filter((_, i) => i !== index)
    });
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwData.currentPassword) return;
    setPwSaving(true);
    setPwMsg(null);

    try {
      const res = await api.updateAdminPassword(pwData);
      setPwMsg(res.message || 'Password updated successfully!');
      setPwData({ currentPassword: '', newPassword: '', newEmail: '' });
    } catch (err: any) {
      setPwMsg(`Error: ${err.message || 'Failed to update credentials'}`);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-mono text-slate-100">Site Settings CMS</h1>
        <p className="text-xs font-mono text-slate-400">
          Global developer profile, rotating hero phrases, profile photo, resume, and SEO metadata.
        </p>
      </div>

      {/* DATABASE & STORAGE STATUS DISPLAY */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-slate-100">Database & Media Cloud Storage Status</h2>
              <p className="text-[11px] font-mono text-slate-400">Real-time status of MongoDB Mongoose ORM & Cloudinary Media CDN</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Dual-Storage Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* MongoDB Status Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                MongoDB (Mongoose)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                systemStatus?.database.status === 'Connected'
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                {systemStatus?.database.status || 'Checking...'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {systemStatus?.database.status === 'Connected'
                ? 'Connected directly to MongoDB Atlas cluster with Mongoose ORM models.'
                : 'Running on local JSON database engine. All edits, projects, and messages persist continuously.'}
            </p>
            {systemStatus?.database.details?.error && (
              <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-300 space-y-1">
                <p className="font-bold">Notice / Resolution:</p>
                <p>{systemStatus.database.details.error}</p>
              </div>
            )}
          </div>

          {/* Cloudinary Status Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-cyan-400" />
                Cloudinary Media CDN
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                systemStatus?.storage.status === 'Connected'
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {systemStatus?.storage.status || 'Checking...'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              {systemStatus?.storage.status === 'Connected'
                ? `Connected to Cloudinary (${systemStatus.storage.cloudName || 'Active'}). Uploads stored in dedicated folder: "${(systemStatus.storage as any).folder || 'portfolio_uploads'}" (subfolders: /images for photos, /documents for PDFs & files).`
                : 'Active with local uploads directory. Set CLOUDINARY_CLOUD_NAME, API_KEY, and SECRET to stream uploads to Cloudinary.'}
            </p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Basic Profile */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Developer Name & Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Developer Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Engineering Role / Title</label>
              <input
                type="text"
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Short Bio (Hero & Subtitle)</label>
            <textarea
              rows={2}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Full About Story (Bio Page)</label>
            <textarea
              rows={5}
              value={formData.aboutContent || ''}
              onChange={(e) => setFormData({ ...formData, aboutContent: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 resize-none"
            />
          </div>
        </div>

        {/* About Page Stats & Counters (Years Experience, Projects Delivered, Certifications, Client Rating) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>About Page Highlights & Counters</span>
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Customize the 4 key metrics displayed on the About Me section.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-[11px] font-mono text-indigo-300 w-fit">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Editable CMS Metrics</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Years of Experience */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Years of Experience</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">Stat Card 1</span>
              </div>
              <input
                type="text"
                value={formData.aboutStats?.yearsExperience ?? '2+'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aboutStats: {
                      ...(formData.aboutStats || {}),
                      yearsExperience: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                placeholder="e.g. 2+ or 3+ Years"
              />
              <p className="text-[11px] text-slate-500 font-mono">
                Shown under "Years Experience" on the About page.
              </p>
            </div>

            {/* Projects Delivered */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Projects Delivered</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">Stat Card 2</span>
              </div>
              <input
                type="text"
                value={formData.aboutStats?.projectsDelivered ?? '20+'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aboutStats: {
                      ...(formData.aboutStats || {}),
                      projectsDelivered: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                placeholder="e.g. 20+ or 25+"
              />
              <p className="text-[11px] text-slate-500 font-mono">
                Total delivered projects milestone display.
              </p>
            </div>

            {/* Client Rating */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Client Rating</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">Stat Card 4</span>
              </div>
              <input
                type="text"
                value={formData.aboutStats?.clientRating ?? '100%'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aboutStats: {
                      ...(formData.aboutStats || {}),
                      clientRating: e.target.value
                    }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                placeholder="e.g. 100% or 5.0 ★"
              />
              <p className="text-[11px] text-slate-500 font-mono">
                Satisfaction rate or quality score.
              </p>
            </div>

            {/* Certifications Counter with Smart Sync */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Certifications Counter</span>
                </label>
                <span className="text-[10px] font-mono text-slate-500">Stat Card 3</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.aboutStats?.certifications ?? 'auto'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      aboutStats: {
                        ...(formData.aboutStats || {}),
                        certifications: e.target.value
                      }
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:border-cyan-400 outline-none"
                  placeholder="auto (or custom e.g. 2, 5+)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      aboutStats: {
                        ...(formData.aboutStats || {}),
                        certifications: 'auto'
                      }
                    })
                  }
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition-colors ${
                    (formData.aboutStats?.certifications || 'auto').toLowerCase() === 'auto'
                      ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                  title="Reset to dynamic auto-sync"
                >
                  Auto
                </button>
              </div>

              {/* Dynamic rule & Live Preview */}
              {(() => {
                const certOverride = formData.aboutStats?.certifications?.trim();
                const cCount = certificatesCount ?? 0;
                let dynamicCertPreview = '';
                let dynamicCertLabel = 'Certifications';
                if (certOverride && certOverride.toLowerCase() !== 'auto') {
                  dynamicCertPreview = certOverride;
                } else {
                  if (cCount < 5) {
                    dynamicCertPreview = String(cCount);
                    dynamicCertLabel = cCount === 1 ? 'Certificate' : 'Certifications';
                  } else if (cCount < 10) {
                    dynamicCertPreview = '5+';
                    dynamicCertLabel = 'Certifications';
                  } else {
                    dynamicCertPreview = '10+';
                    dynamicCertLabel = 'Certifications';
                  }
                }
                return (
                  <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1.5 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current live display:</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        {dynamicCertPreview} {dynamicCertLabel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      ⚡ <strong className="text-slate-300">Auto logic:</strong> &lt; 5 certs shows exact count (currently: {certificatesCount}), 5–9 shows "5+", 10+ shows "10+".
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Media Assets (Profile Photo & CV) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Profile Photo & Resume/CV Uploads</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Profile Photo URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.profilePictureUrl || formData.avatarUrl || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      profilePictureUrl: e.target.value,
                      avatarUrl: e.target.value
                    })
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  placeholder="https://images.unsplash.com/... or upload"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 cursor-pointer border border-slate-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'profilePictureUrl')}
                  />
                </label>
              </div>
              {(formData.profilePictureUrl || formData.avatarUrl) && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <img
                    src={formData.profilePictureUrl || formData.avatarUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-800"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="text-[11px] font-mono text-slate-400">Current Photo Preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Resume / CV File URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.resumeUrl || ''}
                  onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  placeholder="https://... or upload PDF"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-indigo-400 cursor-pointer border border-slate-700 flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>PDF Upload</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'resumeUrl')}
                  />
                </label>
              </div>
              {formData.resumeUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={getSafeDocumentUrl(formData.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Test Attached Resume / CV Link</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hero Rotating Taglines */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400">Hero Rotating Taglines</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Architecting Distributed Microservices"
              value={newTagline}
              onChange={(e) => setNewTagline(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleAddTagline}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tagline</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.heroTaglines?.map((tagline, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono"
              >
                <span>{tagline}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTagline(i)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Social Links</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">GitHub URL</label>
              <input
                type="text"
                value={formData.socialLinks?.github || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">LinkedIn URL</label>
              <input
                type="text"
                value={formData.socialLinks?.linkedin || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Twitter / X URL</label>
              <input
                type="text"
                value={formData.socialLinks?.twitter || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Contact Email Address</label>
              <input
                type="text"
                value={formData.socialLinks?.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, email: e.target.value }
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* SEO Meta */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold font-mono text-cyan-400">SEO & Browser Header Meta</h2>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Site Title Tag</label>
            <input
              type="text"
              value={formData.seo?.siteTitle || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, siteTitle: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={formData.seo?.metaDescription || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaDescription: e.target.value }
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
        </button>
      </form>

      {/* Admin Credentials Change */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 pt-6 border-t border-slate-800">
        <h2 className="text-sm font-bold font-mono text-rose-400 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>Change Admin Login Password</span>
        </h2>

        {pwMsg && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
            {pwMsg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-3 font-mono text-xs max-w-md">
          <div>
            <label className="block text-slate-400 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={pwData.currentPassword}
              onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">New Email (optional)</label>
            <input
              type="email"
              value={pwData.newEmail}
              onChange={(e) => setPwData({ ...pwData, newEmail: e.target.value })}
              placeholder="Leave empty to keep current email"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              value={pwData.newPassword}
              onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
              placeholder="Leave empty to keep current password"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={pwSaving}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold border border-rose-500/30 transition-all"
          >
            {pwSaving ? 'Updating...' : 'Update Admin Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};
