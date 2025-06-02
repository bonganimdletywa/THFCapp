import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';


const SignUpForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'production_operator' | 'dispatch_coordinator' | 'csi_field_worker' | 'thfc_production_operator' | 'zoho_admin'>('csi_field_worker');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, state } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccess('');
    
    // Form validation
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setFormError('Password is required');
      return;
    }
    
    // Basic password strength validation
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    
    if (!fullName.trim()) {
      setFormError('Full name is required');
      return;
    }
    
    try {
      await signUp(email, password, { fullName, role });
      setSuccess('Account created! Please check your email to verify your account.');
      // Clear form on success
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('csi_field_worker');
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      let message = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === 'object' && error && 'message' in error) {
        message = String((error as any).message);
      }
      setFormError(message);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow p-8 flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Sign Up</h1>
        <p className="text-gray-600">Create a new account</p>
      </div>
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-fullname" className="font-medium">Full Name</label>
          <input
            id="signup-fullname"
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-email" className="font-medium">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded px-3 py-2"
            autoComplete="username"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-password" className="font-medium">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border rounded px-3 py-2"
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-role" className="font-medium">Role</label>
          <select
            id="signup-role"
            value={role}
            onChange={e => setRole(e.target.value as 'production_operator' | 'dispatch_coordinator' | 'csi_field_worker' | 'thfc_production_operator' | 'zoho_admin')}
            className="border rounded px-3 py-2"
          >
            <option value="production_operator">Production Operator</option>
            <option value="dispatch_coordinator">Dispatch Coordinator</option>
            <option value="csi_field_worker">CSI Field Worker</option>
            <option value="thfc_production_operator">THFC Production Operator</option>
            <option value="zoho_admin">Zoho Admin</option>
          </select>
        </div>
        {(state.error || formError) && (
          <div className="text-red-600 text-sm mt-2">
            {state.error || formError}
          </div>
        )}
        {success && (
          <div className="text-green-600 text-sm mt-2">{success}</div>
        )}
        <button 
          type="submit" 
          className={`${state.isLoading ? 'bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded px-4 py-2 mt-4 w-full transition`} 
          disabled={state.isLoading}
        >
          {state.isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
