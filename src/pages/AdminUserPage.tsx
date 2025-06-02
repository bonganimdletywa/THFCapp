import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header';
import UserList from '../components/admin/UserList';
import CreateUserForm from '../components/admin/CreateUserForm';

const AdminUserPage: React.FC = () => {
  const { state } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // If user is not authenticated, redirect to login
  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // If user is not an admin, redirect appropriately
  if (state.user && state.user.role !== 'admin') {
    return <Navigate to={state.user.role === 'field_worker' ? '/field-worker' : '/'} replace />;
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-5xl mx-auto w-full">
        {showCreateForm ? (
          <CreateUserForm 
            onCancel={() => setShowCreateForm(false)}
            onSuccess={() => {
              setShowCreateForm(false);
              // In a real app, we would refresh the user list here
            }}
          />
        ) : (
          <UserList 
            onCreateUser={() => setShowCreateForm(true)}
          />
        )}
      </main>
    </div>
  );
};

export default AdminUserPage;