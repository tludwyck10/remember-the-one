import { useState } from 'react';
import { Check, User, MapPin, Phone, Mail, Briefcase, ChevronDown, LogOut, Camera } from 'lucide-react';
import Avatar from '../components/Avatar';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { uploadPhoto } from '../lib/uploadPhoto';

const CAMPUSES = ['Frisco', 'Allen', 'McKinney', 'Prosper', 'Online'];

const ROLES = [
  'Lead Pastor',
  'Assistant Pastor',
  'Worship Pastor',
];

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 section-label mb-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { profile, updateProfile } = useProfile();
  const { signOut, church, session, updateUserProfile } = useAuth();
  const [form, setForm]         = useState({ ...profile });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError]         = useState('');

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    setPhotoError('');
    const { url, error } = await uploadPhoto(file, `pastors/${session.user.id}`);
    if (error) setPhotoError('Upload failed. Make sure the "photos" storage bucket exists in Supabase.');
    else await updateUserProfile({ avatarUrl: url });
    setPhotoUploading(false);
    e.target.value = '';
  }
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const displayName = `${form.title ? form.title + ' ' : ''}${form.firstName} ${form.lastName}`.trim();

  return (
    <div className="page-enter min-h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6 flex items-end justify-between">
        <div>
          <p className="section-label mb-1">{church?.name || 'Account'}</p>
          <h1 className="text-2xl font-light text-gray-900 tracking-tight">My Profile</h1>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] font-medium text-gray-400 hover:text-red-500 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Preview card */}
        <div className="card p-6 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #2A9D8F 100%)' }}>
          <label className="relative group flex-shrink-0 cursor-pointer">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt="Profile"
                  className="w-16 h-16 rounded-full object-cover block" />
              : <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-semibold">
                  {form.firstName?.[0] ?? ''}{form.lastName?.[0] ?? ''}
                </div>
            }
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {photoUploading
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Camera className="w-4 h-4 text-white" />
              }
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </label>
          <div>
            <p className="text-white text-lg font-light">{displayName || 'Your Name'}</p>
            <p className="text-white/60 text-[11px] uppercase tracking-[0.14em] mt-0.5">{form.role || 'Role'}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin className="w-3 h-3 text-white/50" />
              <p className="text-white/60 text-xs">{form.campus ? `${form.campus} Campus` : 'Campus'}</p>
            </div>
          </div>
        </div>

        {photoError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-red-600">{photoError}</p>
          </div>
        )}

        {/* Edit form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div className="card p-6">
            <p className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2A9D8F]" /> Personal Info
            </p>
            <div className="grid grid-cols-3 gap-5">
              <Field label="Title">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Pastor"
                  className="input-line"
                />
              </Field>
              <Field label="First Name">
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  placeholder="Alex"
                  className="input-line"
                  required
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => set('lastName', e.target.value)}
                  placeholder="Johnson"
                  className="input-line"
                />
              </Field>
            </div>
          </div>

          {/* Role & Campus */}
          <div className="card p-6">
            <p className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2A9D8F]" /> Role & Campus
            </p>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Role">
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={e => set('role', e.target.value)}
                    className="input-line bg-transparent appearance-none pr-6 cursor-pointer">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </Field>
              <Field label="Campus" icon={MapPin}>
                <div className="relative">
                  <select
                    value={form.campus}
                    onChange={e => set('campus', e.target.value)}
                    className="input-line bg-transparent appearance-none pr-6 cursor-pointer">
                    {CAMPUSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div className="card p-6">
            <p className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2A9D8F]" /> Contact Info
            </p>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Phone" icon={Phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="(972) 555-0000"
                  className="input-line"
                />
              </Field>
              <Field label="Email" icon={Mail}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@shoreline.city"
                  className="input-line"
                />
              </Field>
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6">
            <p className="text-sm font-semibold text-gray-800 mb-5">Bio / Personal Note</p>
            <textarea
              rows={4}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              placeholder="A short note about your ministry focus or personal mission..."
              className="input-line resize-none"
            />
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => { setForm({ ...profile }); setSaved(false); }}
              className="btn-secondary">
              Discard Changes
            </button>
            <button type="submit"
              className={`btn-primary flex items-center gap-2 transition-all ${saved ? 'bg-green-600 hover:bg-green-700' : ''}`}>
              {saved ? <><Check className="w-3.5 h-3.5" /> Saved</> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
