import React, { useState } from 'react';
import { Certificate } from '../../types';
import { api } from '../../lib/api';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Loader2,
  X,
  Check
} from 'lucide-react';

interface CertificatesManagerProps {
  certificates: Certificate[];
  onUpdate: () => void;
}

export const CertificatesManager: React.FC<CertificatesManagerProps> = ({
  certificates,
  onUpdate
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    category: 'AI / AGENTS',
    imageUrl: '',
    credentialUrl: '',
    issueDate: ''
  });

  const categories = ['AI / AGENTS', 'AUTOMATION TOOLS', 'WEB DEVELOPMENT', 'CLOUD & DEVOPS', 'OTHER'];

  const handleOpenAdd = () => {
    setEditingCert(null);
    setFormData({
      title: '',
      issuer: '',
      category: 'AI / AGENTS',
      imageUrl: '',
      credentialUrl: '',
      issueDate: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cert: Certificate) => {
    setEditingCert(cert);
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      category: cert.category || 'AI / AGENTS',
      imageUrl: cert.imageUrl || '',
      credentialUrl: cert.credentialUrl || '',
      issueDate: cert.issueDate || ''
    });
    setSelectedFile(null);
    setPreviewUrl(cert.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer) {
      alert('Title and Issuer are required.');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('issuer', formData.issuer);
      dataToSend.append('category', formData.category);
      dataToSend.append('credentialUrl', formData.credentialUrl);
      dataToSend.append('issueDate', formData.issueDate);
      if (formData.imageUrl) {
        dataToSend.append('imageUrl', formData.imageUrl);
      }
      if (selectedFile) {
        dataToSend.append('image', selectedFile);
      }

      if (editingCert) {
        await api.updateCertificate(editingCert.id, dataToSend);
      } else {
        await api.createCertificate(dataToSend);
      }

      setIsModalOpen(false);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to save certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.deleteCertificate(id);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to delete certificate');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;

    const newCerts = [...certificates];
    const temp = newCerts[index];
    newCerts[index] = newCerts[targetIndex];
    newCerts[targetIndex] = temp;

    const reordered = newCerts.map((c, i) => ({ id: c.id, order: i + 1 }));
    try {
      await api.reorderCertificates(reordered);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to reorder');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            Certificates Manager
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Manage verified credentials & certificates displayed in the public modal trigger.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Certificate
        </button>
      </div>

      {/* List of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-mono">No certificates found in database</p>
          </div>
        ) : (
          certificates.map((cert, index) => (
            <div
              key={cert.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-3 relative group"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {cert.imageUrl ? (
                    <img src={cert.imageUrl} alt={cert.title} className="w-full h-full object-cover" />
                  ) : (
                    <Award className="w-6 h-6 text-emerald-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
                    {cert.category || 'GENERAL'}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 truncate">{cert.title}</h3>
                  <p className="text-xs text-slate-400 font-mono">Issuer: {cert.issuer}</p>
                  {cert.issueDate && (
                    <p className="text-[11px] text-slate-500 font-mono">Date: {cert.issueDate}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === certificates.length - 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Open credential URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenEdit(cert)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer"
                    title="Edit certificate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-rose-400 cursor-pointer"
                    title="Delete certificate"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                {editingCert ? 'Edit Certificate' : 'Add New Certificate'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Make.com Certification"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Issuer *</label>
                  <input
                    type="text"
                    required
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    placeholder="e.g. Make Academy"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Issue Date</label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    placeholder="e.g. Feb 28, 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Credential URL</label>
                  <input
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300">Certificate Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="cert-image-file"
                  />
                  <label
                    htmlFor="cert-image-file"
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 cursor-pointer border border-slate-700"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload Image</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">or image URL below</span>
                </div>

                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono outline-none focus:border-emerald-500"
                />

                {previewUrl && (
                  <div className="mt-2 w-full h-32 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden relative">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
