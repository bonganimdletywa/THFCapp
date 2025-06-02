import React from 'react';
import Header from '../components/layout/Header';
import { useAuth } from '../contexts/AuthContext';
import AdminSystemSettings from '../components/admin/AdminSystemSettings';
import AdminLoginForm from '../components/auth/AdminLoginForm';

const AdminSystemSettingsPage: React.FC = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <AdminSystemSettings />
      </main>
    </div>
  );
};

export default AdminSystemSettingsPage;
