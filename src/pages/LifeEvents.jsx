import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, Heart, Briefcase, Users, Church, Star, Leaf, CloudRain, MoreHorizontal } from 'lucide-react';
import Avatar from '../components/Avatar';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Family', 'Career', 'Health', 'Ministry', 'Church', 'Faith', 'Loss', 'Other'];

const CAT_META = {
  Family:   { icon: Users,          color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-100',   badge: 'bg-rose-50 text-rose-600'   },
  Career:   { icon: Briefcase,      color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100',   badge: 'bg-blue-50 text-blue-600'   },
  Health:   { icon: Heart,          color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-100',   badge: 'bg-teal-50 text-teal-700'   },
  Ministry: { icon: Star,           color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-100',  badge: 'bg-amber-50 text-amber-700'  },
  Church:   { icon: Church,         color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', badge: 'bg-purple-50 text-purple-700' },
  Faith:    { icon: Leaf,           color: 'text-emerald-500',bg: 'bg-emerald-50',border: 'border-emerald-100',badge: 'bg-emerald-50 text-emerald-700'},
  Loss:     { icon: CloudRain,      color: 'text-gray-500',   bg: 'bg-gray-100',  border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-600'   },
  Other:    { icon: MoreHorizontal, color: 'text-stone-400',  bg: 'bg-stone-50',  border: 'border-stone-100',  badge: 'bg-stone-50 text-stone-600'  },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
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

// ─── Add Life Event Modal ─────────────────────────────────────────────────────
function AddEventModal({ people, onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    personId: people[0]?.id || '',
    event:    '',
    date:     today,
    category: 'Family',
  });
  const [error, setError] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'event' || field === 'personId') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.personId)    { setError('Select a person.'); return; }
    if (!form.event.trim()) { setError('Describe the life event.'); return; }
    if (!form.date)         { setError('Pick a date.'); return; }
    onSave(form);
  }

  return (
    <Modal title="Add Life Event" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Person */}
        <div>
          <label className="section-label block mb-2">Person</label>
          <select
            value={form.personId}
            onChange={e => set('personId', e.target.value)}
            className="input-line bg-transparent">
            <option value="">— Select a person —</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Event description */}
        <div>
          <label className="section-label block mb-2">What happened?</label>
          <textarea
            rows={3}
            autoFocus
            placeholder="e.g. Got promoted to senior manager, welcomed a new baby..."
            value={form.event}
            onChange={e => set('event', e.target.value)}
            className="input-line resize-none"
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="section-label block mb-3">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const meta = CAT_META[cat];
              const Icon = meta.icon;
              return (
                <button key={cat} type="button"
                  onClick={() => set('category', cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                    form.category === cat
                      ? `${meta.bg} ${meta.color} ${meta.border}`
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}>
                  <Icon className="w-3 h-3" /> {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="section-label block mb-2">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="input-line"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save Event</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LifeEvents() {
  const { people, addLifeEvent } = usePeople();
  const { userProfile } = useAuth();
  const myPeople = people.filter(p => p.pastorId === userProfile?.id);
  const [query, setQuery]         = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [personFilter, setPersonFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Flatten life events from my contacts only
  const allEvents = useMemo(() => {
    return myPeople
      .flatMap(p =>
        (p.lifeEvents || []).map(ev => ({
          ...ev,
          personId:   p.id,
          personName: p.name,
          personAvatarUrl: p.avatarUrl,
        }))
      )
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [people]);

  // People who have at least one event (for filter pills)
  const peopleWithEvents = useMemo(() => {
    const ids = new Set(allEvents.map(ev => ev.personId));
    return myPeople.filter(p => ids.has(p.id));
  }, [allEvents, myPeople]);

  const filtered = allEvents.filter(ev => {
    const matchCat    = catFilter === 'All'  || ev.category === catFilter;
    const matchPerson = personFilter === 'All' || ev.personId === personFilter;
    const matchQuery  = ev.event?.toLowerCase().includes(query.toLowerCase())
                     || ev.personName?.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchPerson && matchQuery;
  });

  function handleSave(form) {
    addLifeEvent(form.personId, {
      event:    form.event.trim(),
      date:     form.date,
      category: form.category,
    });
    setShowModal(false);
  }

  return (
    <div className="page-enter min-h-full">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Life Events</h1>
          <p className="text-xs text-gray-400 mt-1">
            {allEvents.length} {allEvents.length === 1 ? 'event' : 'events'} recorded across {people.length} people
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Event
        </button>
      </div>

      {/* Search + filters */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 space-y-2">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-[#2A9D8F] transition-colors"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setCatFilter('All')}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
              catFilter === 'All' ? 'bg-[#2A9D8F] text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}>
            All ({allEvents.length})
          </button>
          {CATEGORIES.filter(cat => allEvents.some(ev => ev.category === cat)).map(cat => {
            const meta = CAT_META[cat];
            const Icon = meta.icon;
            const count = allEvents.filter(ev => ev.category === cat).length;
            return (
              <button key={cat}
                onClick={() => setCatFilter(cat === catFilter ? 'All' : cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                  catFilter === cat
                    ? `${meta.bg} ${meta.color} ${meta.border}`
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}>
                <Icon className="w-3 h-3" /> {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Events list */}
      <div className="p-6 max-w-4xl mx-auto">
        {/* Person filter (shown only when there are multiple people with events) */}
        {peopleWithEvents.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-5">
            <button
              onClick={() => setPersonFilter('All')}
              className={`px-3 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                personFilter === 'All'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              Everyone
            </button>
            {peopleWithEvents.map(p => (
              <button key={p.id}
                onClick={() => setPersonFilter(personFilter === p.id ? 'All' : p.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-medium rounded-full border transition-colors ${
                  personFilter === p.id
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'text-gray-500 border-gray-200 hover:border-gray-400'
                }`}>
                <Avatar name={p.name} avatarUrl={p.avatarUrl} size="xs" />
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">
              {allEvents.length === 0 ? 'No life events recorded yet' : 'No events match your filters'}
            </p>
            {allEvents.length === 0 && (
              <button onClick={() => setShowModal(true)} className="mt-4 btn-primary mx-auto">
                Record your first event
              </button>
            )}
          </div>
        )}

        {/* Event cards */}
        <div className="space-y-3">
          {filtered.map((ev, i) => {
            const meta = CAT_META[ev.category] || CAT_META.Other;
            const Icon = meta.icon;

            // Date separator: show year heading when year changes
            const evYear = ev.date ? ev.date.slice(0, 4) : '';
            const prevYear = i > 0 && filtered[i - 1].date ? filtered[i - 1].date.slice(0, 4) : '';
            const showYear = evYear && evYear !== prevYear;

            return (
              <div key={ev.id || `${ev.personId}-${i}`}>
                {showYear && (
                  <div className="flex items-center gap-3 mb-3 mt-1">
                    <div className="flex-1 h-px bg-gray-200" />
                    <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400 font-medium">{evYear}</p>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                )}

                <div className="card px-5 py-4 flex items-start gap-4 hover:shadow-md transition-all">
                  {/* Category icon */}
                  <div className={`${meta.bg} ${meta.border} border p-2.5 rounded-xl flex-shrink-0 mt-0.5`}>
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-gray-900 leading-snug">{ev.event}</p>
                      <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full flex-shrink-0 ${meta.badge}`}>
                        {ev.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Link
                        to={`/people/${ev.personId}`}
                        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                        <Avatar name={ev.personName} avatarUrl={ev.personAvatarUrl} size="xs" />
                        <span className="text-[11px] font-medium text-[#2A9D8F]">{ev.personName}</span>
                      </Link>
                      {ev.date && (
                        <>
                          <span className="text-gray-200">·</span>
                          <p className="text-[11px] text-gray-400">{formatDate(ev.date)}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <AddEventModal
          people={myPeople}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
