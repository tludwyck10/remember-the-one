import { Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, Calendar, Heart, ListChecks } from 'lucide-react';
import Avatar from '../components/Avatar';
import { usePeople, CIRCLES, INNER_CIRCLE_CAP } from '../context/PeopleContext';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';

const CIRCLE_MAX = { 'Inner Circle': INNER_CIRCLE_CAP, 'Discipling': 12, 'Active Relationships': 20, 'New Connections': 10 };
const CIRCLE_COLOR = { 'Inner Circle': 'bg-amber-400', 'Discipling': 'bg-[#2A9D8F]', 'Active Relationships': 'bg-blue-400', 'New Connections': 'bg-purple-400' };

function bucketFor(task) {
  if (!task.dueAt) return null;
  const due = new Date(task.dueAt); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due Today';
  if (diffDays <= 7) return 'This Week';
  return 'Later';
}

function formatDue(dueAt) {
  const due = new Date(dueAt); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due - today) / 86400000);
  if (diffDays === 0)  return 'Due today';
  if (diffDays === 1)  return 'Due tomorrow';
  if (diffDays < 0)    return `Overdue ${Math.abs(diffDays)}d`;
  return `Due in ${diffDays}d`;
}

export default function Dashboard() {
  const { people } = usePeople();
  const { tasks }  = useTasks();
  const { userProfile } = useAuth();

  const myPeople = people.filter(p => p.pastorId === userProfile?.id && !p.archived);
  const myTasks  = tasks.filter(t => t.pastorId === userProfile?.id && !t.completed);

  // Prioritized reminders list: overdue first (most overdue first), then due today, then upcoming.
  const reminders = myTasks
    .map(t => ({ ...t, bucket: bucketFor(t) }))
    .filter(t => t.bucket && t.bucket !== 'Later')
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    .slice(0, 6);

  const recentPrayers = myPeople
    .flatMap(p => p.prayerRequests.map(pr => ({ ...pr, personId: p.id, personName: p.name, personAvatarUrl: p.avatarUrl })))
    .filter(pr => pr.status !== 'Answered')
    .slice(0, 4);

  const peopleById = Object.fromEntries(myPeople.map(p => [p.id, p]));

  const activePrayers = myPeople
    .flatMap(p => p.prayerRequests)
    .filter(pr => pr.status !== 'Answered').length;

  const overdueCount  = myTasks.filter(t => bucketFor(t) === 'Overdue').length;
  const dueTodayCount = myTasks.filter(t => bucketFor(t) === 'Due Today').length;
  const thisWeekCount = myTasks.filter(t => bucketFor(t) === 'This Week').length;

  const statConfig = [
    { value: dueTodayCount, label: 'Due Today',      sub: 'People to reach out to', icon: ListChecks,    bg: 'bg-teal-50',  icon_cls: 'text-[#2A9D8F]', num_cls: 'text-[#2A9D8F]', to: '/tasks'    },
    { value: overdueCount,  label: 'Overdue',        sub: 'Need your attention',    icon: AlertTriangle, bg: 'bg-amber-50', icon_cls: 'text-amber-500', num_cls: 'text-amber-600', to: '/tasks'    },
    { value: thisWeekCount, label: 'Upcoming',       sub: 'Next 7 days',            icon: Calendar,      bg: 'bg-blue-50',  icon_cls: 'text-blue-500',  num_cls: 'text-blue-600',  to: '/calendar' },
    { value: activePrayers, label: 'Active Prayers', sub: 'People being lifted up', icon: Heart,         bg: 'bg-rose-50',  icon_cls: 'text-rose-400',  num_cls: 'text-rose-500',  to: '/prayer'   },
  ];

  return (
    <div className="page-enter p-6 space-y-6 max-w-7xl mx-auto">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map(s => (
          <Link key={s.label} to={s.to} className="card p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`${s.bg} p-3 rounded-xl flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.icon_cls}`} />
            </div>
            <div>
              <p className={`text-3xl font-light ${s.num_cls}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Reminders — most overdue first */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Reminders</p>
              <Link to="/tasks" className="flex items-center gap-1 text-[11px] text-[#2A9D8F] hover:underline font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {reminders.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-gray-300">You're all caught up</p>
                </div>
              )}
              {reminders.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <Avatar name={task.personName} avatarUrl={peopleById[task.personId]?.avatarUrl} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{task.label}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-medium ${task.bucket === 'Overdue' ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatDue(task.dueAt)}
                      </span>
                    </div>
                  </div>
                  <Link to={`/people/${task.personId}`}
                    className="text-[11px] font-medium text-[#2A9D8F] opacity-0 group-hover:opacity-100 transition-opacity">
                    View →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Quote banner */}
          <div className="rounded-2xl px-8 py-10 text-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A9D8F 100%)' }}>
            <p className="text-white text-sm font-light leading-loose tracking-wide max-w-sm mx-auto">
              "We don't have to do everything, but we can all remember one."
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.22em] mt-3">
              One person · One step · Eternal impact
            </p>
          </div>

          {/* Circle overview */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-gray-800 mb-4">Closeness Tiers</p>
            <div className="space-y-4">
              {CIRCLES.map(circle => {
                const count = myPeople.filter(p => p.circle === circle).length;
                const max   = CIRCLE_MAX[circle];
                return (
                  <div key={circle}>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs font-medium text-gray-700">{circle}</p>
                      <p className="text-[10px] text-gray-400">
                        {count}{circle === 'Inner Circle' ? ` / ${max}` : ' people'}
                      </p>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${CIRCLE_COLOR[circle]} rounded-full transition-all`}
                        style={{ width: `${Math.min(100, (count / max) * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Prayer Requests */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Recent Prayer Requests</p>
              <Link to="/prayer" className="flex items-center gap-1 text-[11px] text-[#2A9D8F] hover:underline font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPrayers.map(pr => (
                <div key={pr.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <Avatar name={pr.personName} avatarUrl={pr.personAvatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{pr.personName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{pr.request}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 flex-shrink-0">{pr.daysActive}d</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission values */}
          <div className="card p-5">
            <p className="section-label mb-5">Our Mission</p>
            <div className="space-y-4">
              {[
                { label: 'LOVED',       desc: 'Everyone matters to God and to us.' },
                { label: 'VALUED',      desc: 'You are seen, known, and important.' },
                { label: 'BELIEVED IN', desc: 'We believe in your potential and purpose.' },
              ].map(v => (
                <div key={v.label} className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#2A9D8F] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-800">{v.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
