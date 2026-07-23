import React, { useState } from 'react';
import { Education } from '../../types';
import { Plus, Edit2, Trash2, Save, X, GraduationCap } from 'lucide-react';
import { api } from '../../lib/api';

interface EducationManagerProps {
  education: Education[];
  onRefresh: () => void;
}

export const EducationManager: React.FC<EducationManagerProps> = ({ education, onRefresh }) => {
  const [editingEdu, setEditingEdu] = useState<Partial<Education> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingEdu({
      institution: '',
      degree: 'B.S.',
      fieldOfStudy: '',
      startDate: '2019-09-01',
      endDate: '2023-05-30',
      description: '',
      order: education.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (edu: Education) => {
    setEditingEdu({ ...edu });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    try {
      await api.deleteEducation(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete education');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdu?.institution) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createEducation(editingEdu);
      } else if (editingEdu.id) {
        await api.updateEducation(editingEdu.id, editingEdu);
      }
      setEditingEdu(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save education');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Education Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Manage academic degrees, institutions, and specializations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Education</span>
        </button>
      </div>

      <div className="space-y-4">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  {edu.degree} in {edu.fieldOfStudy}
                </h3>
                <p className="text-xs text-cyan-400 font-mono">{edu.institution}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {edu.startDate} — {edu.endDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(edu)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingEdu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold font-mono text-cyan-400">
                {isNew ? 'Add Education Entry' : `Edit: ${editingEdu.institution}`}
              </h2>
              <button onClick={() => setEditingEdu(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Institution *</label>
                <input
                  type="text"
                  required
                  value={editingEdu.institution || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Degree</label>
                  <input
                    type="text"
                    value={editingEdu.degree || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={editingEdu.fieldOfStudy || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, fieldOfStudy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Start Date</label>
                  <input
                    type="text"
                    value={editingEdu.startDate || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">End Date</label>
                  <input
                    type="text"
                    value={editingEdu.endDate || ''}
                    onChange={(e) => setEditingEdu({ ...editingEdu, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingEdu.description || ''}
                  onChange={(e) => setEditingEdu({ ...editingEdu, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEdu(null)}
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
                  <span>{saving ? 'Saving...' : 'Save Entry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
