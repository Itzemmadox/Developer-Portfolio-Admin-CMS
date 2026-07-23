import React, { useState } from 'react';
import { Skill } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Cpu } from 'lucide-react';
import { api } from '../../lib/api';

interface SkillsManagerProps {
  skills: Skill[];
  onRefresh: () => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({ skills, onRefresh }) => {
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories: Skill['category'][] = ['Frontend', 'Backend', 'Cloud & DevOps', 'Database', 'Tools & Other'];

  const handleOpenAdd = () => {
    setEditingSkill({
      name: '',
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      level: 85,
      yearsExperience: 3,
      category: 'Frontend',
      order: skills.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (sk: Skill) => {
    setEditingSkill({ ...sk });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;
    try {
      await api.deleteSkill(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete skill');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createSkill(editingSkill);
      } else if (editingSkill.id) {
        await api.updateSkill(editingSkill.id, editingSkill);
      }
      setEditingSkill(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Skills & Tech Stack Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Manage proficiency ratings, icons, experience years, and skill categories.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              {s.iconUrl ? (
                <img src={s.iconUrl} alt={s.name} className="w-8 h-8 object-contain" />
              ) : (
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-4 h-4" />
                </div>
              )}
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-100 truncate">{s.name}</h3>
                <p className="text-[10px] font-mono text-slate-400">
                  {s.category} • {s.level}% • {s.yearsExperience} yrs
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEdit(s)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold font-mono text-cyan-400">
                {isNew ? 'Add Technical Skill' : `Edit: ${editingSkill.name}`}
              </h2>
              <button onClick={() => setEditingSkill(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Skill Name *</label>
                <input
                  type="text"
                  required
                  value={editingSkill.name || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={editingSkill.category || 'Frontend'}
                  onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Icon URL (Devicon / Image)</label>
                <input
                  type="text"
                  value={editingSkill.iconUrl || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, iconUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Proficiency Level ({editingSkill.level || 80}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={editingSkill.level || 80}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: Number(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={editingSkill.yearsExperience || 1}
                    onChange={(e) => setEditingSkill({ ...editingSkill, yearsExperience: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Skill'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
