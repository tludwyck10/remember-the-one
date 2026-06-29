import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, MessageSquare } from 'lucide-react';
import Avatar from '../components/Avatar';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-gray-900">{title}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ─── Log Conversation Modal ───────────────────────────────────────────────────
function LogConversationModal({ people, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    personId: people[0]?.id || '',
    date:     today,
    notes:    '',
  });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.personId) { setError('Select a person.'); return; }
    if (!form.notes.trim()) { setError('Add some notes.'); return; }
    onSave(form);
  }

  return (
    <Modal title="Log Conversation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="section-label block mb-2">Person</label>
          <select
            value={form.personId}
            onChange={e => { setForm(f => ({ ...f, personId: e.target.value })); setError(''); }}
            className="input-line bg-transparent">
            <option value="">— Select a person —</option>
            {people.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="section-label block mb-2">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="input-line"
          />
        </div>

        <div>
          <label className="section-label block mb-2">Notes</label>
          <textarea
            rows={5}
            autoFocus
            placeholder="What did you talk about? How were they doing spiritually?"
            value={form.notes}
            onChange={e => { setForm(f => ({ ...f, notes: e.target.value })); setError(''); }}
            className="input-line resize-none"
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save Conversation</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Conversations() {
  const { people, addConversation } = usePeople();
  const { userProfile } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery]         = useState('');
  const [personFilter, setPersonFilter] = useState('all');

  const myPeople = people.filter(p => p.pastorId === userProfile?.id);

  // Flatten conversations from my contacts only, sort newest first
  const allConversations = useMemo(() =>
    myPeople
      .flatMap(p => p.conversations.map(c => ({
        ...c,
        personId:   p.id,
        personName: p.name,
        personAvatarUrl: p.avatarUrl,
        circle:     p.circle,
      })))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [myPeople]
  );

  const filtered = allConversations.filter(c => {
    const matchPerson = personFilter === 'all' || c.personId === personFilter;
    const matchQuery  = query === '' ||
      c.personName.toLowerCase().includes(query.toLowerCase()) ||
      c.notes.toLowerCase().includes(query.toLowerCase());
    return matchPerson && matchQuery;
  });

  function handleSave({ personId, date, notes }) {
    const conv = { id: `c${Date.now()}`, date, notes: notes.trim() };
    addConversation(personId, conv);
    setShowModal(false);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Conversations</h1>
          <p className="text-xs text-gray-400 mt-1">{allConversations.length} logged across {myPeople.length} contacts</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Log Conversation
        </button>
      </div>

      {/* Search + filter */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#2A9D8F] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setPersonFilter('all')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
              personFilter === 'all' ? 'bg-[#2A9D8F] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            All
          </button>
          {myPeople.map(p => (
            <button key={p.id}
              onClick={() => setPersonFilter(personFilter === p.id ? 'all' : p.id)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
                personFilter === p.id ? 'bg-[#2A9D8F] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {p.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-3 max-w-3xl mx-auto">
        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No conversations found</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 btn-primary mx-auto">
              Log your first one
            </button>
          </div>
        )}

        {filtered.map(c => (
          <div key={`${c.personId}-${c.id}`} className="card px-5 py-5 hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <Avatar name={c.personName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Link to={`/people/${c.personId}`}
                    className="text-sm font-semibold text-gray-900 hover:text-[#2A9D8F] transition-colors">
                    {c.personName}
                  </Link>
                  <p className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(c.date)}</p>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <LogConversationModal
          people={myPeople}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
