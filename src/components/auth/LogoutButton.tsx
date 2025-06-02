import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ 
  variant = 'primary',
  className = ''
}) => {
  const { logout, state } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'minimal':
        return 'bg-transparent hover:bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={state.isLoading}
      className={`flex items-center justify-center gap-2 rounded px-4 py-2 transition ${getButtonStyles()} ${className}`}
    >
      <LogOut size={18} />
      <span>{state.isLoading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
};

export default LogoutButton;
