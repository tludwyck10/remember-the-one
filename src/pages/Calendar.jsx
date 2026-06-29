import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Clock, Coffee, Phone, MessageSquare, UtensilsCrossed, Home, Calendar as CalIcon } from 'lucide-react';
import { useTasks } from '../context/TasksContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function isSameDay(a, b) {
  return toDateStr(a) === toDateStr(b);
}

const DAYS_SHORT  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS      = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TYPE_ICONS = {
  coffee: Coffee,
  call:   Phone,
  text:   MessageSquare,
  lunch:  UtensilsCrossed,
  visit:  Home,
};

const CAT_COLORS = {
  'Due Today': 'bg-teal-100 text-teal-700 border-teal-200',
  'This Week': 'bg-blue-100 text-blue-700 border-blue-200',
  'Overdue':   'bg-red-100 text-red-600 border-red-200',
  'Completed': 'bg-gray-100 text-gray-400 border-gray-200',
};

const CAT_DOT = {
  'Due Today': 'bg-[#2A9D8F]',
  'This Week': 'bg-blue-400',
  'Overdue':   'bg-red-400',
  'Completed': 'bg-gray-300',
};

// ─── Task pill (used in month/week cells) ────────────────────────────────────
function TaskPill({ task, onClick }) {
  const Icon = TYPE_ICONS[task.type] || CalIcon;
  const cls  = CAT_COLORS[task.category] || CAT_COLORS['This Week'];
  return (
    <button onClick={() => onClick?.(task)}
      className={`w-full text-left flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium truncate transition-opacity hover:opacity-80 ${cls} ${task.category === 'Completed' ? 'line-through' : ''}`}>
      <Icon className="w-2.5 h-2.5 flex-shrink-0" />
      <span className="truncate">{task.label}</span>
    </button>
  );
}

