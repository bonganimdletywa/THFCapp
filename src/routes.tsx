import { Suspense, lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FieldWorkerPage from './pages/FieldWorkerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserPage from './pages/AdminUserPage';
import DispatchPage from './pages/DispatchPage';

const AdminCrateManagementPage = lazy(() => import('./pages/AdminCrateManagementPage'));
const AdminActivityLogsPage = lazy(() => import('./pages/AdminActivityLogsPage'));
const AdminSystemSettingsPage = lazy(() => import('./pages/AdminSystemSettingsPage'));

// Root layout component to ensure context is available
const RootLayout = () => {
  return <Outlet />;
};

export const routes = [
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LoginPage />
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]; 