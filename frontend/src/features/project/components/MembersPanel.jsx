import React, { useState } from 'react';
import { projectService } from 'features/project/services/projectService'
import { useAuth } from 'features/auth/context/AuthContext'

export default function MembersPanel({ project, onClose, onUpdate }) {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isOwner = project?.owner?.id === user?.id;
  const currentMember = project?.members?.find(m => (m.userId || m.user?.id) === user?.id);
  const isManager = isOwner || currentMember?.role === 'MANAGER' || user?.role === 'ADMIN';

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true); setError(''); setSuccess('');
    try {
      await projectService.addMember(project.id, email.trim());
      setSuccess(`Added ${email} successfully`);
      setEmail('');
      onUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add member.');
    } finally { setAdding(false); }
  };

  const handleRemove = async (memberId, username) => {
    if (!window.confirm(`Remove ${username} from this project?`)) return;
    setRemoving(memberId); setError('');
    try { await projectService.removeMember(project.id, memberId); onUpdate(); }
    catch (err) { setError(err.response?.data?.message || 'Could not remove member.'); }
    finally { setRemoving(null); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Team Members</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{success}</div>}

          {isManager && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Add member by email</h3>
              <form onSubmit={handleAdd} className="flex gap-2">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" disabled={adding || !email.trim()}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all">
                  {adding ? '...' : 'Add'}
                </button>
              </form>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {project?.members?.length || 0} members
            </h3>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {project?.owner?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{project?.owner?.username}</p>
                    <p className="text-xs text-gray-400">{project?.owner?.email}</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Owner</span>
              </div>

              {/* Other members */}
              {(project?.members || [])
                .filter(m => (m.userId || m.user?.id) !== project?.owner?.id)
                .map(member => (
                  <div key={member.userId || member.user?.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {(member.username || member.user?.username)?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.username || member.user?.username}</p>
                        <p className="text-xs text-gray-400">{member.email || member.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{member.role || 'Member'}</span>
                      {isManager && (
                        <button onClick={() => handleRemove(member.userId || member.user?.id, member.username || member.user?.username)}
                          disabled={removing === (member.userId || member.user?.id)}
                          className="px-2 py-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-40"
                          title="Remove member">
                          {removing === (member.userId || member.user?.id) ? '...' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            {isManager ? 'You have manager permissions' : 'Contact owner/manager to manage members'}
          </p>
        </div>
      </div>
    </>
  );
}

