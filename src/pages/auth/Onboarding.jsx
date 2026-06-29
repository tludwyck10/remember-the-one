import { useState } from 'react';
import { Church, Users, ArrowRight, MapPin, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

function ProfileFields({ profile, onChange, campuses }) {
  function set(field) { return e => onChange(field, e.target.value); }

  const campusOptions = campuses && campuses.length > 0 ? campuses : null;

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
        {campusOptions ? (
          <SelectField label="Campus" value={profile.campus} onChange={v => onChange('campus', v)}
            options={campusOptions} icon={MapPin} />
        ) : (
          <div>
            <label className="section-label flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" /> Campus
            </label>
            <input type="text" value={profile.campus} onChange={set('campus')}
              placeholder="e.g. Frisco" className="input-line" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Onboarding() {
  const { createChurch, joinChurch, lookupChurch, signOut } = useAuth();
  const [step, setStep]     = useState('choose'); // 'choose' | 'register' | 'join'
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    first_name: '', last_name: '', title: 'Pastor', role: 'Lead Pastor', campus: '',
  });
  const [churchName, setChurchName] = useState('');

  // Register campuses state
  const [newCampus, setNewCampus]     = useState('');
  const [campusList, setCampusList]   = useState([]);

  // Join state
  const [joinCode, setJoinCode]       = useState('');
  const [foundChurch, setFoundChurch] = useState(null); // { id, name, campuses }
  const [lookingUp, setLookingUp]     = useState(false);

  function setP(field, val) { setProfile(p => ({ ...p, [field]: val })); setError(''); }

  // ── Register helpers ──────────────────────────────────────────────────────
  function addRegisterCampus() {
    const trimmed = newCampus.trim();
    if (!trimmed) return;
    if (campusList.includes(trimmed)) return;
    setCampusList(prev => [...prev, trimmed]);
    setNewCampus('');
  }

  function removeRegisterCampus(c) {
    setCampusList(prev => prev.filter(x => x !== c));
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!profile.first_name.trim()) { setError('Enter your first name.'); return; }
    if (!churchName.trim())          { setError('Enter your church name.'); return; }
    setLoading(true);
    const { error: err } = await createChurch(churchName.trim(), profile, campusList);
    if (err) { setError(err); setLoading(false); }
  }

  // ── Join helpers ──────────────────────────────────────────────────────────
  async function handleCodeChange(val) {
    const code = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setJoinCode(code);
    setFoundChurch(null);
    setError('');

    if (code.length === 6) {
      setLookingUp(true);
      const { church: found, error: err } = await lookupChurch(code);
      setLookingUp(false);
      if (err) { setError(err); return; }
      setFoundChurch(found);
      // Pre-select first campus if available
      if (found.campuses?.length > 0) {
        setP('campus', found.campuses[0]);
      }
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    if (!profile.first_name.trim())   { setError('Enter your first name.'); return; }
    if (!foundChurch)                  { setError('Enter a valid 6-character join code.'); return; }
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

            {/* Campuses */}
            <div>
              <label className="section-label flex items-center gap-1 mb-3">
                <MapPin className="w-3 h-3" /> Campuses
                <span className="text-gray-300 font-normal">(optional — you can add later)</span>
              </label>
              {campusList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {campusList.map(c => (
                    <span key={c}
                      className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-medium px-3 py-1 rounded-full border border-teal-100">
                      {c}
                      <button type="button" onClick={() => removeRegisterCampus(c)}
                        className="text-teal-400 hover:text-red-500 transition-colors">×</button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCampus}
                  onChange={e => setNewCampus(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRegisterCampus(); } }}
                  placeholder="e.g. Frisco, Allen, Online..."
                  className="input-line flex-1"
                />
                <button type="button" onClick={addRegisterCampus}
                  className="btn-secondary flex-shrink-0">Add</button>
              </div>
            </div>

            <div>
              <p className="section-label mb-3">Your Info</p>
              <ProfileFields profile={profile} onChange={setP} campuses={campusList} />
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
                onChange={e => handleCodeChange(e.target.value)}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
                className="input-line text-center text-2xl tracking-[0.5em] font-mono"
              />
              <div className="mt-2 h-5 flex items-center justify-center">
                {lookingUp && (
                  <p className="text-[10px] text-gray-400">Looking up church...</p>
                )}
                {foundChurch && !lookingUp && (
                  <div className="flex items-center gap-1.5 text-[11px] text-teal-600 font-medium">
                    <Check className="w-3.5 h-3.5" /> Joining: {foundChurch.name}
                  </div>
                )}
                {!foundChurch && !lookingUp && joinCode.length === 6 && error && (
                  <p className="text-[10px] text-red-500">{error}</p>
                )}
                {!foundChurch && !lookingUp && joinCode.length < 6 && (
                  <p className="text-[10px] text-gray-400">6-character code from your church admin</p>
                )}
              </div>
            </div>

            {foundChurch && (
              <div>
                <p className="section-label mb-3">Your Info</p>
                <ProfileFields
                  profile={profile}
                  onChange={setP}
                  campuses={foundChurch.campuses}
                />
              </div>
            )}

            {error && joinCode.length < 6 && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => { setStep('choose'); setError(''); setFoundChurch(null); setJoinCode(''); }}
                className="btn-secondary flex-1">Back</button>
              <button type="submit" disabled={loading || !foundChurch} className="btn-primary flex-1 disabled:opacity-60">
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
