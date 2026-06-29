import { useState } from 'react';
import { Church, Users, ArrowRight, MapPin, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const CAMPUSES = ['Frisco', 'Allen', 'McKinney', 'Prosper', 'Online'];
const ROLES = [
  'Lead Pastor',
  'Assistant Pastor',
  'Worship Pastor',
];

function SelectField({ label, value, onChange, options, icon: Icon }) {
  return (
    <div>
      <label className="section-label flex items-center gap-1 mb-2">
        {Icon && <Icon className="w-3 h-3" />} {label}
      </label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="input-line bg-transparent appearance-none pr-6 w-full cursor-pointer">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function ProfileFields({ profile, onChange }) {
  function set(field) { return e => onChange(field, e.target.value); }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="section-label block mb-2">Title</label>
          <input type="text" value={profile.title} onChange={set('title')}
            placeholder="Pastor" className="input-line" />
        </div>
        <div>
          <label className="section-label block mb-2">First Name *</label>
          <input type="text" value={profile.first_name} onChange={set('first_name')}
            placeholder="Alex" className="input-line" autoFocus />
        </div>
        <div>
          <label className="section-label block mb-2">Last Name</label>
          <input type="text" value={profile.last_name} onChange={set('last_name')}
            placeholder="Johnson" className="input-line" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Role" value={profile.role} onChange={v => onChange('role', v)} options={ROLES} />
        <SelectField label="Campus" value={profile.campus} onChange={v => onChange('campus', v)}
          options={CAMPUSES} icon={MapPin} />
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { createChurch, joinChurch, signOut } = useAuth();
  const [step, setStep]     = useState('choose'); // 'choose' | 'register' | 'join'
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', title: 'Pastor', role: 'Lead Pastor', campus: 'Frisco',
  });
  const [churchName, setChurchName] = useState('');
  const [joinCode, setJoinCode]     = useState('');

  function setP(field, val) { setProfile(p => ({ ...p, [field]: val })); setError(''); }

  async function handleRegister(e) {
    e.preventDefault();
    if (!profile.first_name.trim()) { setError('Enter your first name.'); return; }
    if (!churchName.trim())          { setError('Enter your church name.'); return; }
    setLoading(true);
    const { error: err } = await createChurch(churchName.trim(), profile);
    if (err) { setError(err); setLoading(false); }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!profile.first_name.trim())    { setError('Enter your first name.'); return; }
    if (joinCode.trim().length !== 6)  { setError('Join codes are exactly 6 characters.'); return; }
    setLoading(true);
    const { error: err } = await joinChurch(joinCode, profile);
    if (err) { setError(err); setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#F5F4F1] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.22em] text-gray-400 font-medium mb-2">
            Remember The One
          </p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">
            {step === 'choose'   ? 'Set up your team'         :
             step === 'register' ? 'Register your church'     :
                                   'Join your church team'}
          </h1>
          {step === 'choose' && (
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Is this a new church account, or are you joining an existing team?
            </p>
          )}
        </div>

        {/* Choose */}
        {step === 'choose' && (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep('register')}
              className="card p-6 text-left hover:shadow-md transition-all group border-2 border-transparent hover:border-[#2A9D8F]">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                <Church className="w-5 h-5 text-[#2A9D8F]" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Register my church</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Create a new account. You'll be the admin and get a join code to share.
              </p>
              <div className="flex items-center gap-1 text-[#2A9D8F] text-[10px] font-medium mt-4">
                Get started <ArrowRight className="w-3 h-3" />
              </div>
            </button>

            <button onClick={() => setStep('join')}
              className="card p-6 text-left hover:shadow-md transition-all group border-2 border-transparent hover:border-amber-300">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">Join my church</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Your church already has an account. Enter the 6-character join code from your admin.
              </p>
              <div className="flex items-center gap-1 text-amber-500 text-[10px] font-medium mt-4">
                Enter code <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          </div>
        )}

        {/* Register */}
        {step === 'register' && (
          <form onSubmit={handleRegister} className="card p-6 space-y-6">
            <div>
              <label className="section-label block mb-2">Church Name *</label>
              <input type="text" value={churchName}
                onChange={e => { setChurchName(e.target.value); setError(''); }}
                placeholder="e.g. Shoreline City Church" className="input-line" autoFocus />
            </div>
            <div>
              <p className="section-label mb-3">Your Info</p>
              <ProfileFields profile={profile} onChange={setP} />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('choose'); setError(''); }}
                className="btn-secondary flex-1">Back</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                {loading ? 'Creating...' : 'Register Church'}
              </button>
            </div>
          </form>
        )}

        {/* Join */}
        {step === 'join' && (
          <form onSubmit={handleJoin} className="card p-6 space-y-6">
            <div>
              <label className="section-label block mb-2">Join Code *</label>
              <input
                type="text"
                value={joinCode}
                onChange={e => {
                  setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                  setError('');
                }}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
                className="input-line text-center text-2xl tracking-[0.5em] font-mono"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                6-character code from your church admin
              </p>
            </div>
            <div>
              <p className="section-label mb-3">Your Info</p>
              <ProfileFields profile={profile} onChange={setP} />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('choose'); setError(''); }}
                className="btn-secondary flex-1">Back</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
                {loading ? 'Joining...' : 'Join Church'}
              </button>
            </div>
          </form>
        )}

        <button onClick={signOut}
          className="mt-6 w-full text-center text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
          Sign out and use a different account
        </button>
      </div>
    </div>
  );
}
