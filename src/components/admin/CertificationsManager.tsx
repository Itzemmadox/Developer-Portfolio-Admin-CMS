import React, { useState } from 'react';
import { Certification } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Award } from 'lucide-react';
import { api } from '../../lib/api';

interface CertificationsManagerProps {
  certifications: Certification[];
  onRefresh: () => void;
}

export const CertificationsManager: React.FC<CertificationsManagerProps> = ({
  certifications,
  onRefresh
}) => {
  const [editingItem, setEditingItem] = useState<Partial<Certification> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem({
      title: '',
      issuingOrg: '',
      issueDate: '2023-01-01',
      credentialUrl: '',
      badgeImageUrl: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=200&q=80',
      order: certifications.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (c: Certification) => {
    setEditingItem({ ...c });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    try {
      await api.deleteCertification(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete certification');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.issuingOrg) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createCertification(editingItem);
      } else if (editingItem.id) {
        await api.updateCertification(editingItem.id, editingItem);
      }
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Certifications Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Manage professional certificates, badges, and verification links.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Certification</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">{c.title}</h3>
                <p className="text-xs text-emerald-400 font-mono">{c.issuingOrg}</p>
                <p className="text-[10px] text-slate-500 font-mono">Issued: {c.issueDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold font-mono text-cyan-400">
                {isNew ? 'Add Certification' : `Edit: ${editingItem.title}`}
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Certification Title *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Issuing Organization *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.issuingOrg || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, issuingOrg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={editingItem.issueDate || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, issueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Verification URL</label>
                <input
                  type="text"
                  value={editingItem.credentialUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, credentialUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Badge Image URL</label>
                <input
                  type="text"
                  value={editingItem.badgeImageUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, badgeImageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Certification'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
