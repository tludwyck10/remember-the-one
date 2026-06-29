import { Link } from 'react-router-dom';
import { ArrowRight, Users, AlertTriangle, Calendar, Heart } from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { usePeople } from '../context/PeopleContext';
import { useTasks } from '../context/TasksContext';

export default function Dashboard() {
  const { people } = usePeople();
  const { tasks }  = useTasks();

  const dueToday       = people.filter(p => p.lastContactDays <= 1).slice(0, 3);
  const recentPrayers  = people
    .flatMap(p => p.prayerRequests.map(pr => ({ ...pr, personId: p.id, personName: p.name })))
    .filter(pr => pr.status !== 'Answered')
    .slice(0, 4);
  const upcomingFollowUps = tasks
    .filter(t => t.category !== 'Completed' && t.category !== 'Overdue')
    .slice(0, 4);

  const activePrayers = people
    .flatMap(p => p.prayerRequests)
    .filter(pr => pr.status !== 'Answered').length;

  const statConfig = [
    { value: tasks.filter(t => t.category === 'Due Today').length,  label: 'Due Today',     sub: 'People to reach out to', icon: Users,         bg: 'bg-teal-50',  icon_cls: 'text-[#2A9D8F]', num_cls: 'text-[#2A9D8F]' },
    { value: tasks.filter(t => t.category === 'Overdue').length,    label: 'Overdue',       sub: 'Need your attention',    icon: AlertTriangle, bg: 'bg-amber-50', icon_cls: 'text-amber-500', num_cls: 'text-amber-600' },
    { value: tasks.filter(t => t.category === 'This Week').length,  label: 'Upcoming',      sub: 'Next 7 days',            icon: Calendar,      bg: 'bg-blue-50',  icon_cls: 'text-blue-500',  num_cls: 'text-blue-600'  },
    { value: activePrayers,                                          label: 'Active Prayers',sub: 'People being lifted up', icon: Heart,         bg: 'bg-rose-50',  icon_cls: 'text-rose-400',  num_cls: 'text-rose-500'  },
  ];

  return (
    <div className="page-enter p-6 space-y-6 max-w-7xl mx-auto">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map(s => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-xl flex-shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.icon_cls}`} />
            </div>
            <div>
              <p className={`text-3xl font-light ${s.num_cls}`}>{s.value}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-[10px] text-gray-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-col grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Due Today */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Due Today</p>
              <Link to="/people" className="flex items-center gap-1 text-[11px] text-[#2A9D8F] hover:underline font-medium">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {dueToday.map(person => (
                <div key={person.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <Avatar name={person.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{person.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge label={person.circle} />
                      <span className="text-[10px] text-gray-400">{person.lastContactDays}d since contact</span>
                    </div>
                  </div>
                  <Link to={`/people/${person.id}`}
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
            <p className="text-sm font-semibold text-gray-800 mb-4">Circle Overview</p>
            <div className="space-y-4">
              {[
                { label: 'Inner Circle',     count: people.filter(p => p.circle === 'Inner Circle').length,     max: 5,  color: 'bg-amber-400' },
                { label: 'Growth Circle',    count: people.filter(p => p.circle === 'Growth Circle').length,    max: 12, color: 'bg-[#2A9D8F]' },
                { label: 'Community Circle', count: people.filter(p => p.circle === 'Community Circle').length, max: 20, color: 'bg-blue-400' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-xs font-medium text-gray-700">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.count} people</p>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${(item.count / item.max) * 100}%` }} />
                  </div>
                </div>
              ))}
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
                  <Avatar name={pr.personName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{pr.personName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-1">{pr.request}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 flex-shrink-0">{pr.daysActive}d</p>
                </div>
              ))}
            </div>
          </div>

          {/* Follow-Ups */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Upcoming Follow-Ups</p>
              <Link to="/tasks" className="text-[11px] text-[#2A9D8F] hover:underline font-medium">Manage</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingFollowUps.map(task => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{task.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-[0.08em]">
                      {task.type} · {task.date}{task.time && ` · ${task.time}`}
                    </p>
                  </div>
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
