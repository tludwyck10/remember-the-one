import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]             = useState('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (tab === 'signup' && password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (tab === 'login') {
      const err = await signIn(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      navigate('/', { replace: true });
    } else {
      const { error: err } = await signUp(email, password);
      if (err) { setError(err.message); setLoading(false); return; }
      setCheckEmail(true);
    }
    setLoading(false);
  }

  // ── Check-your-email screen ────────────────────────────────────────────────
  if (checkEmail) {
    return (
      <div className="min-h-screen bg-[#F5F4F1] flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A9D8F 100%)' }}>
            <Mail className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight mb-2">Check your email</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-1">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-medium text-gray-800 mb-6">{email}</p>
          <p className="text-xs text-gray-400 leading-relaxed mb-8">
            Click the link in the email to confirm your account, then come back here and sign in.
          </p>
          <button
            onClick={() => { setCheckEmail(false); setTab('login'); setPassword(''); setConfirm(''); }}
            className="btn-primary w-full justify-center">
            Back to Sign In
          </button>
          <p className="text-[10px] text-gray-400 mt-4">
            Didn't get it? Check your spam folder.
          </p>
        </div>
      </div>
    );
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
              <button key={val} onClick={() => { setTab(val); setError(''); setConfirm(''); }}
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

            {tab === 'signup' && (
              <div>
                <label className="section-label block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  required
                  className="input-line"
                />
              </div>
            )}

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
              After confirming your email you'll set up or join your church team.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
