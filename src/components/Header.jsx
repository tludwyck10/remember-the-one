import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { MenuButton } from './Sidebar';
import { useProfile } from '../context/ProfileContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Header({ onMenuClick }) {
  const { profile } = useProfile();
  const greeting = getGreeting();
  const displayName = `${profile.title ? profile.title + ' ' : ''}${profile.firstName}`.trim();
  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <header className="safe-top bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        <MenuButton onClick={onMenuClick} />
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400 font-medium">{greeting}</p>
          <h1 className="text-sm font-semibold text-gray-900 mt-0.5">{displayName}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {profile.campus && (
          <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
            <MapPin className="w-3 h-3 text-[#2A9D8F]" />
            <span className="text-[10px] uppercase tracking-[0.14em] text-gray-500 font-medium">
              {profile.campus} Campus
            </span>
          </div>
        )}
        <Link to="/profile" title="Edit Profile"
          className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-[#2A9D8F] transition-all">
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-[#1B2A4A] flex items-center justify-center text-white text-[10px] font-bold tracking-wide">
                {initials}
              </div>
          }
        </Link>
      </div>
    </header>
  );
}
