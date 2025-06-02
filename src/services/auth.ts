import config from '../config.json';

/**
 * User roles in the application
 */
export enum UserRole {
  ADMIN = 'admin',
  FIELD_WORKER = 'field-worker',
}

/**
 * User data structure
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Auth state structure
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login response
 */
export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Authentication service
 */
class AuthService {
  private tokenKey: string = config.LOCAL_STORAGE_TOKEN_KEY;
  
  /**
   * Get the current authentication state
   */
  getAuthState(): AuthState {
    if (!config.AUTH_ENABLED) {
      return {
        isAuthenticated: true,
        user: {
          id: 'test-user',
          email: 'test@example.com',
          name: 'Test User',
          role: UserRole.ADMIN,
        },
        token: config.TEST_TOKEN,
      };
    }
    
    const token = localStorage.getItem(this.tokenKey);
    if (!token) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
    
    try {
      // Attempt to decode the JWT token to get user data
      // This is a simple implementation - in production, you'd want to verify the token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const user = JSON.parse(jsonPayload) as User;
      return {
        isAuthenticated: true,
        user,
        token,
      };
    } catch (error) {
      console.error('Failed to parse auth token:', error);
      this.logout();
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
  }
  
  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthState> {
    if (!config.AUTH_ENABLED) {
      const authState = this.getAuthState();
      return authState;
    }
    
    try {
      const response = await fetch(`${config.API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json() as LoginResponse;
      localStorage.setItem(this.tokenKey, data.token);
      
      return {
        isAuthenticated: true,
        user: data.user,
        token: data.token,
      };
    } catch (error) {
      console.error('Login failed:', error);
      return {
        isAuthenticated: false,
        user: null,
        token: null,
      };
    }
  }
  
  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }
  
  /**
   * Get the authentication token
   */
  getToken(): string | null {
    if (!config.AUTH_ENABLED) {
      return config.TEST_TOKEN;
    }
    return localStorage.getItem(this.tokenKey);
  }
  
  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    if (!config.AUTH_ENABLED) {
      return true;
    }
    return !!this.getToken();
  }
  
  /**
   * Check if the current user has a specific role
   */
  hasRole(role: UserRole): boolean {
    const { user } = this.getAuthState();
    if (!user) return false;
    return user.role === role;
  }
}

// Create a singleton instance
const authService = new AuthService();
export default authService;
