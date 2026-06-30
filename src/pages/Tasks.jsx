import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, Trash2, ChevronDown } from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { usePeople } from '../context/PeopleContext';
import { useAuth } from '../context/AuthContext';
import { completeTaskWithLog } from '../lib/taskCompletion';

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

const CONTACT_METHODS = ['Text', 'Call', 'In Person', 'Other'];

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

// ─── Complete Task Modal ──────────────────────────────────────────────────────
function CompleteTaskModal({ task, onConfirm, onClose }) {
  const [method, setMethod] = useState('');
  const [notes, setNotes]   = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onConfirm({ method, notes });
  }

  return (
    <Modal title="Mark Complete" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm text-gray-800 font-medium">{task.label}</p>
          <p className="text-xs text-gray-400 mt-1">Log how you connected — totally optional.</p>
        </div>
        <div>
          <label className="section-label block mb-3">Method</label>
          <div className="grid grid-cols-4 gap-2">
            {CONTACT_METHODS.map(m => (
              <button key={m} type="button" onClick={() => setMethod(m === method ? '' : m)}
                className={`py-2 text-[10px] uppercase tracking-[0.08em] font-medium rounded-lg border transition-all ${
                  method === m
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D8F]'
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="section-label block mb-2">Notes <span className="text-gray-300">(optional)</span></label>
          <textarea rows={3} autoFocus value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="What did you talk about?" className="input-line resize-none" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
            {saving ? 'Saving...' : 'Mark Complete'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit Task Modal (manual / linked tasks only) ────────────────────────────
function EditTaskModal({ task, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    label:   task.label,
    dueDate: task.dueAt ? new Date(task.dueAt).toISOString().split('T')[0] : '',
    notes:   task.notes || '',
  });
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'label') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.label.trim()) { setError('Add a task title.'); return; }
    onSave(form);
  }

  if (confirming) {
    return (
      <Modal title="Delete Task?" onClose={() => setConfirming(false)}>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Delete "<strong>{task.label}</strong>"? This can't be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirming(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onDelete} className="flex-1 bg-red-600 text-white text-[11px] uppercase tracking-[0.15em] font-medium py-3 rounded-lg hover:bg-red-700 transition-colors">
            Yes, Delete
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Edit Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="section-label block mb-2">Title</label>
          <input type="text" autoFocus value={form.label} onChange={e => set('label', e.target.value)} className="input-line" />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>
        <div>
          <label className="section-label block mb-2">Due Date <span className="text-gray-300">(optional)</span></label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} className="input-line" />
        </div>
        <div>
          <label className="section-label block mb-2">Notes <span className="text-gray-300">(optional)</span></label>
          <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="input-line resize-none" />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Save Changes</button>
        </div>
        <div className="border-t border-gray-100 pt-5">
          <button type="button" onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-600 uppercase tracking-[0.1em] transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete this task
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Task row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, onCheckboxClick, onRowClick, onSnooze, onDelete, onPromote, onArchive }) {
  const isPromote = task.reminderKind === 'promote_or_archive';
  const isEditable = task.sourceType !== 'reminder';
  // Open reminders are system-managed (no direct delete), but a completed one
  // is just history — should be cleanable like anything else.
  const showQuickDelete = task.completed && task.sourceType === 'reminder';
  const due = formatDue(task.dueAt);
  const overdue = bucketFor(task) === 'Overdue';

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
      {!isPromote && (
        <button onClick={() => onCheckboxClick(task)}
          className={`w-4 h-4 rounded border flex-shrink-0 transition-colors ${
            task.completed ? 'bg-[#2A9D8F] border-[#2A9D8F]' : 'border-gray-300 hover:border-[#2A9D8F]'
          }`} />
      )}
      <div
        className={`flex-1 min-w-0 ${isEditable ? 'cursor-pointer' : ''}`}
        onClick={isEditable ? () => onRowClick(task) : undefined}
      >
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.label}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <Link to={`/people/${task.personId}`} onClick={e => e.stopPropagation()}
            className="text-[10px] text-[#2A9D8F] hover:underline">
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
      {!isPromote && !task.completed && task.sourceType === 'reminder' && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {[1, 3, 7].map(d => (
            <button key={d} onClick={() => onSnooze(task.id, d)}
              className="text-[10px] text-gray-400 hover:text-[#2A9D8F] px-1.5 py-1 transition-colors">
              +{d}d
            </button>
          ))}
        </div>
      )}
      {showQuickDelete && (
        <button onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition-colors p-1 flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, toggleComplete, addTask, updateTask, deleteTask, snoozeTask } = useTasks();
  const { people, updatePerson, markContacted, addConversation } = usePeople();
  const { userProfile } = useAuth();
  const [showModal, setShowModal]     = useState(false);
  const [completingTask, setCompletingTask] = useState(null);
  const [editingTask, setEditingTask]       = useState(null);
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

  function handleCheckboxClick(task) {
    if (task.completed) {
      toggleComplete(task.id); // un-complete, no modal needed
    } else {
      setCompletingTask(task);
    }
  }

  async function handleConfirmComplete(form) {
    await completeTaskWithLog(completingTask, form, { toggleComplete, markContacted, addConversation, addTask });
    setCompletingTask(null);
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

  function handleEditSave(form) {
    updateTask(editingTask.id, { label: form.label.trim(), notes: form.notes.trim(), dueAt: form.dueDate || null });
    setEditingTask(null);
  }

  function handleEditDelete() {
    deleteTask(editingTask.id);
    setEditingTask(null);
  }

  const rowProps = {
    onCheckboxClick: handleCheckboxClick,
    onRowClick:      setEditingTask,
    onSnooze:        snoozeTask,
    onDelete:        deleteTask,
    onPromote:       handlePromote,
    onArchive:       handleArchive,
  };

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
                {items.map(task => <TaskRow key={task.id} task={task} {...rowProps} />)}
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
              {completedTasks.map(task => <TaskRow key={task.id} task={task} {...rowProps} />)}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <AddTaskModal people={myPeople} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
      {completingTask && (
        <CompleteTaskModal task={completingTask} onConfirm={handleConfirmComplete} onClose={() => setCompletingTask(null)} />
      )}
      {editingTask && (
        <EditTaskModal task={editingTask} onSave={handleEditSave} onDelete={handleEditDelete} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
}
