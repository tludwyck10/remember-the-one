import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Plus, X, Check, Pencil, Trash2, ChevronLeft, Camera } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { usePeople } from '../context/PeopleContext';
import { useTasks } from '../context/TasksContext';
import { uploadPhoto } from '../lib/uploadPhoto';

const tabs = ['Overview', 'Conversations', 'Prayer Requests', 'Life Events'];

const CLL_STAGES = ['Belong', 'Become', 'Build', 'Beyond'];

const CLL_META = {
  Belong: {
    description: 'Everyone is welcome at Shoreline City. This is the entry point — the door is always open.',
    steps: ['Attend JOIN'],
  },
  Become: {
    description: 'Taking the step of ownership at Shoreline City.',
    steps: ['Get baptized', 'Join a Connect Group', 'Join a serve team'],
  },
  Build: {
    description: 'Going deeper — serving, giving, and stepping into leadership.',
    steps: ['Host a Connect Group', 'Take a step on the giving ladder', 'Join a leadership position on a serve team'],
  },
  Beyond: {
    description: 'There is no end to what God can do in your life.',
    steps: [],
  },
};

const EVENT_CATEGORIES = ['Family', 'Career', 'Health', 'Ministry', 'Church', 'Faith', 'Loss', 'Other'];


// ─── Shared Modal ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, maxWidth = 'sm:max-w-md', children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white w-full ${maxWidth} rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-xl`}>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="section-label block mb-2">{label}</label>
      {children}
    </div>
  );
}