// ─── Task detail card (used in day view) ────────────────────────────────────
function TaskCard({ task, onComplete }) {
  const Icon = TYPE_ICONS[task.type] || CalIcon;
  const cls  = CAT_COLORS[task.category] || CAT_COLORS['This Week'];
  const done = task.category === 'Completed';

  return (
    <div className={`card px-5 py-4 flex items-start gap-4 ${done ? 'opacity-60' : ''}`}>
      <div className={`p-2 rounded-xl border ${cls} flex-shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 ${done ? 'line-through' : ''}`}>{task.label}</p>
        <Link to={`/people/${task.personId}`} className="text-[11px] text-[#2A9D8F] hover:underline">
          {task.personName}
        </Link>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {task.time && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock className="w-2.5 h-2.5" /> {task.time}
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${cls}`}>
            {task.category}
          </span>
        </div>
        {task.notes && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">{task.notes}</p>
        )}
      </div>
      {!done && (
        <button onClick={() => onComplete(task.id)}
          className="flex items-center gap-1 text-[10px] font-medium text-[#2A9D8F] hover:bg-teal-50 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0">
          <Check className="w-3 h-3" /> Done
        </button>
      )}
    </div>
  );
}

// ─── Month view ───────────────────────────────────────────────────────────────
function MonthView({ anchor, tasks, today, onDayClick }) {
  const year  = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Grid starts on Sunday of the week containing the 1st
  const gridStart = startOfWeek(firstDay);
  const totalCells = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7) * 7;

  return (
    <div className="flex-1 overflow-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {DAYS_SHORT.map(d => (
          <div key={d} className="py-2 text-center section-label">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 flex-1" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
        {Array.from({ length: totalCells }).map((_, i) => {
          const cellDate  = addDays(gridStart, i);
          const isThisMonth = cellDate.getMonth() === month;
          const isToday   = isSameDay(cellDate, today);
          const dateStr   = toDateStr(cellDate);
          const dayTasks  = tasks.filter(t => t.date === dateStr);

          return (
            <div key={i}
              onClick={() => onDayClick(cellDate)}
              className={`border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-teal-50/30 transition-colors group min-h-[100px] ${
                !isThisMonth ? 'bg-gray-50/50' : 'bg-white'
              }`}>
              {/* Date number */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                  isToday
                    ? 'bg-[#2A9D8F] text-white'
                    : isThisMonth
                      ? 'text-gray-800 group-hover:bg-teal-100 group-hover:text-teal-800'
                      : 'text-gray-300'
                }`}>
                  {cellDate.getDate()}
                </span>
              </div>

              {/* Task pills */}
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(t => (
                  <TaskPill key={t.id} task={t} onClick={() => onDayClick(cellDate)} />
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-gray-400 pl-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week view ────────────────────────────────────────────────────────────────
function WeekView({ anchor, tasks, today, onDayClick }) {
  const weekStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex-1 overflow-auto">
      {/* Column headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white sticky top-0 z-10">
        {days.map((d, i) => {
          const isToday = isSameDay(d, today);
          return (
            <div key={i}
              onClick={() => onDayClick(d)}
              className="py-3 text-center cursor-pointer hover:bg-teal-50/40 transition-colors">
              <p className="section-label">{DAYS_SHORT[d.getDay()]}</p>
              <span className={`mt-1 mx-auto w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                isToday ? 'bg-[#2A9D8F] text-white' : 'text-gray-700'
              }`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Task columns */}
      <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[500px]">
        {days.map((d, i) => {
          const dateStr  = toDateStr(d);
          const dayTasks = tasks.filter(t => t.date === dateStr);
          const isToday  = isSameDay(d, today);

          return (
            <div key={i}
              className={`p-2 space-y-1.5 cursor-pointer hover:bg-teal-50/20 transition-colors ${isToday ? 'bg-teal-50/10' : ''}`}
              onClick={() => onDayClick(d)}>
              {dayTasks.length === 0 && (
                <p className="text-[9px] text-gray-300 text-center mt-4 uppercase tracking-[0.1em]">—</p>
              )}
              {dayTasks.map(t => (
                <TaskPill key={t.id} task={t} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day view ─────────────────────────────────────────────────────────────────
function DayView({ anchor, tasks, today, onComplete }) {
  const dateStr  = toDateStr(anchor);
  const dayTasks = tasks.filter(t => t.date === dateStr).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const isToday  = isSameDay(anchor, today);

  const dayLabel = anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${isToday ? 'text-[#2A9D8F]' : 'text-gray-400'}`}>
            {isToday ? 'Today' : dayLabel}
          </p>
          {isToday && <p className="text-xs text-gray-400 mt-0.5">{dayLabel}</p>}
        </div>
        <p className="text-[11px] text-gray-400">{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</p>
      </div>

      {dayTasks.length === 0 ? (
        <div className="card py-16 text-center">
          <CalIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-[11px] uppercase tracking-[0.14em] text-gray-400">No tasks this day</p>
          <p className="text-xs text-gray-300 mt-1">Free and clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayTasks.map(t => (
            <TaskCard key={t.id} task={t} onComplete={onComplete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const VIEWS = ['Day', 'Week', 'Month'];

export default function CalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { tasks, markComplete } = useTasks();
  const [view, setView]    = useState('Month');
  const [anchor, setAnchor] = useState(new Date(today));

  // Navigation title
  let navTitle = '';
  if (view === 'Month') {
    navTitle = `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
  } else if (view === 'Week') {
    const ws = startOfWeek(anchor);
    const we = addDays(ws, 6);
    navTitle = ws.getMonth() === we.getMonth()
      ? `${MONTHS[ws.getMonth()]} ${ws.getDate()}–${we.getDate()}, ${ws.getFullYear()}`
      : `${MONTHS[ws.getMonth()]} ${ws.getDate()} – ${MONTHS[we.getMonth()]} ${we.getDate()}, ${we.getFullYear()}`;
  } else {
    navTitle = anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function navigate(dir) {
    if (view === 'Month') setAnchor(a => addMonths(a, dir));
    if (view === 'Week')  setAnchor(a => addDays(a, dir * 7));
    if (view === 'Day')   setAnchor(a => addDays(a, dir));
  }

  function goToday() { setAnchor(new Date(today)); }

  function handleDayClick(date) {
    setAnchor(date);
    setView('Day');
  }

  return (
    <div className="page-enter flex flex-col min-h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3 flex-wrap flex-shrink-0">
        {/* Left: title + nav */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={goToday}
            className="btn-secondary px-3 py-1.5 text-[10px]">
            Today
          </button>
          <button onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(1)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-semibold text-gray-800 ml-1 truncate">{navTitle}</h2>
        </div>

        {/* Right: view toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {VIEWS.map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] font-medium rounded-md transition-colors ${
                view === v
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row (task counts) */}
      <div className="bg-white border-b border-gray-100 px-6 py-2 flex items-center gap-6 text-[10px] flex-shrink-0">
        {[
          { label: 'Due Today', dot: 'bg-[#2A9D8F]' },
          { label: 'This Week', dot: 'bg-blue-400' },
          { label: 'Overdue',   dot: 'bg-red-400' },
          { label: 'Completed', dot: 'bg-gray-300' },
        ].map(({ label, dot }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-500">
            <div className={`w-2 h-2 rounded-full ${dot}`} />
            {label}: <span className="font-medium text-gray-700">{tasks.filter(t => t.category === label).length}</span>
          </div>
        ))}
      </div>

      {/* Calendar body */}
      <div className="flex flex-col flex-1 overflow-hidden bg-white">
        {view === 'Month' && (
          <MonthView anchor={anchor} tasks={tasks} today={today} onDayClick={handleDayClick} />
        )}
        {view === 'Week' && (
          <WeekView anchor={anchor} tasks={tasks} today={today} onDayClick={handleDayClick} />
        )}
        {view === 'Day' && (
          <DayView anchor={anchor} tasks={tasks} today={today} onComplete={markComplete} />
        )}
      </div>
    </div>
  );
}
