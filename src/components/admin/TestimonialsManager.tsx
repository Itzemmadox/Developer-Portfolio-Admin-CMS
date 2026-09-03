import React, { useState, useRef } from 'react';
import { Testimonial } from '../../types';
import { Plus, Edit2, Trash2, Save, X, Quote, Upload, Link, Image as ImageIcon, Star, Check, AlertCircle, HardDrive, Globe } from 'lucide-react';
import { api } from '../../lib/api';

interface TestimonialsManagerProps {
  testimonials: Testimonial[];
  onRefresh: () => void;
}

export const TestimonialsManager: React.FC<TestimonialsManagerProps> = ({ testimonials, onRefresh }) => {
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAdd = () => {
    setEditingItem({
      quote: '',
      authorName: '',
      authorRole: '',
      authorPhotoUrl: '',
      avatar: '',
      rating: 5,
      order: testimonials.length + 1
    });
    setImageTab('upload');
    setUploadError(null);
    setUploadSuccess(null);
    setIsNew(true);
  };

  const handleOpenEdit = (t: Testimonial) => {
    const photo = t.authorPhotoUrl || t.avatar || '';
    setEditingItem({
      id: t.id,
      quote: t.quote || t.content || '',
      content: t.content || t.quote || '',
      authorName: t.authorName || t.name || '',
      name: t.name || t.authorName || '',
      authorRole: t.authorRole || t.role || '',
      role: t.role || t.authorRole || '',
      authorPhotoUrl: photo,
      avatar: photo,
      rating: typeof t.rating === 'number' ? t.rating : 5,
      order: t.order
    });
    // Default to 'url' tab if it looks like an external http url, otherwise 'upload'
    setImageTab(photo && (photo.startsWith('http://') || photo.startsWith('https://')) ? 'url' : 'upload');
    setUploadError(null);
    setUploadSuccess(null);
    setIsNew(false);
  };

  const processFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const res = await api.uploadFiles([file]);
      if (res && res.url) {
        setEditingItem((prev) => (prev ? { ...prev, authorPhotoUrl: res.url, avatar: res.url } : null));
        setUploadSuccess(`Image "${file.name}" uploaded successfully from local storage!`);
      } else {
        throw new Error('No URL returned from upload server');
      }
    } catch (err: any) {
      console.error('Testimonial image upload error:', err);
      setUploadError(err.message || 'Failed to upload image from local storage.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setEditingItem((prev) => (prev ? { ...prev, authorPhotoUrl: '', avatar: '' } : null));
    setUploadSuccess(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteTestimonial(itemToDelete.id);
      setItemToDelete(null);
      if (editingItem?.id === itemToDelete.id) {
        setEditingItem(null);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete testimonial');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const quote = editingItem?.quote || editingItem?.content || '';
    const authorName = editingItem?.authorName || editingItem?.name || '';
    if (!quote || !authorName) return;

    setSaving(true);
    try {
      const photo = editingItem?.authorPhotoUrl || editingItem?.avatar || '';
      const payload = {
        ...editingItem,
        quote,
        content: quote,
        authorName,
        name: authorName,
        authorRole: editingItem?.authorRole || editingItem?.role || '',
        role: editingItem?.role || editingItem?.authorRole || '',
        authorPhotoUrl: photo,
        avatar: photo,
        rating: typeof editingItem?.rating === 'number' ? editingItem.rating : 5
      };

      if (isNew) {
        await api.createTestimonial(payload);
      } else if (editingItem?.id) {
        await api.updateTestimonial(editingItem.id, payload);
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
            Manage peer reviews, leadership endorsements, and client quotes with local photo uploads or URLs.
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
        {testimonials.map((t) => {
          const author = t.authorName || t.name || 'Anonymous';
          const role = t.authorRole || t.role || '';
          const quote = t.quote || t.content || '';
          const photo = t.authorPhotoUrl || t.avatar || '';
          const initial = author.trim() ? author.trim().charAt(0).toUpperCase() : 'A';
          const ratingCount = typeof t.rating === 'number' ? Math.max(1, Math.min(5, t.rating)) : 5;

          return (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                {/* Author Avatar in CMS List */}
                <div className="flex-shrink-0 mt-0.5">
                  {photo ? (
                    <img
                      src={photo}
                      alt={author}
                      className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-950"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center font-mono font-bold text-xs text-indigo-300">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {[...Array(ratingCount)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs italic text-slate-300 leading-relaxed">"{quote}"</p>
                  <p className="text-xs font-bold text-slate-100 font-mono">
                    — {author} {role && <span className="text-slate-400 font-normal">({role})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Edit testimonial"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setItemToDelete(t)}
                  className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                  title="Delete testimonial"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold font-mono text-cyan-400">
                  {isNew ? 'Add Testimonial' : `Edit: ${editingItem.authorName || 'Testimonial'}`}
                </h2>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              {/* Quote Text */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Quote Text *</label>
                <textarea
                  rows={4}
                  required
                  value={editingItem.quote || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  placeholder="Enter the client endorsement or quote..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Author Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.authorName || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authorName: e.target.value })}
                    placeholder="e.g. Ayo David"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author Role & Company</label>
                  <input
                    type="text"
                    value={editingItem.authorRole || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, authorRole: e.target.value })}
                    placeholder="e.g. VP of Engineering at Apex"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const currentRating = typeof editingItem.rating === 'number' ? editingItem.rating : 5;
                    const isSelected = star <= currentRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditingItem({ ...editingItem, rating: star })}
                        className="p-1 rounded hover:bg-slate-800 transition-colors focus:outline-none"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-5 h-5 ${
                            isSelected ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-slate-400 text-[11px] ml-1">
                    ({editingItem.rating || 5} / 5 Stars)
                  </span>
                </div>
              </div>

              {/* Author Photo: Upload from Local Storage OR Image URL */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Author Photo</span>
                  </label>

                  {/* Mode Tabs: Local Storage Upload vs Image URL */}
                  <div className="flex p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setImageTab('upload');
                        setUploadError(null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        imageTab === 'upload'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <HardDrive className="w-3 h-3" />
                      <span>Local Storage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageTab('url');
                        setUploadError(null);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        imageTab === 'url'
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      <span>Image URL</span>
                    </button>
                  </div>
                </div>

                {/* Local Storage Upload Tab */}
                {imageTab === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? 'border-cyan-400 bg-cyan-950/20'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                      }`}
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-cyan-400 text-xs font-semibold">
                            Uploading photo from local storage...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2.5 rounded-full bg-slate-800/80 text-cyan-400">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-200 font-semibold">
                              Click to choose image from your computer
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              or drag and drop here (PNG, JPG, WEBP, GIF, SVG)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Image URL Tab */}
                {imageTab === 'url' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={editingItem.authorPhotoUrl || editingItem.avatar || ''}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              authorPhotoUrl: e.target.value,
                              avatar: e.target.value
                            })
                          }
                          placeholder="https://example.com/author-photo.jpg"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:border-cyan-400 outline-none text-xs font-mono"
                        />
                      </div>
                      {(editingItem.authorPhotoUrl || editingItem.avatar) && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                          title="Clear URL"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Paste a direct URL to any hosted image file.
                    </p>
                  </div>
                )}

                {/* Upload Status Feedback */}
                {uploadSuccess && (
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{uploadSuccess}</span>
                  </div>
                )}

                {uploadError && (
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Live Preview Box */}
                {(editingItem.authorPhotoUrl || editingItem.avatar) && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={editingItem.authorPhotoUrl || editingItem.avatar}
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover border border-slate-700 bg-slate-950 flex-shrink-0 shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {editingItem.authorName || 'Author Name'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {editingItem.authorRole || 'Author Role'}
                        </p>
                        <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                          <Check className="w-2.5 h-2.5" /> Photo Attached
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-mono transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 hover:bg-cyan-400 transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-100">Delete Testimonial</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Permanent removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <p className="text-xs italic text-slate-300 line-clamp-2 font-mono">
                "{itemToDelete.quote || itemToDelete.content}"
              </p>
              <p className="text-[11px] font-bold text-cyan-400 font-mono">
                — {itemToDelete.authorName || itemToDelete.name}
              </p>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Are you sure you want to delete this testimonial? It will no longer appear on your portfolio.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
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
                    <span>Yes, Delete</span>
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