// ─── Edit Contact modal ───────────────────────────────────────────────────────
function EditContactModal({ person, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    name:   person.name,
    circle: person.circle,
    phone:  person.phone  || '',
    email:  person.email  || '',
    campus: person.campus || '',
    notes:  person.notes  || '',
  });
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'name') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    onSave(form);
  }

  if (confirming) {
    return (
      <Modal title="Remove Person?" onClose={() => setConfirming(false)}>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Remove <strong>{person.name}</strong> from your ministry list?
          All conversations, prayers, and events will be lost.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirming(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onDelete} className="flex-1 bg-red-600 text-white text-[11px] uppercase tracking-[0.15em] font-medium py-3 rounded-lg hover:bg-red-700 transition-colors">
            Yes, Remove
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Edit Contact" maxWidth="sm:max-w-lg" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-7">
        <Field label="Full Name">
          <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
            autoFocus className="input-line" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </Field>

        <Field label="Circle">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {['Inner Circle', 'Growth Circle', 'Community Circle'].map(c => (
              <button key={c} type="button" onClick={() => set('circle', c)}
                className={`py-2.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                  form.circle === c
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D8F] hover:text-[#2A9D8F]'
                }`}>
                {c}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-6">
          <Field label="Phone">
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="(972) 555-0000" className="input-line" />
          </Field>
          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="name@email.com" className="input-line" />
          </Field>
        </div>

        <Field label="Campus">
          <input type="text" value={form.campus} onChange={e => set('campus', e.target.value)}
            placeholder="Frisco Campus" className="input-line" />
        </Field>

        <Field label="Pastoral Notes">
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Key things to remember..." className="input-line resize-none" />
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save Changes</button>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <button type="button" onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-600 uppercase tracking-[0.1em] transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Remove this person
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Log Conversation modal ───────────────────────────────────────────────────
function LogConversationModal({ onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ date: today, notes: '' });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.notes.trim()) { setError('Add some notes.'); return; }
    onSave({ id: `c${Date.now()}`, date: form.date, notes: form.notes.trim() });
  }

  return (
    <Modal title="Log Conversation" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-7">
        <Field label="Date">
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="input-line" />
        </Field>
        <Field label="Notes">
          <textarea rows={5} autoFocus
            placeholder="What did you talk about? How were they doing spiritually?"
            value={form.notes}
            onChange={e => { setForm(f => ({ ...f, notes: e.target.value })); setError(''); }}
            className="input-line resize-none" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </Field>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Prayer modal ─────────────────────────────────────────────────────────
function AddPrayerModal({ onSave, onClose }) {
  const [request, setRequest] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!request.trim()) { setError('Describe the prayer request.'); return; }
    const today = new Date().toISOString().split('T')[0];
    onSave({ id: `pr${Date.now()}`, request: request.trim(), dateAdded: today, status: 'Active', daysActive: 0 });
  }

  return (
    <Modal title="Add Prayer Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-7">
        <Field label="Request">
          <textarea rows={4} autoFocus placeholder="Describe the request..."
            value={request}
            onChange={e => { setRequest(e.target.value); setError(''); }}
            className="input-line resize-none" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </Field>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Add Request</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Add Life Event modal ─────────────────────────────────────────────────────
function AddLifeEventModal({ onSave, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({ event: '', date: today, category: 'Family' });
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.event.trim()) { setError('Describe the event.'); return; }
    onSave({ id: `le${Date.now()}`, event: form.event.trim(), date: form.date, category: form.category });
  }

  return (
    <Modal title="Add Life Event" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-7">
        <Field label="Event">
          <input type="text" autoFocus placeholder="e.g. Started a new job, Had a baby..."
            value={form.event}
            onChange={e => { setForm(f => ({ ...f, event: e.target.value })); setError(''); }}
            className="input-line" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </Field>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Date">
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="input-line" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-line bg-transparent">
              {EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save Event</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── CLL Pathway section (used inside Overview) ───────────────────────────────
function CLLSection({ person, onStageChange }) {
  const stage = person.cllStage ?? 'Belong';
  const meta = CLL_META[stage];

  return (
    <div className="py-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">CLL Pathway</p>
        <Link to="/cll" className="text-[10px] uppercase tracking-[0.1em] text-gray-400 hover:text-black transition-colors">
          View All →
        </Link>
      </div>

      {/* Stage selector */}
      <div className="grid grid-cols-4 gap-1 mb-4">
        {CLL_STAGES.map(s => (
          <button
            key={s}
            onClick={() => onStageChange(s)}
            className={`py-2 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
              stage === s
                ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                : 'bg-white text-gray-400 border-gray-200 hover:border-[#2A9D8F] hover:text-[#2A9D8F]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{meta.description}</p>

      {/* Next steps for this stage */}
      {meta.steps.length > 0 && (
        <>
          <p className="section-label mb-2">Suggested Next Steps</p>
          <ul className="space-y-2">
            {meta.steps.map(step => (
              <li key={step} className="flex items-start gap-2">
                <span className="text-gray-300 flex-shrink-0">—</span>
                <span className="text-xs text-gray-600 leading-snug">{step}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function Overview({ person, upcomingTasks, onStageChange }) {
  return (
    <div className="divide-y divide-gray-100">
      {/* Notes */}
      <div className="py-6">
        <p className="section-label mb-3">Pastoral Notes</p>
        {person.notes
          ? <p className="text-sm text-gray-700 leading-relaxed">{person.notes}</p>
          : <p className="text-xs text-gray-400 italic">No notes yet — use Edit Contact to add them.</p>
        }
      </div>

      {/* Last contact */}
      <div className="py-6">
        <p className="section-label mb-3">Last Contact</p>
        <p className="text-sm text-black">{person.lastContact}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {person.lastContactDays === 0 ? 'Today' : `${person.lastContactDays} days ago`}
        </p>
      </div>

      {/* Upcoming tasks */}
      {upcomingTasks.length > 0 && (
        <div className="py-6">
          <p className="section-label mb-4">Upcoming Tasks</p>
          <div className="space-y-3">
            {upcomingTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between">
                <p className="text-sm text-black">{t.label}</p>
                <p className="text-xs text-gray-400">{t.date}{t.time && ` · ${t.time}`}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent prayers */}
      {person.prayerRequests.filter(p => p.status !== 'Answered').length > 0 && (
        <div className="py-6">
          <p className="section-label mb-4">Active Prayers</p>
          <div className="space-y-3">
            {person.prayerRequests.filter(p => p.status !== 'Answered').slice(0, 2).map(pr => (
              <div key={pr.id} className="flex items-start gap-3">
                <div className="w-1 h-1 rounded-full bg-black mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{pr.request}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth areas */}
      {person.growthAreas.length > 0 && (
        <div className="py-6">
          <p className="section-label mb-4">Growth Areas</p>
          <div className="flex flex-wrap gap-2">
            {person.growthAreas.map(area => (
              <span key={area} className="text-xs text-gray-600 border border-gray-200 bg-white px-3 py-1 rounded-full">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CLL Pathway */}
      <CLLSection person={person} onStageChange={onStageChange} />
    </div>
  );
}

// ─── Conversations ────────────────────────────────────────────────────────────
function Conversations({ person, onAdd }) {
  return (
    <div>
      <div className="flex justify-end py-4 border-b border-gray-100">
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Log Conversation
        </button>
      </div>

      {person.conversations.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No conversations logged yet</p>
        </div>
      )}

      <div className="divide-y divide-[#E8E8E8]">
        {person.conversations.map(c => (
          <div key={c.id} className="py-6">
            <p className="text-[10px] uppercase tracking-[0.14em] text-gray-400 mb-3">{c.date}</p>
            <p className="text-sm text-gray-700 leading-relaxed">{c.notes}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Prayer Requests ──────────────────────────────────────────────────────────
function PrayerRequests({ person, onAdd, onMarkAnswered }) {
  return (
    <div>
      <div className="flex justify-end py-4 border-b border-gray-100">
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Prayer Request
        </button>
      </div>

      {person.prayerRequests.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No prayer requests yet</p>
        </div>
      )}

      <div className="divide-y divide-[#E8E8E8]">
        {person.prayerRequests.map(pr => (
          <div key={pr.id} className="py-6 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-black leading-relaxed">{pr.request}</p>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[10px] text-gray-400">{pr.dateAdded}</p>
                <span className="text-gray-300">·</span>
                <p className="text-[10px] text-gray-400">{pr.daysActive} days</p>
                {pr.status === 'Answered' && (
                  <>
                    <span className="text-gray-300">·</span>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400">Answered</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {pr.status !== 'Answered' ? (
                <button onClick={() => onMarkAnswered(pr.id)}
                  className="text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors">
                  Mark Answered
                </button>
              ) : (
                <span className="text-[10px] uppercase tracking-[0.1em] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Answered</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Life Events ──────────────────────────────────────────────────────────────
function LifeEvents({ person, onAdd }) {
  return (
    <div>
      <div className="flex justify-end py-4 border-b border-gray-100">
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Life Event
        </button>
      </div>

      {person.lifeEvents.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No life events recorded yet</p>
        </div>
      )}

      <div className="divide-y divide-[#E8E8E8]">
        {person.lifeEvents.map(ev => (
          <div key={ev.id} className="py-5 flex items-center gap-6">
            <div className="w-16 flex-shrink-0">
              <p className="text-[10px] text-gray-400">{ev.date}</p>
            </div>
            <div className="w-px h-8 bg-[#E8E8E8] flex-shrink-0" />
            <div>
              <p className="text-sm text-black">{ev.event}</p>
              <p className="text-[10px] uppercase tracking-[0.1em] text-gray-400 mt-0.5">{ev.category}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    people,
    updatePerson,
    deletePerson,
    updateCllStage,
    addConversation:    ctxAddConversation,
    addPrayerRequest:   ctxAddPrayerRequest,
    markPrayerAnswered: ctxMarkPrayerAnswered,
    addLifeEvent:       ctxAddLifeEvent,
  } = usePeople();
  const { tasks } = useTasks();
  const person = people.find(p => p.id === id);

  const [activeTab, setActiveTab]         = useState('Overview');
  const [modal, setModal]                 = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const { url, error } = await uploadPhoto(file, `contacts/${id}`);
    if (!error) updatePerson(id, { avatarUrl: url });
    setPhotoUploading(false);
    e.target.value = '';
  }

  if (!person) {
    return (
      <div className="page-enter flex flex-col items-center justify-center flex-1 p-12">
        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400 mb-4">Person not found</p>
        <Link to="/people" className="btn-ghost">Back to People</Link>
      </div>
    );
  }

  const upcomingTasks = tasks.filter(t => t.personId === id && t.category !== 'Completed');

  const handlers = {
    editSave:       (data)  => { updatePerson(id, data); setModal(null); },
    delete:         ()      => { deletePerson(id); navigate('/people'); },
    addConversation:(conv)  => { ctxAddConversation(id, conv); setModal(null); },
    addPrayer:      (pr)    => { ctxAddPrayerRequest(id, pr); setModal(null); },
    markAnswered:   (pid)   => { ctxMarkPrayerAnswered(id, pid); },
    addLifeEvent:   (ev)    => { ctxAddLifeEvent(id, ev); setModal(null); },
    setStage:       (stage) => { updateCllStage(id, stage); },
  };

  return (
    <div className="page-enter min-h-full">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <Link to="/people" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> People
        </Link>
        <button onClick={() => setModal('editContact')}
          className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-gray-400 hover:text-black transition-colors">
          <Pencil className="w-3 h-3" /> Edit Contact
        </button>
      </div>

      {/* Profile header */}
      <div className="bg-white px-8 py-10 border-b border-gray-100">
        <div className="flex items-start gap-6">
          <label className="relative group cursor-pointer flex-shrink-0">
            <Avatar name={person.name} avatarUrl={person.avatarUrl} size="xl" />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {photoUploading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera className="w-4 h-4 text-white" />
              }
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div className="flex-1">
            <h1 className="text-2xl font-light text-black tracking-tight">{person.name}</h1>
            <Badge label={person.circle} />
            <div className="flex flex-wrap gap-6 mt-4">
              {person.phone ? (
                <a href={`tel:${person.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors">
                  <Phone className="w-3.5 h-3.5" /> {person.phone}
                </a>
              ) : null}
              {person.email ? (
                <a href={`mailto:${person.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-black transition-colors">
                  <Mail className="w-3.5 h-3.5" /> {person.email}
                </a>
              ) : null}
              {person.campus ? (
                <span className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {person.campus}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg flex-shrink-0 transition-colors ${
                activeTab === tab
                  ? 'bg-[#2A9D8F] text-white'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-8 pb-16 pt-2">
        {activeTab === 'Overview'        && <Overview person={person} upcomingTasks={upcomingTasks} onStageChange={handlers.setStage} />}
        {activeTab === 'Conversations'   && <Conversations person={person} onAdd={() => setModal('logConversation')} />}
        {activeTab === 'Prayer Requests' && <PrayerRequests person={person} onAdd={() => setModal('addPrayer')} onMarkAnswered={handlers.markAnswered} />}
        {activeTab === 'Life Events'     && <LifeEvents person={person} onAdd={() => setModal('addLifeEvent')} />}

      </div>

      {/* Modals */}
      {modal === 'editContact'     && <EditContactModal person={person} onSave={handlers.editSave} onDelete={handlers.delete} onClose={() => setModal(null)} />}
      {modal === 'logConversation' && <LogConversationModal onSave={handlers.addConversation} onClose={() => setModal(null)} />}
      {modal === 'addPrayer'       && <AddPrayerModal onSave={handlers.addPrayer} onClose={() => setModal(null)} />}
      {modal === 'addLifeEvent'    && <AddLifeEventModal onSave={handlers.addLifeEvent} onClose={() => setModal(null)} />}
    </div>
  );
}
