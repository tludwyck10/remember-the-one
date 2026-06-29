import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import PersonDetail from './pages/PersonDetail';
import PrayerRequests from './pages/PrayerRequests';
import Tasks from './pages/Tasks';
import Conversations from './pages/Conversations';
import LifeEvents from './pages/LifeEvents';
import Placeholder from './pages/Placeholder';
import CLLPathway from './pages/CLLPathway';
import Profile from './pages/Profile';
import CalendarPage from './pages/Calendar';
import Team from './pages/Team';
import TeamMember from './pages/TeamMember';
import AuthPage from './pages/auth/AuthPage';
import Onboarding from './pages/auth/Onboarding';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { PeopleProvider, usePeople } from './context/PeopleContext';
import { TasksProvider, useTasks } from './context/TasksContext';

function AppShell() {
  const { loading: peopleLoading } = usePeople();
  const { loading: tasksLoading }  = useTasks();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (peopleLoading || tasksLoading) return <LoadingScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F4F1]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/people"        element={<People />} />
            <Route path="/people/:id"    element={<PersonDetail />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/prayer"        element={<PrayerRequests />} />
            <Route path="/tasks"         element={<Tasks />} />
            <Route path="/events"        element={<LifeEvents />} />
            <Route path="/calendar"      element={<CalendarPage />} />
            <Route path="/cll"           element={<CLLPathway />} />
            <Route path="/team"          element={<Team />} />
            <Route path="/team/:pastorId" element={<TeamMember />} />
            <Route path="/search"        element={<Placeholder title="Search" />} />
            <Route path="/profile"       element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AuthGate() {
  const { session, userProfile, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (!session)    return <AuthPage />;
  if (!userProfile?.church_id) return <Onboarding />;

  return (
    <ProfileProvider>
      <TasksProvider>
        <PeopleProvider>
          <AppShell />
        </PeopleProvider>
      </TasksProvider>
    </ProfileProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
