import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ErrorBoundary from './components/ui/ErrorBoundary';
import RouteLoader from './components/ui/RouteLoader';
import { useAuth } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Journal = lazy(() => import('./pages/Journal'));
const Habits = lazy(() => import('./pages/Habits'));
const Social = lazy(() => import('./pages/Social'));
const NewsIntelligence = lazy(() => import('./pages/NewsIntelligence'));
const SkillDevelopment = lazy(() => import('./pages/SkillDevelopment'));
const BusinessLab = lazy(() => import('./pages/BusinessLab'));
const WealthBuilding = lazy(() => import('./pages/WealthBuilding'));
const Goals = lazy(() => import('./pages/Goals'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

function Page({ children }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

function ProtectedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <RouteLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function PublicRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  if (isLoading) return <RouteLoader />;

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

function AdminRoutes() {
  const { isLoading, user } = useAuth();

  if (isLoading) return <RouteLoader />;

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.pathname}>
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route element={<AppShell />}>
            <Route index element={<Page><Dashboard /></Page>} />
            <Route path="coach" element={<Page><AICoach /></Page>} />
            <Route path="journal" element={<Page><Journal /></Page>} />
            <Route path="habits" element={<Page><Habits /></Page>} />
            <Route path="social" element={<Page><Social /></Page>} />
            <Route path="news" element={<Page><NewsIntelligence /></Page>} />
            <Route path="skills" element={<Page><SkillDevelopment /></Page>} />
            <Route path="business-lab" element={<Page><BusinessLab /></Page>} />
            <Route path="wealth" element={<Page><WealthBuilding /></Page>} />
            <Route path="goals" element={<Page><Goals /></Page>} />
            <Route path="analytics" element={<Page><Analytics /></Page>} />
            <Route path="profile" element={<Page><Profile /></Page>} />
            <Route path="settings" element={<Page><Settings /></Page>} />
            <Route element={<AdminRoutes />}>
              <Route path="admin" element={<Page><Admin /></Page>} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
