import React from 'react';
import Header from '../components/layout/Header';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminLoginForm from '../components/auth/AdminLoginForm';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { state } = useAuth();

  if (!state.isAuthenticated) {
    return <AdminLoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default AdminDashboardPage;