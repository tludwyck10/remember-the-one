import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]         = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (tab === 'login') {
      const err = await signIn(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      navigate('/', { replace: true });
    } else {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      // On success the auth listener fires → Onboarding renders automatically
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#F5F4F1] flex">

      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] px-16 py-14"
        style={{ background: 'linear-gradient(160deg, #1B2A4A 0%, #2A9D8F 100%)' }}>
        <p className="text-white/50 text-[10px] uppercase tracking-[0.28em] font-semibold">
          Shoreline City
        </p>
        <div>
          <h1 className="text-white text-5xl font-light leading-tight tracking-tight">
            Remember<br />The One
          </h1>
          <p className="text-white/50 text-sm mt-5 leading-loose max-w-xs">
            A discipleship CRM for the pastoral team — so no one falls through the cracks.
          </p>
          <p className="text-white/25 text-[10px] uppercase tracking-[0.24em] mt-10">
            One person · One step · Eternal impact
          </p>
        </div>
        <div />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-2xl font-light text-gray-900 tracking-tight">Remember The One</h1>
            <p className="text-xs text-gray-400 mt-1">Pastoral discipleship CRM</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            {[['login', 'Sign In'], ['signup', 'Create Account']].map(([val, label]) => (
              <button key={val} onClick={() => { setTab(val); setError(''); }}
                className={`flex-1 py-2 text-[11px] uppercase tracking-[0.12em] font-medium rounded-lg transition-colors ${
                  tab === val
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="section-label block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@shoreline.city"
                required
                autoFocus
                className="input-line"
              />
            </div>
            <div>
              <label className="section-label block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="input-line"
              />
              {tab === 'signup' && (
                <p className="text-[10px] text-gray-400 mt-1">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60">
              {loading
                ? 'Please wait...'
                : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {tab === 'signup' && (
            <p className="text-[10px] text-gray-400 text-center mt-6 leading-relaxed">
              After creating your account you'll set up or join your church team.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
