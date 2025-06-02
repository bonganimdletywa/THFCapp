import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, Truck, UserPlus, ClipboardList, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AdminDashboard.module.css';

const AdminDashboard: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeIcon}>
            <Users size={24} />
          </div>
          <h1 className={styles.welcomeTitle}>
            Welcome, {user?.fullName || 'Administrator'}
          </h1>
        </div>
        
        <p className={styles.welcomeText}>
          This is the THFC administration dashboard where you can manage users, monitor crate dispatches, and access system settings.
        </p>
        
        <div className={styles.quickLinks}>
          <Link to="/admin/users" className={styles.quickLinkButton}>
            <UserPlus size={18} />
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/crates" className={styles.quickLinkButton}>
            <Package size={18} />
            <span>Crate QR/Labels</span>
          </Link>
          <Link to="/admin/logs" className={styles.quickLinkButton}>
            <ClipboardList size={18} />
            <span>Activity Logs</span>
          </Link>
          <Link to="/admin/settings" className={styles.quickLinkButton}>
            <Settings size={18} />
            <span>System Settings</span>
          </Link>
        </div>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Total Users</h3>
            <div className={styles.usersIcon}>
              <Users size={16} />
            </div>
          </div>
          <p className={styles.statValue}>23</p>
          <div className={`${styles.statChange} ${styles.statIncrease}`}>
            <span>+2 this month</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Active Crates</h3>
            <div className={styles.cratesIcon}>
              <Package size={16} />
            </div>
          </div>
          <p className={styles.statValue}>142</p>
          <div className={`${styles.statChange} ${styles.statIncrease}`}>
            <span>+15 this week</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <h3 className={styles.statTitle}>Field Workers</h3>
            <div className={styles.activeIcon}>
              <Truck size={16} />
            </div>
          </div>
          <p className={styles.statValue}>18</p>
          <div className={`${styles.statChange} ${styles.statDecrease}`}>
            <span>-1 this month</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;