import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Edit, UserX, UserCheck } from 'lucide-react';
import { listUsers } from '../../services/api';
import type { Database } from '../../types/supabase';
import styles from './UserList.module.css';

type UserRow = Database['public']['Tables']['users']['Row'];

interface UserListProps {
  onCreateUser: () => void;
}

const UserList: React.FC<UserListProps> = ({ onCreateUser }) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search/filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'field_worker'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        try {
          const usersData = await listUsers();
          setUsers(usersData);
        } catch (error: any) {
          setError(error.message || 'Failed to load users');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Filtered and searched users
  const filteredUsers = users.filter(user => {
    // Search by name, email, userCode
    const matchesSearch =
      user.full_name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.user_code.toLowerCase().includes(search.toLowerCase());
    // Filter by role
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    // Filter by status
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.status === 'active' : user.status !== 'active');
    return matchesSearch && matchesRole && matchesStatus;
  });
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.userListContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
        </div>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={styles.userListContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
          <button className={styles.newUserButton} onClick={onCreateUser}>
            <UserPlus size={18} />
            <span>New User</span>
          </button>
        </div>
        <div className={styles.emptyState}>
          <p>Error: {error}</p>
          <button 
            className={styles.emptyStateButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (users.length === 0) {
    return (
      <div className={styles.userListContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>User Management</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Users size={24} color="#6B7280" />
          </div>
          <h3>No users found</h3>
          <p className={styles.emptyStateText}>
            Get started by creating a new user
          </p>
          <button 
            className={styles.emptyStateButton}
            onClick={onCreateUser}
          >
            <UserPlus size={18} />
            <span>Create User</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Render user list
  return (
    <div className={styles.userListContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Management</h2>
        <button className={styles.newUserButton} onClick={onCreateUser}>
          <UserPlus size={18} />
          <span>New User</span>
        </button>
      </div>
      
      {/* Search and filter controls */}
      <div style={{ display: 'flex', gap: 12, margin: '16px 0', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, email, or user code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, minWidth: 220 }}
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value as 'all' | 'admin' | 'field_worker')}
          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4 }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="field_worker">Field Worker</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4 }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>User Code</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.user_code}</td>
                <td>
                  <span className={user.role === 'admin' ? styles.adminRole : styles.fieldWorkerRole}>
                    {user.role === 'admin' ? 'Admin' : 'Field Worker'}
                  </span>
                </td>
                <td>
                  <span className={user.status === 'active' ? styles.activeStatus : styles.inactiveStatus}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.actionButton} 
                      title="Edit User"
                      onClick={() => {/* Edit user functionality would go here */}}
                    >
                      <Edit size={16} />
                    </button>
                    {user.status === 'active' ? (
                      <button 
                        className={styles.actionButton} 
                        title="Deactivate User"
                        onClick={() => {/* Deactivate user functionality would go here */}}
                      >
                        <UserX size={16} />
                      </button>
                    ) : (
                      <button 
                        className={styles.actionButton} 
                        title="Reactivate User"
                        onClick={() => {/* Reactivate user functionality would go here */}}
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;