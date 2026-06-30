import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Trash2, ChevronDown } from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';
import { resolveTaskToggle } from '../lib/reminders';

const BUCKET_ORDER = ['Overdue', 'Due Today', 'This Week', 'Later', 'No Due Date'];

const BUCKET_META = {
  'Overdue':     { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600'   },
  'Due Today':   { dot: 'bg-[#2A9D8F]',  badge: 'bg-teal-50 text-teal-700' },
  'This Week':   { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700' },
  'Later':       { dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
  'No Due Date': { dot: 'bg-gray-200',   badge: 'bg-gray-100 text-gray-400' },
};

const SOURCE_FILTERS = [
  ['all',            'All'],
  ['reminder',       'Reminders'],
  ['manual',         'Manual'],
  ['prayer_request', 'Prayer'],
  ['life_event',     'Life Event'],
];

function bucketFor(task) {
  if (!task.dueAt) return 'No Due Date';
  const due = new Date(task.dueAt); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due Today';
  if (diffDays <= 7) return 'This Week';
  return 'Later';
}

function formatDue(dueAt) {
  if (!dueAt) return '';
  const due = new Date(dueAt); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays === 0)  return 'Today';
  if (diffDays === 1)  return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0)    return `${Math.abs(diffDays)}d overdue`;
  return new Date(dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

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

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ people, onSave, onClose }) {
  const [form, setForm] = useState({
    personId: people[0]?.id || '',
    label:    '',
    dueDate:  new Date().toISOString().split('T')[0],
    notes:    '',
  });
  const [error, setError] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'label' || field === 'personId') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.personId)     { setError('Select a person.'); return; }
    if (!form.label.trim()) { setError('Add a task description.'); return; }
    onSave(form);
  }

  return (
    <Modal title="Add Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="section-label block mb-2">Contact</label>
          <select value={form.personId} onChange={e => set('personId', e.target.value)}
            className="input-line bg-transparent">
            <option value="">— Select a person —</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="section-label block mb-2">Description</label>
          <input type="text" autoFocus placeholder="What do you need to do?"
            value={form.label} onChange={e => set('label', e.target.value)} className="input-line" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>
        <div>
          <label className="section-label block mb-2">Due Date <span className="text-gray-300">(optional)</span></label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="input-line" />
        </div>
        <div>
          <label className="section-label block mb-2">Notes <span className="text-gray-300">(optional)</span></label>
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Any context to remember..." className="input-line resize-none" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Add Task</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Task row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onSnooze, onDelete, onPromote, onArchive }) {
  const isPromote = task.reminderKind === 'promote_or_archive';
  const due = formatDue(task.dueAt);
  const overdue = bucketFor(task) === 'Overdue';

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
      {!isPromote && (
        <button onClick={() => onToggle(task.id)}
          className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
            task.completed ? 'bg-[#2A9D8F] border-[#2A9D8F]' : 'border-gray-300 hover:border-[#2A9D8F]'
          }`} />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Link to={`/people/${task.personId}`} className="text-[10px] text-[#2A9D8F] hover:underline">
            {task.personName}
          </Link>
          {due && (
            <>
              <span className="text-gray-300">·</span>
              <span className={`text-[10px] ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>{due}</span>
            </>
          )}
          {task.sourceType !== 'manual' && (
            <>
              <span className="text-gray-300">·</span>
              <span className="text-[10px] uppercase tracking-[0.08em] text-gray-400">
                {task.sourceType === 'reminder' ? 'Reminder' : task.sourceType === 'prayer_request' ? 'Prayer' : 'Life Event'}
              </span>
            </>
          )}
        </div>
        {isPromote && (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onPromote(task)}
              className="text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors">
              Promote to Active Relationships
            </button>
            <button onClick={() => onArchive(task)}
              className="text-[10px] font-medium text-gray-500 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
              Archive
            </button>
          </div>
        )}
      </div>
      {!isPromote && !task.completed && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {task.sourceType === 'reminder' ? (
            [1, 3, 7].map(d => (
              <button key={d} onClick={() => onSnooze(task.id, d)}
                className="text-[10px] text-gray-400 hover:text-[#2A9D8F] px-1.5 py-1 transition-colors">
                +{d}d
              </button>
            ))
          ) : (
            <button onClick={() => onDelete(task.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, toggleComplete, addTask, snoozeTask, deleteTask } = useTasks();
  const { people, updatePerson, markContacted } = usePeople();
  const { userProfile } = useAuth();
  const [showModal, setShowModal]     = useState(false);
  const [sourceFilter, setSourceFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const myPeople = people.filter(p => p.pastorId === userProfile?.id);
  const myTasks  = tasks.filter(t => t.pastorId === userProfile?.id);

  const filtered = myTasks.filter(t => {
    const matchSource = sourceFilter === 'all' || t.sourceType === sourceFilter;
    const matchPerson = personFilter === 'all' || t.personId === personFilter;
    const matchDone   = showCompleted || !t.completed;
    return matchSource && matchPerson && matchDone;
  });

  const grouped = useMemo(() => {
    const acc = {};
    for (const bucket of BUCKET_ORDER) acc[bucket] = [];
    for (const t of filtered) {
      if (t.completed) continue;
      acc[bucketFor(t)].push(t);
    }
    for (const bucket of BUCKET_ORDER) acc[bucket].sort((a, b) => new Date(a.dueAt || 0) - new Date(b.dueAt || 0));
    return acc;
  }, [filtered]);

  const completedTasks = filtered.filter(t => t.completed);
  const overdueCount   = grouped['Overdue'].length;

  async function handleToggle(taskId) {
    const task = myTasks.find(t => t.id === taskId);
    if (!task) return;
    await resolveTaskToggle(task, { toggleComplete, markContacted });
  }

  async function handlePromote(task) {
    await updatePerson(task.personId, { circle: 'Active Relationships' });
    await toggleComplete(task.id);
  }
  async function handleArchive(task) {
    await updatePerson(task.personId, { archived: true });
    await toggleComplete(task.id);
  }

  function handleSave(form) {
    const person = myPeople.find(p => p.id === form.personId);
    addTask({
      personId:   form.personId,
      personName: person?.name || '',
      label:      form.label.trim(),
      dueAt:      form.dueDate || null,
      notes:      form.notes.trim(),
      sourceType: 'manual',
    });
    setShowModal(false);
  }

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-gray-400 mt-1">
            {filtered.filter(t => !t.completed).length} open
            {overdueCount > 0 && <span className="text-red-400"> · {overdueCount} overdue</span>}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 space-y-2">
        <div className="flex gap-1 flex-wrap">
          {SOURCE_FILTERS.map(([val, label]) => (
            <button key={val} onClick={() => setSourceFilter(val)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
                sourceFilter === val ? 'bg-[#2A9D8F] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <select value={personFilter} onChange={e => setPersonFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-xs pl-3 pr-7 py-1.5 text-gray-600 focus:outline-none focus:border-[#2A9D8F] cursor-pointer">
              <option value="all">All Contacts</option>
              {myPeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
          </div>
          <button onClick={() => setShowCompleted(v => !v)}
            className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg transition-colors ${
              showCompleted ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-100'
            }`}>
            Show Completed
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        {BUCKET_ORDER.every(b => grouped[b].length === 0) && completedTasks.length === 0 && (
          <div className="card py-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">Nothing here — you're all caught up</p>
          </div>
        )}

        {BUCKET_ORDER.map(bucket => {
          const items = grouped[bucket];
          if (items.length === 0) return null;
          return (
            <div key={bucket} className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                <div className={`w-2 h-2 rounded-full ${BUCKET_META[bucket].dot}`} />
                <p className="section-label">{bucket}</p>
                <span className="text-[10px] text-gray-400">({items.length})</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onSnooze={snoozeTask}
                    onDelete={deleteTask}
                    onPromote={handlePromote}
                    onArchive={handleArchive}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {showCompleted && completedTasks.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <p className="section-label">Completed</p>
              <span className="text-[10px] text-gray-400">({completedTasks.length})</span>
            </div>
            <div className="divide-y divide-gray-50">
              {completedTasks.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={toggleComplete}
                  onSnooze={snoozeTask}
                  onDelete={deleteTask}
                  onPromote={handlePromote}
                  onArchive={handleArchive}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddTaskModal people={myPeople} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
