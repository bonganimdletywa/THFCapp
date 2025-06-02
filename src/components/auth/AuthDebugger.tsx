import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DebugInfo {
  connection?: {
    status: 'error' | 'success';
    latency?: number;
    error?: string;
    data?: any;
  };
  session?: {
    exists?: boolean;
    error?: string;
    expiresAt?: string | null;
    tokenDetails?: {
      expiresIn?: number;
      tokenType?: string;
    } | null;
  };
  profile?: {
    exists?: boolean;
    error?: string;
    data?: any;
  };
}

const AuthDebugger: React.FC = () => {
  const { state } = useAuth();
  const [debugInfo, setDebugInfo] = React.useState<DebugInfo | null>(null);
  const [loading, setLoading] = React.useState(false);

  const checkSupabaseConnection = async () => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 seconds
      const start = Date.now();
      // Use fetch to call the Supabase REST endpoint directly for timeout support
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count&limit=1`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const end = Date.now();
      let error: string | undefined = undefined;
      let data = null;
      if (!response.ok) {
        error = `HTTP ${response.status}: ${response.statusText}`;
      } else {
        data = await response.json();
      }
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        connection: {
          status: error ? 'error' : 'success',
          latency: end - start,
          error: error,
          data: data
        }
      }));
    } catch (err) {
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        connection: {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        session: {
          exists: !!session,
          error: error?.message,
          expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : null,
          tokenDetails: session?.access_token ? {
            expiresIn: session.expires_in,
            tokenType: session.token_type
          } : null
        }
      }));
    } catch (err) {
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        session: {
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async () => {
    if (!state.user?.id) {
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        profile: {
          error: 'No user ID available'
        }
      }));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', state.user.id)
        .single();

      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        profile: {
          exists: !!data,
          error: error?.message,
          data: data
        }
      }));
    } catch (err) {
      setDebugInfo((prev: DebugInfo | null) => ({
        ...prev,
        profile: {
          error: err instanceof Error ? err.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg max-w-2xl mx-auto my-4">
      <h2 className="text-xl font-bold mb-4">Auth Debugger</h2>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Current Auth State</h3>
          <pre className="bg-gray-50 p-2 rounded text-sm">
            {JSON.stringify({
              isAuthenticated: state.isAuthenticated,
              isLoading: state.isLoading,
              error: state.error,
              user: {
                id: state.user?.id,
                email: state.user?.email,
                role: state.user?.role
              }
            }, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <button
            onClick={checkSupabaseConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Test Connection
          </button>
          <button
            onClick={checkSession}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Check Session
          </button>
          <button
            onClick={checkUserProfile}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Check Profile
          </button>
        </div>

        {loading && (
          <div className="text-gray-500">Loading...</div>
        )}

        {debugInfo && (
          <div className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Debug Information</h3>
            <pre className="bg-gray-50 p-2 rounded text-sm">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugger; 