import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, X } from 'lucide-react';
import Avatar from '../components/Avatar';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';

const statusFilters = ['All', 'Active', 'Ongoing', 'Answered'];

const statusColors = {
  Active:   'bg-teal-50 text-teal-700 border border-teal-200',
  Ongoing:  'bg-blue-50 text-blue-700 border border-blue-200',
  Answered: 'bg-gray-100 text-gray-500 border border-gray-200',
};

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-gray-900">{title}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Add Prayer Modal ─────────────────────────────────────────────────────────
function AddPrayerModal({ people, onSave, onClose }) {
  const [form, setForm] = useState({
    personId: people[0]?.id || '',
    request:  '',
    status:   'Active',
  });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.personId) { setError('Select a person.'); return; }
    if (!form.request.trim()) { setError('Describe the prayer request.'); return; }
    onSave(form);
  }

  return (
    <Modal title="Add Prayer Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="section-label block mb-2">Person</label>
          <select
            value={form.personId}
            onChange={e => { setForm(f => ({ ...f, personId: e.target.value })); setError(''); }}
            className="input-line bg-transparent">
            <option value="">— Select a person —</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="section-label block mb-2">Prayer Request</label>
          <textarea
            rows={4}
            autoFocus
            placeholder="Describe the request..."
            value={form.request}
            onChange={e => { setForm(f => ({ ...f, request: e.target.value })); setError(''); }}
            className="input-line resize-none"
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>

        <div>
          <label className="section-label block mb-3">Status</label>
          <div className="flex gap-2">
            {['Active', 'Ongoing'].map(s => (
              <button key={s} type="button"
                onClick={() => setForm(f => ({ ...f, status: s }))}
                className={`flex-1 py-2 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                  form.status === s
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D8F]'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Add Request</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrayerRequests() {
  const { people, addPrayerRequest, markPrayerAnswered } = usePeople();
  const { userProfile } = useAuth();
  const [filter, setFilter]     = useState('All');
  const [showModal, setShowModal] = useState(false);

  const myPeople = people.filter(p => p.pastorId === userProfile?.id);

  const prayers = myPeople.flatMap(p =>
    p.prayerRequests.map(pr => ({ ...pr, personId: p.id, personName: p.name, personAvatarUrl: p.avatarUrl }))
  );

  const filtered = filter === 'All' ? prayers : prayers.filter(p => p.status === filter);

  const counts = {
    All:      prayers.length,
    Active:   prayers.filter(p => p.status === 'Active').length,
    Ongoing:  prayers.filter(p => p.status === 'Ongoing').length,
    Answered: prayers.filter(p => p.status === 'Answered').length,
  };

  function handleSave({ personId, request, status }) {
    const today = new Date().toISOString().split('T')[0];
    const pr = {
      id:        `pr${Date.now()}`,
      request:   request.trim(),
      dateAdded: today,
      status,
      daysActive: 0,
    };
    addPrayerRequest(personId, pr);
    setShowModal(false);
  }

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Prayer Requests</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Request
        </button>
      </div>

      {/* Stat cards */}
      <div className="p-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Active',   count: counts.Active,   color: 'text-[#2A9D8F]', bg: 'bg-teal-50' },
          { label: 'Ongoing',  count: counts.Ongoing,  color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Answered', count: counts.Answered, color: 'text-gray-500',  bg: 'bg-gray-50' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <p className={`text-3xl font-light ${s.color}`}>{s.count}</p>
            <p className="section-label mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="px-6 pb-4">
        <div className="card px-6 py-4">
          <p className="text-xs text-gray-500 italic leading-relaxed">
            "The prayer of a righteous person is powerful and effective." — James 5:16
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex gap-1 py-2">
          {statusFilters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-[#2A9D8F] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              {f} ({counts[f] ?? prayers.length})
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-3">
        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No requests in this category</p>
          </div>
        )}

        {filtered.map(pr => (
          <div key={pr.id} className="card px-5 py-4 flex items-start gap-4 hover:shadow-md transition-all">
            <Avatar name={pr.personName} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 mb-1">
                <Link to={`/people/${pr.personId}`}
                  className="text-sm font-medium text-gray-900 hover:text-[#2A9D8F] transition-colors">
                  {pr.personName}
                </Link>
                <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full uppercase tracking-[0.08em] flex-shrink-0 ${statusColors[pr.status] || statusColors.Active}`}>
                  {pr.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{pr.request}</p>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[10px] text-gray-400">{pr.dateAdded}</p>
                <span className="text-gray-300">·</span>
                <p className="text-[10px] text-gray-400">{pr.daysActive}d active</p>
                {pr.status !== 'Answered' && (
                  <button onClick={() => markPrayerAnswered(pr.personId, pr.id)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 px-2.5 py-1 rounded-lg transition-colors">
                    <Check className="w-3 h-3" /> Mark Answered
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddPrayerModal
          people={myPeople}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
