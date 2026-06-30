import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, MessageSquare, Heart, CheckSquare,
  Milestone, Calendar, Search, X, Menu, Footprints, LogOut,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/',              icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/people',        icon: Users,           label: 'People'       },
  { to: '/conversations', icon: MessageSquare,   label: 'Conversations' },
  { to: '/prayer',        icon: Heart,           label: 'Prayer'       },
  { to: '/tasks',         icon: CheckSquare,     label: 'Tasks'        },
  { to: '/events',        icon: Milestone,       label: 'Life Events'  },
  { to: '/calendar',      icon: Calendar,        label: 'Calendar'     },
  { to: '/cll',           icon: Footprints,      label: 'CLL Pathway'  },
  { to: '/team',          icon: Users,           label: 'Team'         },
  { to: '/search',        icon: Search,          label: 'Search'       },
];

export default function Sidebar({ open, onClose }) {
  const { profile }  = useProfile();
  const { signOut, church }   = useAuth();
  const displayName = `${profile.title ? profile.title + ' ' : ''}${profile.firstName} ${profile.lastName}`.trim();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-56 bg-white border-r border-gray-100 shadow-sm
        flex flex-col sidebar-transition
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black lg:hidden">
          <X className="w-4 h-4" />
        </button>

        {/* Brand */}
        <div className="px-5 pt-7 pb-6 border-b border-gray-100">
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-900 leading-snug">
            Remember<br />The One
          </p>
          <p className="text-[9px] uppercase tracking-[0.16em] text-gray-400 mt-2">
            {church?.name || 'Shoreline City'}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to + label}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-[0.1em] font-medium transition-all ${
                  isActive
                    ? 'bg-[#2A9D8F] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-1">
          <Link to="/profile" onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
              {profile.avatarUrl
                ? <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1B2A4A] group-hover:bg-[#2A9D8F] flex items-center justify-center text-white text-[9px] font-bold tracking-wide transition-colors">
                    {profile.firstName?.[0]}{profile.lastName?.[0]}
                  </div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-700 truncate">{displayName || 'My Profile'}</p>
              <p className="text-[9px] uppercase tracking-[0.12em] text-gray-400">
                {profile.campus ? `${profile.campus} Campus` : 'Edit Profile'}
              </p>
            </div>
          </Link>

          <button onClick={() => { signOut(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] uppercase tracking-[0.1em] font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function MenuButton({ onClick }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
      <Menu className="w-5 h-5" />
    </button>
  );
}
