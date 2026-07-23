import React from 'react';
import { ContactMessage } from '../../types';
import { Trash2, CheckCircle2, Mail, Clock, Reply, Inbox } from 'lucide-react';
import { api } from '../../lib/api';

interface MessagesManagerProps {
  messages: ContactMessage[];
  onRefresh: () => void;
}

export const MessagesManager: React.FC<MessagesManagerProps> = ({ messages, onRefresh }) => {
  const handleMarkRead = async (id: string) => {
    try {
      await api.markContactRead(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to update message status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.deleteContactMessage(id);
      onRefresh();
    } catch (err: any) {
      alert('Failed to delete message');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono text-slate-100">Contact Inquiries Inbox</h1>
        <p className="text-xs font-mono text-slate-400">
          Messages submitted directly by potential employers, clients, and visitors via the public contact form.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-mono text-slate-400">No contact messages received yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-all space-y-3 ${
                msg.read
                  ? 'bg-slate-900/30 border-slate-800 text-slate-300'
                  : 'bg-slate-900/80 border-cyan-500/50 shadow-lg shadow-cyan-500/5 text-slate-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-mono text-slate-100">{msg.name}</h3>
                    {!msg.read && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        New
                      </span>
                    )}
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-xs font-mono text-cyan-400 hover:underline">
                    {msg.email}
                  </a>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-slate-200 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                {msg.message}
              </p>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`mailto:${msg.email}?subject=Re:%20Portfolio%20Inquiry%20from%20${encodeURIComponent(
                    msg.name
                  )}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold border border-cyan-500/30 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>Reply via Email</span>
                </a>

                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <button
                      onClick={() => handleMarkRead(msg.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1"
                      title="Mark as Read"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">Mark Read</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
