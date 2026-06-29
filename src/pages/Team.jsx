import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Copy, Check, Users, Pencil, X, RefreshCw, Plus, MapPin, Trash2, Mail } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { usePeople } from '../context/PeopleContext';

// ─── Edit Church Modal ────────────────────────────────────────────────────────
function EditChurchModal({ church, onSave, onClose }) {
  const [name, setName]         = useState(church?.name || '');
  const [joinCode, setJoinCode] = useState(church?.join_code || '');
  const [campuses, setCampuses] = useState(church?.campuses || []);
  const [newCampus, setNewCampus] = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  function regenerateCode() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJoinCode(code);
    setError('');
  }

  function copyCode() {
    navigator.clipboard.writeText(joinCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function addCampus() {
    const trimmed = newCampus.trim();
    if (!trimmed) return;
    if (campuses.includes(trimmed)) { setError('That campus already exists.'); return; }
    setCampuses(prev => [...prev, trimmed]);
    setNewCampus('');
    setError('');
  }

  function removeCampus(c) {
    setCampuses(prev => prev.filter(x => x !== c));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Church name is required.'); return; }
    setSaving(true);
    const { error: err } = await onSave({
      name:     name.trim(),
      joinCode: joinCode !== church?.join_code ? joinCode : undefined,
      campuses,
    });
    if (err) { setError(err); setSaving(false); }
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-gray-900">
            Church Settings
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Church name */}
          <div>
            <label className="section-label block mb-2">Church Name</label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Shoreline City Church"
              autoFocus
              className="input-line"
            />
          </div>

          {/* Campuses */}
          <div>
            <label className="section-label flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3" /> Campuses
            </label>
            {campuses.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {campuses.map(c => (
                  <span key={c}
                    className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-medium px-3 py-1 rounded-full border border-teal-100">
                    {c}
                    <button type="button" onClick={() => removeCampus(c)}
                      className="text-teal-400 hover:text-red-500 transition-colors ml-0.5">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCampus}
                onChange={e => { setNewCampus(e.target.value); setError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCampus(); } }}
                placeholder="e.g. Frisco, Allen, Online..."
                className="input-line flex-1"
              />
              <button type="button" onClick={addCampus}
                className="btn-secondary flex items-center gap-1 flex-shrink-0">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Pastors will choose from this list when they join.
            </p>
          </div>

          {/* Join code */}
          <div>
            <label className="section-label block mb-2">Team Join Code</label>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-mono font-bold text-gray-900 tracking-[0.5em] flex-1">
                {joinCode}
              </p>
              <button type="button" onClick={copyCode}
                className="btn-secondary flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                {codeCopied
                  ? <><Check className="w-3 h-3 text-green-500" /> Copied</>
                  : <><Copy className="w-3 h-3" /> Copy</>
                }
              </button>
              <button type="button" onClick={regenerateCode}
                title="Generate a new join code"
                className="btn-secondary flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                <RefreshCw className="w-3 h-3" /> New Code
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Share this code with your team so they can join your church account.
              Generating a new code invalidates the old one.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Invite Modal ─────────────────────────────────────────────────────────────
function InviteModal({ onClose, createInvite }) {
  const [email, setEmail]     = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!email.trim()) { setError('Enter an email address.'); return; }
    setLoading(true);
    const { token, error: err } = await createInvite(email.trim());
    setLoading(false);
    if (err) { setError(err); return; }
    setInviteLink(`${window.location.origin}?invite=${token}`);
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-gray-900">
            Invite Team Member
          </p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {!inviteLink ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="section-label block mb-2">Their Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="pastor@shoreline.city"
                  autoFocus
                  className="input-line"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  A personal invite link will be generated for you to send them.
                </p>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                  {loading ? 'Generating...' : 'Generate Invite Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                <p className="text-xs text-teal-700 font-medium">Invite link created for {email}</p>
                <p className="text-[10px] text-teal-600 mt-0.5">
                  Copy and send this link to them. When they open it, they'll skip the join code and go straight to setting up their profile.
                </p>
              </div>
              <div>
                <label className="section-label block mb-2">Invite Link</label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="input-line flex-1 text-xs text-gray-500 truncate"
                  />
                  <button type="button" onClick={copyLink}
                    className="btn-primary flex items-center gap-1.5 flex-shrink-0">
                    {copied
                      ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>
                    }
                  </button>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setInviteLink(''); setEmail(''); }}
                  className="btn-secondary flex-1">Invite Another</button>
                <button type="button" onClick={onClose} className="btn-primary flex-1">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Team() {
  const { userProfile, church, teamMembers, updateChurch, createInvite } = useAuth();
  const { people } = usePeople();
  const [codeCopied, setCodeCopied]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [showInvite, setShowInvite]   = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  function copyCode() {
    navigator.clipboard.writeText(church?.join_code || '');
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  }

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between gap-4">
        <div>
          <p className="section-label mb-1">{church?.name || 'Your Church'}</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Pastoral Team</h1>
          <p className="text-xs text-gray-400 mt-1">
            {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Invite member — admin only */}
          {isAdmin && (
            <button onClick={() => setShowInvite(true)}
              className="btn-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Invite Member
            </button>
          )}
          {/* Edit church — admin only */}
          {isAdmin && (
            <button onClick={() => setShowEdit(true)}
              className="btn-secondary flex items-center gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Edit Church
            </button>
          )}

          {/* Join code — admin only */}
          {isAdmin && church?.join_code && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">Join Code</p>
                <p className="text-xl font-mono font-bold text-gray-900 tracking-[0.4em] mt-0.5">
                  {church.join_code}
                </p>
              </div>
              <button onClick={copyCode}
                className="btn-secondary flex items-center gap-1.5 flex-shrink-0">
                {codeCopied
                  ? <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                  : <><Copy className="w-3.5 h-3.5" /> Copy</>
                }
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {/* Admin tip */}
        {isAdmin && (
          <div className="mb-5 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5 flex items-center gap-3">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 leading-relaxed">
              You're the church admin. Share the join code with your pastoral team so they can create accounts and appear here.
            </p>
          </div>
        )}

        {/* Team grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map(member => {
            const isMe         = member.id === userProfile?.id;
            const contactCount = people.filter(p => p.pastorId === member.id).length;
            const fullName     = `${member.first_name} ${member.last_name}`.trim() || 'Team Member';
            const displayName  = `${member.title ? member.title + ' ' : ''}${fullName}`.trim();

            return (
              <Link key={member.id} to={`/team/${member.id}`}
                className="card p-5 hover:shadow-md transition-all group block">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar name={fullName} avatarUrl={member.avatar_url} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{displayName}</p>
                      {member.role === 'admin' && (
                        <Shield className="w-3 h-3 text-amber-500 flex-shrink-0" title="Admin" />
                      )}
                    </div>
                    {isMe && (
                      <span className="inline-block text-[9px] uppercase tracking-[0.1em] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-full font-medium mt-0.5">
                        You
                      </span>
                    )}
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.08em] mt-1">{member.role}</p>
                    {member.campus && (
                      <p className="text-[10px] text-gray-400 mt-0.5">{member.campus} Campus</p>
                    )}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{contactCount} {contactCount === 1 ? 'contact' : 'contacts'}</span>
                  </div>
                  <span className="text-[10px] text-[#2A9D8F] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {teamMembers.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No team members yet</p>
          </div>
        )}
      </div>

      {showEdit && (
        <EditChurchModal
          church={church}
          onSave={updateChurch}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showInvite && (
        <InviteModal
          createInvite={createInvite}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  );
}
