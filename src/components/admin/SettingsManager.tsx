import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { Save, Upload, Plus, X, Lock, CheckCircle2, ShieldCheck, User, Globe, FileText } from 'lucide-react';
import { api } from '../../lib/api';

interface SettingsManagerProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ settings, onRefresh }) => {
  const [formData, setFormData] = useState<SiteSettings>({ ...settings });
  const [newTagline, setNewTagline] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Admin Password state
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', newEmail: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

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
        [field]: res.url
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
                  value={formData.profilePictureUrl || ''}
                  onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
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
              {formData.profilePictureUrl && (
                <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <img
                    src={formData.profilePictureUrl}
                    alt="Preview"
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
                    href={formData.resumeUrl}
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
