import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { state, logout } = useAuth();
  const location = useLocation();
  const { user } = state;

  if (!state.isAuthenticated) return null;

  const isFieldWorker = user?.role === 'field_worker';
  const isAdmin = user?.role === 'admin';

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Truck size={24} />
        <span>THFC</span>
      </div>

      <nav className={styles.nav}>
        {isFieldWorker && (
          <Link 
            to="/field-worker" 
            className={`${styles.navLink} ${location.pathname.startsWith('/field-worker') ? styles.active : ''}`}
          >
            Crate Scanner
          </Link>
        )}
        
        {isAdmin && (
          <>
            <Link 
              to="/admin" 
              className={`${styles.navLink} ${location.pathname === '/admin' ? styles.active : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/admin/users" 
              className={`${styles.navLink} ${location.pathname === '/admin/users' ? styles.active : ''}`}
            >
              <Users size={18} style={{ marginRight: '4px', verticalAlign: 'text-top' }} />
              Users
            </Link>
          </>
        )}
      </nav>

      <div className={styles.userSection}>
        {user && <span className={styles.userName}>{user.fullName}</span>}
        <button 
          className={styles.logoutButton} 
          onClick={logout}
          aria-label="Logout"
        >
          <LogOut size={18} style={{ verticalAlign: 'text-bottom' }} />
          <span className={styles.mobileHidden}> Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;