import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, X, Archive, ChevronDown } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { usePeople, CIRCLES, INNER_CIRCLE_CAP } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';

const circleFilters = ['All', ...CIRCLES];

const circleDesc = {
  'Inner Circle':         `Closest disciples — deep, intentional relationship (max ${INNER_CIRCLE_CAP})`,
  'Discipling':           'People being intentionally developed in their faith',
  'Active Relationships': 'Established relationships on a steady contact rhythm',
  'New Connections':      'Newly added — gets a 2-step follow-up sequence',
};

const EMPTY_FORM = { name: '', circle: 'New Connections', phone: '', email: '', birthday: '', serveTeam: '', notes: '' };

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

function AddPersonModal({ onClose, onSave, innerCircleCount }) {
  const { church } = useAuth();
  const serveTeams = church?.serve_teams || [];
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const innerCircleFull = innerCircleCount >= INNER_CIRCLE_CAP;

  function set(field, value) {
    if (field === 'circle' && value === 'Inner Circle' && innerCircleFull) {
      setError(`Inner Circle is full (max ${INNER_CIRCLE_CAP}). Move someone out first.`);
      return;
    }
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'circle') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    onSave(form, setError);
  }

  return (
    <Modal title="Add Person" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-7">
        <div>
          <label className="section-label block mb-2">Full Name</label>
          <input type="text" placeholder="e.g. James Miller" value={form.name}
            onChange={e => set('name', e.target.value)} autoFocus className="input-line" />
          {error && <p className="text-[11px] text-red-500 mt-2">{error}</p>}
        </div>

        <div>
          <label className="section-label block mb-3">Tier</label>
          <div className="grid grid-cols-2 gap-2">
            {CIRCLES.map(c => {
              const disabled = c === 'Inner Circle' && innerCircleFull && form.circle !== 'Inner Circle';
              return (
                <button key={c} type="button" onClick={() => set('circle', c)} disabled={disabled}
                  className={`py-2.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                    form.circle === c
                      ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                      : disabled
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D8F] hover:text-[#2A9D8F]'
                  }`}>
                  {c}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{circleDesc[form.circle]}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="section-label block mb-2">Phone</label>
            <input type="tel" placeholder="(972) 555-0000" value={form.phone}
              onChange={e => set('phone', e.target.value)} className="input-line" />
          </div>
          <div>
            <label className="section-label block mb-2">Email</label>
            <input type="email" placeholder="name@email.com" value={form.email}
              onChange={e => set('email', e.target.value)} className="input-line" />
          </div>
        </div>

        <div>
          <label className="section-label block mb-2">Birthday <span className="text-gray-300">(optional)</span></label>
          <input type="date" value={form.birthday}
            onChange={e => set('birthday', e.target.value)} className="input-line" />
        </div>

        {serveTeams.length > 0 && (
          <div>
            <label className="section-label block mb-2">Serve Team <span className="text-gray-300">(optional)</span></label>
            <div className="relative">
              <select value={form.serveTeam} onChange={e => set('serveTeam', e.target.value)}
                className="input-line bg-transparent appearance-none pr-6 cursor-pointer">
                <option value="">— None —</option>
                {serveTeams.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        <div>
          <label className="section-label block mb-2">Pastoral Notes</label>
          <textarea rows={3} placeholder="What do you want to remember about this person?"
            value={form.notes} onChange={e => set('notes', e.target.value)}
            className="input-line resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Add Person</button>
        </div>
      </form>
    </Modal>
  );
}

export default function People() {
  const { people, addPerson }    = usePeople();
  const { userProfile, teamMembers } = useAuth();
  const [circleFilter, setCircleFilter] = useState('All');
  const [ownerFilter, setOwnerFilter]   = useState('mine');  // 'all' | 'mine'
  const [showArchived, setShowArchived] = useState(false);
  const [query, setQuery]               = useState('');
  const [showModal, setShowModal]       = useState(false);
  const navigate = useNavigate();

  const filtered = people.filter(p => {
    const matchCircle   = circleFilter === 'All' || p.circle === circleFilter;
    const matchOwner    = ownerFilter === 'mine' ? p.pastorId === userProfile?.id : true;
    const matchQuery    = p.name.toLowerCase().includes(query.toLowerCase());
    const matchArchived = showArchived ? p.archived : !p.archived;
    return matchCircle && matchOwner && matchQuery && matchArchived;
  });

  function getPastorName(pastorId) {
    const m = teamMembers.find(t => t.id === pastorId);
    return m ? `${m.first_name} ${m.last_name}`.trim() : null;
  }

  async function handleSave(formData, setError) {
    const result = await addPerson(formData);
    if (result?.error) { setError(result.error); return; }
    setShowModal(false);
    navigate(`/people/${result.id}`);
  }

  const myCount          = people.filter(p => p.pastorId === userProfile?.id).length;
  const showToggle       = teamMembers.length > 1;
  const archivedCount    = people.filter(p => p.archived && (ownerFilter === 'mine' ? p.pastorId === userProfile?.id : true)).length;
  const innerCircleCount = people.filter(p => p.circle === 'Inner Circle' && p.pastorId === userProfile?.id).length;

  return (
    <div className="page-enter min-h-full">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">People</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Person
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 space-y-2">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" placeholder="Search people..."
              value={query} onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#2A9D8F] transition-colors" />
          </div>

          {/* My / All toggle (only shown when team has multiple members) */}
          {showToggle && (
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[['all', `All (${people.length})`], ['mine', `Mine (${myCount})`]].map(([val, label]) => (
                <button key={val} onClick={() => setOwnerFilter(val)}
                  className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-md transition-colors ${
                    ownerFilter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Circle filter */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 flex-wrap">
            {circleFilters.map(f => (
              <button key={f} onClick={() => setCircleFilter(f)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
                  circleFilter === f
                    ? 'bg-[#2A9D8F] text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                {f}
                <span className={`ml-1 ${circleFilter === f ? 'text-white/70' : 'text-gray-400'}`}>
                  ({f === 'All' ? people.filter(p => !p.archived).length : people.filter(p => p.circle === f && !p.archived).length})
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowArchived(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
              showArchived ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
            }`}>
            <Archive className="w-3 h-3" /> Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-2">
        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No people found</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-[1fr_160px_120px_80px_60px] gap-4 px-5 pb-1">
            <p className="section-label">Name</p>
            <p className="section-label hidden sm:block">Circle</p>
            <p className="section-label hidden sm:block">Last Contact</p>
            <p className="section-label hidden sm:block">Prayers</p>
            <span />
          </div>
        )}

        {filtered.map(person => {
          const pastorName = getPastorName(person.pastorId);
          return (
            <Link key={person.id} to={`/people/${person.id}`}
              className="card grid grid-cols-[1fr_160px_120px_80px_60px] gap-4 items-center px-5 py-4 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar name={person.name} avatarUrl={person.avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {pastorName && showToggle ? `Added by ${pastorName}` : person.campus}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block"><Badge label={person.circle} /></div>
              <div className="hidden sm:block">
                <p className={`text-xs ${person.lastContactDays === null || person.lastContactDays > 14 ? 'text-red-400' : 'text-gray-500'}`}>
                  {person.lastContactDays === null ? 'Never' : person.lastContactDays === 0 ? 'Today' : `${person.lastContactDays}d ago`}
                </p>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500">{person.prayerCount}</p>
              </div>
              <div>
                <span className="text-[10px] font-medium text-[#2A9D8F] opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <AddPersonModal
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          innerCircleCount={innerCircleCount}
        />
      )}
    </div>
  );
}
