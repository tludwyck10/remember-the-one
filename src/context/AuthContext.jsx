import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession]           = useState(undefined); // undefined = still initializing
  const [userProfile, setUserProfile]   = useState(null);
  const [church, setChurch]             = useState(null);
  const [teamMembers, setTeamMembers]   = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
      else   setProfileLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) fetchProfile(s.user.id);
      else { setUserProfile(null); setChurch(null); setTeamMembers([]); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    setProfileLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('*, churches(*)')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      const { churches: churchData, ...profileData } = data;
      setUserProfile(profileData);
      setChurch(churchData || null);

      if (profileData.church_id) {
        const { data: members } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('church_id', profileData.church_id)
          .order('first_name');
        setTeamMembers(members || []);
      }
    } else {
      setUserProfile(null);
      setChurch(null);
    }
    setProfileLoading(false);
  }

  // ── Auth ──────────────────────────────────────────────────────
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error;
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUserProfile(null);
    setChurch(null);
    setTeamMembers([]);
  }

  // ── Church onboarding ─────────────────────────────────────────
  async function createChurch(churchName, profileData) {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return { error: 'Not authenticated' };

    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newChurch, error: churchErr } = await supabase
      .from('churches')
      .insert({ name: churchName, join_code: joinCode })
      .select()
      .single();
    if (churchErr) return { error: churchErr.message };

    const { error: profileErr } = await supabase
      .from('user_profiles')
      .insert({ id: s.user.id, church_id: newChurch.id, role: 'admin', email: s.user.email, ...profileData });

    if (profileErr) {
      await supabase.from('churches').delete().eq('id', newChurch.id);
      return { error: profileErr.message };
    }

    await fetchProfile(s.user.id);
    return { church: newChurch };
  }

  async function joinChurch(joinCode, profileData) {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return { error: 'Not authenticated' };

    const { data: found } = await supabase
      .from('churches')
      .select()
      .eq('join_code', joinCode.toUpperCase().trim())
      .maybeSingle();
    if (!found) return { error: 'Church not found. Double-check your join code.' };

    const { error: profileErr } = await supabase
      .from('user_profiles')
      .insert({ id: s.user.id, church_id: found.id, role: 'pastor', email: s.user.email, ...profileData });
    if (profileErr) return { error: profileErr.message };

    await fetchProfile(s.user.id);
    return { church: found };
  }

  // ── Church update (admin only) ────────────────────────────────
  async function updateChurch(data) {
    if (!church?.id) return { error: 'No church found' };

    const updates = {};
    if (data.name     !== undefined) updates.name      = data.name;
    if (data.joinCode !== undefined) updates.join_code = data.joinCode;

    const { error } = await supabase
      .from('churches')
      .update(updates)
      .eq('id', church.id);

    if (error) return { error: error.message };

    setChurch(prev => ({ ...prev, ...updates }));
    return {};
  }

  // ── Profile update ────────────────────────────────────────────
  async function updateUserProfile(data) {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s) return;

    const updates = {};
    if (data.firstName !== undefined) updates.first_name = data.firstName;
    if (data.lastName  !== undefined) updates.last_name  = data.lastName;
    if (data.title     !== undefined) updates.title      = data.title;
    if (data.role      !== undefined) updates.role       = data.role;
    if (data.campus    !== undefined) updates.campus     = data.campus;
    if (data.phone     !== undefined) updates.phone      = data.phone;
    if (data.email     !== undefined) updates.email      = data.email;
    if (data.bio       !== undefined) updates.bio        = data.bio;

    setUserProfile(prev => ({ ...prev, ...updates }));

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', s.user.id);
    if (error) console.error('Profile update error:', error);
  }

  const authLoading = session === undefined || (!!session && profileLoading);

  return (
    <AuthContext.Provider value={{
      session,
      userProfile,
      church,
      teamMembers,
      authLoading,
      signIn,
      signUp,
      signOut,
      createChurch,
      joinChurch,
      updateUserProfile,
      updateChurch,
      refreshProfile: () => session && fetchProfile(session.user.id),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
