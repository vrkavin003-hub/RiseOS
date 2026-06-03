import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Journal = lazy(() => import('./pages/Journal'));
const NewsIntelligence = lazy(() => import('./pages/NewsIntelligence'));
const SkillDevelopment = lazy(() => import('./pages/SkillDevelopment'));
const BusinessLab = lazy(() => import('./pages/BusinessLab'));
const WealthBuilding = lazy(() => import('./pages/WealthBuilding'));
const Goals = lazy(() => import('./pages/Goals'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

function RouteLoader() {
  return (
    <div className="page-shell">
      <div className="glass-panel rounded-[8px] p-5">
        <div className="h-7 w-56 animate-pulse rounded-full bg-white/8" />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
          <div className="h-28 animate-pulse rounded-[8px] bg-white/7" />
        </div>
      </div>
    </div>
  );
}

function Page({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Page><Login /></Page>} />
        <Route path="/register" element={<Page><Register /></Page>} />
        <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
        <Route element={<AppShell />}>
          <Route index element={<Page><Dashboard /></Page>} />
          <Route path="coach" element={<Page><AICoach /></Page>} />
          <Route path="journal" element={<Page><Journal /></Page>} />
          <Route path="news" element={<Page><NewsIntelligence /></Page>} />
          <Route path="skills" element={<Page><SkillDevelopment /></Page>} />
          <Route path="business-lab" element={<Page><BusinessLab /></Page>} />
          <Route path="wealth" element={<Page><WealthBuilding /></Page>} />
          <Route path="goals" element={<Page><Goals /></Page>} />
          <Route path="analytics" element={<Page><Analytics /></Page>} />
          <Route path="profile" element={<Page><Profile /></Page>} />
          <Route path="settings" element={<Page><Settings /></Page>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
