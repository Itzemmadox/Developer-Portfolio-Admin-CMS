import React, { useState } from 'react';
import { Experience } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Briefcase, Upload, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface ExperienceManagerProps {
  experience: Experience[];
  onRefresh: () => void;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({ experience, onRefresh }) => {
  const [editingExp, setEditingExp] = useState<Partial<Experience> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setUploadError(null);
    setEditingExp({
      company: '',
      role: '',
      companyLogoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
      startDate: '2023-01-01',
      endDate: '',
      description: '',
      order: experience.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (exp: Experience) => {
    setUploadError(null);
    setEditingExp({ ...exp });
    setIsNew(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const res = await api.uploadFiles(files);
      if (res && res.url) {
        setEditingExp((prev) => (prev ? { ...prev, companyLogoUrl: res.url } : prev));
      }
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setUploadError(err.message || 'Failed to upload image from local storage');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteExperience(id);
      setConfirmingDeleteId(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete experience');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp?.company || !editingExp?.role) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createExperience(editingExp);
      } else if (editingExp.id) {
        await api.updateExperience(editingExp.id, editingExp);
      }
      setEditingExp(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save experience');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Work Experience Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Manage your employment history, job roles, achievements, and companies.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      <div className="space-y-4">
        {experience.map((e) => (
          <div
            key={e.id}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center flex-shrink-0 text-cyan-400">
                {e.companyLogoUrl ? (
                  <img
                    src={e.companyLogoUrl}
                    alt={e.company}
                    className="w-full h-full object-cover"
                    onError={(ev) => {
                      (ev.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Briefcase className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">{e.role}</h3>
                <p className="text-xs text-cyan-400 font-mono">
                  {e.company} ({e.startDate} — {e.endDate || 'Present'})
                </p>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{e.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleOpenEdit(e)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Edit experience"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              {confirmingDeleteId === e.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold transition-colors shadow-sm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmingDeleteId(null)}
                    className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDeleteId(e.id)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete experience"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold font-mono text-cyan-400">
                {isNew ? 'Add Work Experience' : `Edit Role at ${editingExp.company}`}
              </h2>
              <button onClick={() => setEditingExp(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.company || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={editingExp.role || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={editingExp.startDate || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date (leave empty if Present)</label>
                  <input
                    type="date"
                    value={editingExp.endDate || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400">Company Logo / Image</label>
                  {editingExp.companyLogoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingExp({ ...editingExp, companyLogoUrl: '' })}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-mono transition-colors"
                    >
                      Remove logo
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload from local storage"
                    value={editingExp.companyLogoUrl || ''}
                    onChange={(e) => setEditingExp({ ...editingExp, companyLogoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <label
                    className={`px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer flex items-center gap-1.5 border border-slate-700 transition-all select-none ${
                      uploading ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    ) : (
                      <Upload className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="font-mono text-xs font-semibold">
                      {uploading ? 'Uploading...' : 'Upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {uploadError && (
                  <p className="mt-1 text-[11px] text-rose-400 font-mono">{uploadError}</p>
                )}

                {editingExp.companyLogoUrl && (
                  <div className="mt-2.5 p-2 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center flex-shrink-0">
                      <img
                        src={editingExp.companyLogoUrl}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(ev) => {
                          (ev.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-slate-300 truncate font-mono">
                        {editingExp.companyLogoUrl}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Image preview
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description & Achievements</label>
                <textarea
                  rows={4}
                  value={editingExp.description || ''}
                  onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingExp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-1 shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Experience'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
