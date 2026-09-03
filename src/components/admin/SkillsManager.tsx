import React, { useState, useEffect } from 'react';
import { Skill } from '../../types';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Cpu,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Check,
  Loader2,
  Layers,
  Search,
  ArrowUpDown,
  Move
} from 'lucide-react';
import { api } from '../../lib/api';

interface SkillsManagerProps {
  skills: Skill[];
  onRefresh: () => void;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({ skills, onRefresh }) => {
  const [items, setItems] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const categories: Skill['category'][] = [
    'Frontend',
    'Backend',
    'Cloud & DevOps',
    'Database',
    'Tools & Other'
  ];

  // Sync internal items whenever skills prop updates
  useEffect(() => {
    const sorted = [...skills].sort((a, b) => (a.order || 0) - (b.order || 0));
    setItems(sorted);
  }, [skills]);

  // Temporary success banner
  const triggerSuccessMsg = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => {
      setSaveSuccessMsg((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleOpenAdd = () => {
    setEditingSkill({
      name: '',
      iconUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      level: 85,
      yearsExperience: 3,
      category: 'Frontend',
      order: items.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (sk: Skill) => {
    setEditingSkill({ ...sk });
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSkill(id);
      setConfirmingDeleteId(null);
      triggerSuccessMsg('Skill deleted successfully');
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete skill: ' + (err.message || 'Unknown error'));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill?.name) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createSkill(editingSkill);
        triggerSuccessMsg('New skill added successfully');
      } else if (editingSkill.id) {
        await api.updateSkill(editingSkill.id, editingSkill);
        triggerSuccessMsg('Skill updated successfully');
      }
      setEditingSkill(null);
      onRefresh();
    } catch (err: any) {
      alert('Failed to save skill: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // Reorder persistence helper
  const persistNewOrder = async (newOrderedList: Skill[]) => {
    const ordersPayload = newOrderedList.map((item, idx) => ({
      id: item.id,
      order: idx + 1
    }));

    // Optimistically update local state with corrected order numbers
    const updatedItems = newOrderedList.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    setItems(updatedItems);
    setReordering(true);

    try {
      await api.reorderSkills(ordersPayload);
      triggerSuccessMsg('Skills rearranged & saved');
      onRefresh();
    } catch (err: any) {
      console.error('Failed to reorder skills:', err);
      alert('Failed to save reordered skills. Reverting.');
      onRefresh();
    } finally {
      setReordering(false);
    }
  };

  // 1-step move up / down
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newList = [...items];
    const [movedItem] = newList.splice(currentIndex, 1);
    newList.splice(targetIndex, 0, movedItem);

    persistNewOrder(newList);
  };

  // Direct move to specific position (1-based index)
  const handleMoveToPosition = (id: string, newPosition: number) => {
    const currentIndex = items.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;

    const targetIndex = Math.max(0, Math.min(newPosition - 1, items.length - 1));
    if (targetIndex === currentIndex) return;

    const newList = [...items];
    const [movedItem] = newList.splice(currentIndex, 1);
    newList.splice(targetIndex, 0, movedItem);

    persistNewOrder(newList);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    const index = items.findIndex((i) => i.id === id);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set transparent or standard drag ghost
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const index = items.findIndex((i) => i.id === id);
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    const targetIndex = items.findIndex((i) => i.id === targetId);
    if (targetIndex === -1 || targetIndex === draggedIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newList = [...items];
    const [movedItem] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    persistNewOrder(newList);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Auto-sort helpers
  const handleSortPreset = (type: 'alphabetical' | 'proficiency' | 'category') => {
    let sorted = [...items];
    if (type === 'alphabetical') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'proficiency') {
      sorted.sort((a, b) => (b.level || 0) - (a.level || 0));
    } else if (type === 'category') {
      sorted.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    }
    persistNewOrder(sorted);
  };

  // Filter skills for display
  const filteredSkills = items.filter((sk) => {
    const matchesCategory = activeCategory === 'All' || sk.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      sk.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sk.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              Skills & Tech Stack Manager
            </h1>
            {reordering && (
              <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving order...
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Drag items using the handle or use Up/Down arrows to manually arrange how skills appear on your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            id="add-skill-button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-cyan-400" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Quick Sorting Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeCategory === 'All'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              All ({items.length})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter skills..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Quick Sorting Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Quick Auto-Order Presets:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSortPreset('proficiency')}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] transition-colors cursor-pointer"
              title="Order highest proficiency first"
            >
              By Proficiency (%)
            </button>
            <button
              onClick={() => handleSortPreset('category')}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] transition-colors cursor-pointer"
              title="Group by category"
            >
              By Category
            </button>
            <button
              onClick={() => handleSortPreset('alphabetical')}
              className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] transition-colors cursor-pointer"
              title="Order A to Z"
            >
              A to Z
            </button>
          </div>
        </div>
      </div>

      {/* Skills List / Grid with Drag & Reorder Controls */}
      {filteredSkills.length === 0 ? (
        <div className="py-12 text-center bg-slate-900/30 border border-slate-800 rounded-2xl">
          <Cpu className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-xs text-slate-400 font-mono">No skills found matching your filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredSkills.map((s) => {
            const globalIndex = items.findIndex((item) => item.id === s.id);
            const isFirst = globalIndex === 0;
            const isLast = globalIndex === items.length - 1;
            const isDragging = draggedIndex === globalIndex;
            const isOver = dragOverIndex === globalIndex;

            return (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => handleDragStart(e, s.id)}
                onDragOver={(e) => handleDragOver(e, s.id)}
                onDrop={(e) => handleDrop(e, s.id)}
                onDragEnd={handleDragEnd}
                className={`p-4 rounded-2xl bg-slate-900/80 border transition-all duration-200 flex flex-col justify-between gap-3 select-none ${
                  isDragging
                    ? 'opacity-40 border-cyan-500 scale-[0.98]'
                    : isOver
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-slate-800/90'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/60 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Drag Grip Handle */}
                  <div
                    className="p-1.5 text-slate-500 hover:text-cyan-400 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-800/80 transition-colors"
                    title="Drag and drop to rearrange"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Order Badge & Position Selector */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-bold flex items-center justify-center">
                      #{globalIndex + 1}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden p-1.5">
                    {s.iconUrl ? (
                      <img
                        src={s.iconUrl}
                        alt={s.name}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          // Fallback on broken image
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-cyan-400">
                        <Cpu className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Skill Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-100 truncate">{s.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/60">
                        {s.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1">
                      <span>Proficiency: <strong className="text-cyan-400">{s.level}%</strong></span>
                      <span>•</span>
                      <span>{s.yearsExperience} yrs exp</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar preview */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all"
                    style={{ width: `${s.level || 80}%` }}
                  />
                </div>

                {/* Rearrange & Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  {/* Move Up / Down Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(s.id, 'up')}
                      disabled={isFirst || reordering}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(s.id, 'down')}
                      disabled={isLast || reordering}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 disabled:opacity-20 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick position jump dropdown */}
                    <div className="ml-1.5 flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-500">Jump to:</span>
                      <select
                        value={globalIndex + 1}
                        onChange={(e) => handleMoveToPosition(s.id, Number(e.target.value))}
                        disabled={reordering}
                        className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400 outline-none cursor-pointer"
                      >
                        {items.map((_, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            #{idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Edit & Delete Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors cursor-pointer"
                      title="Edit skill details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {confirmingDeleteId === s.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-mono font-bold transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingDeleteId(s.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-base font-bold font-mono text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                {isNew ? 'Add Technical Skill' : `Edit: ${editingSkill.name}`}
              </h2>
              <button
                onClick={() => setEditingSkill(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-slate-100 cursor-pointer"
              >
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
                  placeholder="e.g. React.js, TypeScript, Docker"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={editingSkill.category || 'Frontend'}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Display Order Position</label>
                  <input
                    type="number"
                    min="1"
                    value={editingSkill.order || items.length + 1}
                    onChange={(e) => setEditingSkill({ ...editingSkill, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Icon URL (Devicon, SVG, or Image)</label>
                <input
                  type="text"
                  value={editingSkill.iconUrl || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, iconUrl: e.target.value })}
                  placeholder="https://cdn.jsdelivr.net/gh/devicons/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500"
                />
                {editingSkill.iconUrl && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <img
                      src={editingSkill.iconUrl}
                      alt="Preview"
                      className="w-6 h-6 object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] text-slate-400 truncate">Icon Preview</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Proficiency ({editingSkill.level || 80}%)</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={editingSkill.level || 80}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: Number(e.target.value) })}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={editingSkill.yearsExperience ?? 1}
                    onChange={(e) => setEditingSkill({ ...editingSkill, yearsExperience: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
