import { Suspense, lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import FieldWorkerPage from './pages/FieldWorkerPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUserPage from './pages/AdminUserPage';
import DispatchPage from './pages/DispatchPage';
import { useAuth } from './contexts/AuthContext';

const AdminCrateManagementPage = lazy(() => import('./pages/AdminCrateManagementPage'));
const AdminActivityLogsPage = lazy(() => import('./pages/AdminActivityLogsPage'));
const AdminSystemSettingsPage = lazy(() => import('./pages/AdminSystemSettingsPage'));

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!state.user || !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Root layout component
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
        path: '/field-worker',
        element: (
          <ProtectedRoute allowedRoles={['csi_field_worker', 'thfc_production_operator', 'production_operator']}>
            <FieldWorkerPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute allowedRoles={['zoho_admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/users',
        element: (
          <ProtectedRoute allowedRoles={['zoho_admin']}>
            <AdminUserPage />
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/crates',
        element: (
          <ProtectedRoute allowedRoles={['zoho_admin']}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminCrateManagementPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/logs',
        element: (
          <ProtectedRoute allowedRoles={['zoho_admin']}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminActivityLogsPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/admin/settings',
        element: (
          <ProtectedRoute allowedRoles={['zoho_admin']}>
            <Suspense fallback={<div>Loading...</div>}>
              <AdminSystemSettingsPage />
            </Suspense>
          </ProtectedRoute>
        )
      },
      {
        path: '/dispatch',
        element: (
          <ProtectedRoute allowedRoles={['dispatch_coordinator']}>
            <DispatchPage />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
];