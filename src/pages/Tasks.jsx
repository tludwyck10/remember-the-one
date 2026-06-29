import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, X, LayoutList, Columns } from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import { usePeople } from '../context/PeopleContext';

const categories = ['Due Today', 'This Week', 'Overdue', 'Completed'];

const catColors = {
  'Due Today':  { dot: 'bg-[#2A9D8F]', badge: 'bg-teal-50 text-teal-700' },
  'This Week':  { dot: 'bg-blue-400',   badge: 'bg-blue-50 text-blue-700' },
  'Overdue':    { dot: 'bg-red-400',    badge: 'bg-red-50 text-red-600'  },
  'Completed':  { dot: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
};

const TASK_TYPES = ['call', 'coffee', 'lunch', 'text', 'visit'];

function computeCategory(dateStr) {
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const taskDate = new Date(dateStr + 'T00:00:00');
  if (taskDate < today)                                  return 'Overdue';
  if (taskDate.toDateString() === today.toDateString())  return 'Due Today';
  return 'This Week';
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
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    personId: people[0]?.id || '',
    label:    '',
    type:     'call',
    date:     today,
    time:     '',
    notes:    '',
  });
  const [error, setError] = useState('');

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (field === 'label' || field === 'personId') setError('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.personId)    { setError('Select a person.'); return; }
    if (!form.label.trim()) { setError('Add a task description.'); return; }
    if (!form.date)         { setError('Pick a due date.'); return; }
    onSave(form);
  }

  const selectedPerson = people.find(p => p.id === form.personId);

  return (
    <Modal title="Add Follow-Up Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Person */}
        <div>
          <label className="section-label block mb-2">Assign To</label>
          <select
            value={form.personId}
            onChange={e => set('personId', e.target.value)}
            className="input-line bg-transparent">
            <option value="">— Select a person —</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {/* Label — auto-suggest based on type + person */}
        <div>
          <label className="section-label block mb-2">Description</label>
          <input
            type="text"
            autoFocus
            placeholder={selectedPerson ? `e.g. ${form.type === 'call' ? 'Call' : form.type === 'coffee' ? 'Coffee with' : form.type === 'lunch' ? 'Lunch with' : form.type === 'text' ? 'Text' : 'Visit'} ${selectedPerson.name.split(' ')[0]}` : 'What do you need to do?'}
            value={form.label}
            onChange={e => set('label', e.target.value)}
            className="input-line"
          />
          {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="section-label block mb-3">Type</label>
          <div className="flex gap-2 flex-wrap">
            {TASK_TYPES.map(t => (
              <button key={t} type="button"
                onClick={() => set('type', t)}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-lg border transition-all ${
                  form.type === t
                    ? 'bg-[#2A9D8F] text-white border-[#2A9D8F]'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#2A9D8F]'
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Date + Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label block mb-2">Due Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              className="input-line"
            />
          </div>
          <div>
            <label className="section-label block mb-2">Time <span className="text-gray-300">(optional)</span></label>
            <input
              type="time"
              value={form.time}
              onChange={e => set('time', e.target.value)}
              className="input-line"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="section-label block mb-2">Notes <span className="text-gray-300">(optional)</span></label>
          <textarea
            rows={3}
            placeholder="Any context to remember..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            className="input-line resize-none"
          />
        </div>

        {/* Preview category badge */}
        {form.date && (
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-gray-400">Will be filed as:</p>
            <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
              catColors[computeCategory(form.date)]?.badge || ''
            }`}>
              {computeCategory(form.date)}
            </span>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">Add Task</button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const { tasks, markComplete, addTask } = useTasks();
  const { people } = usePeople();
  const [view, setView]         = useState('list');
  const [showModal, setShowModal] = useState(false);

  const grouped = categories.reduce((acc, cat) => {
    acc[cat] = tasks.filter(t => t.category === cat);
    return acc;
  }, {});

  const overdue   = tasks.filter(t => t.category === 'Overdue').length;
  const completed = tasks.filter(t => t.category === 'Completed').length;

  function handleSave(form) {
    const person = people.find(p => p.id === form.personId);
    addTask({
      personId:   form.personId,
      personName: person?.name || '',
      label:      form.label.trim(),
      type:       form.type,
      date:       form.date,
      time:       form.time
        ? new Date(`2000-01-01T${form.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        : '',
      notes:      form.notes.trim(),
      category:   computeCategory(form.date),
    });
    setShowModal(false);
  }

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">Ministry</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">Follow-Up Tasks</h1>
          <p className="text-xs text-gray-400 mt-1">
            {completed}/{tasks.length} completed
            {overdue > 0 && <span className="text-red-400"> · {overdue} overdue</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {[['list', LayoutList], ['kanban', Columns]].map(([v, Icon]) => (
              <button key={v} onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-md transition-colors ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}>
                <Icon className="w-3 h-3" /> {v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="p-6 space-y-4">
          {categories.every(cat => grouped[cat].length === 0) && (
            <div className="card py-16 text-center">
              <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No tasks yet</p>
              <button onClick={() => setShowModal(true)} className="mt-4 btn-primary mx-auto">
                Add your first task
              </button>
            </div>
          )}
          {categories.map(cat => {
            const items = grouped[cat];
            if (items.length === 0) return null;
            return (
              <div key={cat} className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  <div className={`w-2 h-2 rounded-full ${catColors[cat].dot}`} />
                  <p className="section-label">{cat}</p>
                  <span className="text-[10px] text-gray-400">({items.length})</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map(task => (
                    <div key={task.id}
                      className={`flex items-center gap-5 px-5 py-4 hover:bg-gray-50 transition-colors ${task.category === 'Completed' ? 'opacity-50' : ''}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${catColors[cat].dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.category === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.label}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <Link to={`/people/${task.personId}`} className="text-[10px] text-[#2A9D8F] hover:underline">
                            {task.personName}
                          </Link>
                          <span className="text-gray-300">·</span>
                          <p className="text-[10px] text-gray-400 capitalize">{task.type}</p>
                          <span className="text-gray-300">·</span>
                          <p className="text-[10px] text-gray-400">{task.date}{task.time ? ` · ${task.time}` : ''}</p>
                        </div>
                        {task.notes && (
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-1">{task.notes}</p>
                        )}
                      </div>
                      {task.category !== 'Completed' && (
                        <button onClick={() => markComplete(task.id)}
                          className="flex items-center gap-1.5 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                          <Check className="w-3 h-3" /> Done
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat} className="card overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                <div className={`w-2 h-2 rounded-full ${catColors[cat].dot}`} />
                <p className="section-label flex-1">{cat}</p>
                <span className="text-[10px] text-gray-400">{grouped[cat].length}</span>
              </div>
              <div className="flex-1 divide-y divide-gray-50">
                {grouped[cat].length === 0 && (
                  <div className="px-5 py-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-gray-300">Empty</p>
                  </div>
                )}
                {grouped[cat].map(task => (
                  <div key={task.id}
                    className={`px-5 py-4 hover:bg-gray-50 transition-colors ${task.category === 'Completed' ? 'opacity-50' : ''}`}>
                    <p className={`text-sm font-medium leading-snug ${task.category === 'Completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {task.label}
                    </p>
                    <Link to={`/people/${task.personId}`} className="text-[10px] text-[#2A9D8F] hover:underline mt-1 block">
                      {task.personName}
                    </Link>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {task.date}{task.time ? ` · ${task.time}` : ''}
                    </p>
                    {task.category !== 'Completed' && (
                      <button onClick={() => markComplete(task.id)}
                        className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors">
                        <Check className="w-3 h-3" /> Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddTaskModal
          people={people}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
