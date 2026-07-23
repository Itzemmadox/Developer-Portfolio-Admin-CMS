import React, { useState } from 'react';
import { Testimonial } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Quote } from 'lucide-react';
import { api } from '../../lib/api';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({ testimonials, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setEditingItem({
      quote: '',
      authorName: '',
      authorRole: '',
      authorPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      order: testimonials.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    setEditingItem({ ...t });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await api.deleteTestimonial(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete testimonial');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.quote || !editingItem?.authorName) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createTestimonial(editingItem);
      } else if (editingItem.id) {
        await api.updateTestimonial(editingItem.id, editingItem);
      }
      setEditingItem(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Testimonials CMS Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Manage peer reviews, leadership endorsements, and client quotes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="space-y-4">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs italic text-slate-300">"{t.quote}"</p>
                <p className="text-xs font-bold text-slate-100 font-mono mt-2">
                  — {t.authorName} <span className="text-slate-400 font-normal">({t.authorRole})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(t)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
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
                {isNew ? 'Add Testimonial' : `Edit: ${editingItem.authorName}`}
              </h2>
              <button onClick={() => setEditingItem(null)} className="p-1 rounded bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Quote Text *</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.quote || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.authorName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authorName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Author Role & Company</label>
                  <input
                    type="text"
                    value={editingItem.authorRole || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authorRole: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Author Photo URL</label>
                <input
                  type="text"
                  value={editingItem.authorPhotoUrl || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, authorPhotoUrl: e.target.value })}
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
                  <span>{saving ? 'Saving...' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
