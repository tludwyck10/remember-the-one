// Compatibility shim — delegates to AuthContext.
// Header, Sidebar, and Profile.jsx continue to call useProfile() unchanged.
import { useAuth } from './AuthContext';

export function ProfileProvider({ children }) {
  return <>{children}</>;
}

export function useProfile() {
  const { userProfile, updateUserProfile } = useAuth();

  const profile = {
    firstName: userProfile?.first_name || '',
    lastName:  userProfile?.last_name  || '',
    title:     userProfile?.title      || '',
    role:      userProfile?.role       || '',
    campus:    userProfile?.campus     || '',
    phone:     userProfile?.phone      || '',
    email:     userProfile?.email      || '',
    bio:       userProfile?.bio        || '',
    avatarUrl: userProfile?.avatar_url || null,
  };

  return { profile, updateProfile: updateUserProfile };
}
