import { DispatchScanner } from '../components/DispatchScanner';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function DispatchPage() {
  const auth = useAuth();
  const currentUser = auth?.state.user || null;
  const isLoading = auth?.state.isLoading || false;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <DispatchScanner />
    </div>
  );
}
