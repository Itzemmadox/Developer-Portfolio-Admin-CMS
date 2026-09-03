import React, { useState } from 'react';
import { Project } from '../../types';
import { Plus, Edit2, Trash2, Upload, Sparkles, ExternalLink, Github, X, Save, ArrowUp, ArrowDown, AlertTriangle, Check } from 'lucide-react';
import { api } from '../../lib/api';

interface ProjectsManagerProps {
  projects: Project[];
  onRefresh: () => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ projects, onRefresh }) => {
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionStatus, setActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenAdd = () => {
    setEditingProject({
      title: '',
      slug: '',
      shortDescription: '',
      fullDescription: '',
      techStack: ['React', 'TypeScript', 'Node.js'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      galleryUrls: [],
      liveUrl: '',
      githubUrl: '',
      featured: false,
      order: projects.length + 1
    });
    setIsNew(true);
  };

  const handleOpenEdit = (p: Project) => {
    setEditingProject({ ...p });
    setIsNew(false);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    setActionStatus(null);
    try {
      await api.deleteProject(projectToDelete.id);
      setActionStatus({
        type: 'success',
        message: `Project "${projectToDelete.title}" deleted successfully.`
      });
      if (editingProject?.id === projectToDelete.id) {
        setEditingProject(null);
      }
      setProjectToDelete(null);
      onRefresh();
    } catch (err: any) {
      console.error('Delete project error:', err);
      setActionStatus({
        type: 'error',
        message: err.message || 'Failed to delete project. Please try again.'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title) return;

    setSaving(true);
    try {
      if (isNew) {
        await api.createProject(editingProject);
      } else if (editingProject.id) {
        await api.updateProject(editingProject.id, editingProject);
      }
      setEditingProject(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isGallery = false) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const res = await api.uploadFiles(e.target.files);
      if (isGallery) {
        const currentGallery = editingProject?.galleryUrls || [];
        setEditingProject({
          ...editingProject,
          galleryUrls: [...currentGallery, ...res.urls]
        });
      } else {
        setEditingProject({
          ...editingProject,
          thumbnailUrl: res.url
        });
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const current = editingProject?.techStack || [];
    if (!current.includes(tagInput.trim())) {
      setEditingProject({
        ...editingProject,
        techStack: [...current, tagInput.trim()]
      });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    const current = editingProject?.techStack || [];
    setEditingProject({
      ...editingProject,
      techStack: current.filter((t) => t !== tag)
    });
  };

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const copy = [...projects];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const orders = copy.map((p, i) => ({ id: p.id, order: i + 1 }));
    try {
      await api.reorderProjects(orders);
      onRefresh();
    } catch (err: any) {
      alert('Failed to reorder projects');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-slate-100">Projects CMS Manager</h1>
          <p className="text-xs font-mono text-slate-400">
            Create, edit, reorder, and manage case studies rendered on the public portfolio.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Action Status Banner */}
      {actionStatus && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between gap-3 ${
            actionStatus.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{actionStatus.message}</span>
          </div>
          <button
            onClick={() => setActionStatus(null)}
            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Projects Table / List */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Project Title</th>
                <th className="p-4">Tech Stack</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-900/80 transition-colors">
                  <td className="p-4 font-bold text-cyan-400">
                    <div className="flex items-center gap-1">
                      <span>#{p.order}</span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleReorder(index, 'up')}
                          disabled={index === 0}
                          className="hover:text-cyan-300 disabled:opacity-20"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleReorder(index, 'down')}
                          disabled={index === projects.length - 1}
                          className="hover:text-cyan-300 disabled:opacity-20"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                        alt={p.title}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-800"
                      />
                      <div>
                        <p className="font-bold text-slate-100">{p.title}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-xs">{p.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {p.techStack?.slice(0, 3).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-cyan-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {p.featured ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Standard</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setActionStatus(null);
                          setProjectToDelete(p);
                        }}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title={`Delete ${p.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold font-mono text-cyan-400">
                {isNew ? 'Add New Portfolio Project' : `Edit: ${editingProject.title}`}
              </h2>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  value={editingProject.title || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={editingProject.shortDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Full Description (Markdown/Text)</label>
                <textarea
                  rows={4}
                  value={editingProject.fullDescription || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, fullDescription: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* Thumbnail URL + File Upload */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Thumbnail Image</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingProject.thumbnailUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnailUrl: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 cursor-pointer flex items-center gap-1 border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, false)} />
                  </label>
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Tech Stack Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Docker, Gemini API"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editingProject.techStack?.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-xs font-mono text-cyan-300"
                    >
                      <span>{t}</span>
                      <button type="button" onClick={() => handleRemoveTag(t)} className="hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Live & GitHub Links */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Live Demo URL</label>
                  <input
                    type="text"
                    value={editingProject.liveUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">GitHub Repo URL</label>
                  <input
                    type="text"
                    value={editingProject.githubUrl || ''}
                    onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={editingProject.featured || false}
                  onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="featured-check" className="text-xs font-mono text-slate-300 cursor-pointer">
                  Mark as Featured Project on Hero & Home Grid
                </label>
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-800">
                {!isNew && editingProject?.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const fullProj = projects.find((p) => p.id === editingProject.id) || (editingProject as Project);
                      setProjectToDelete(fullProj);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Project</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-100">Delete Project</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Permanent database removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Preview Snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center gap-3">
              <img
                src={projectToDelete.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80'}
                alt={projectToDelete.title}
                className="w-12 h-12 rounded-lg object-cover border border-slate-800 flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-slate-100 truncate">{projectToDelete.title}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  Order #{projectToDelete.order} {projectToDelete.techStack?.length ? `• ${projectToDelete.techStack.slice(0, 3).join(', ')}` : ''}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Are you sure you want to delete <span className="text-rose-300 font-bold">"{projectToDelete.title}"</span>? This will permanently remove the case study from the public portfolio and database.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
