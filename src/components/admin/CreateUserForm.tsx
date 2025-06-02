import React, { useState } from 'react';
import { X, Save, User } from 'lucide-react';
import { createUser } from '../../services/api';
import type { Database } from '../../types/supabase';
import styles from './CreateUserForm.module.css';

type UserInsert = Database['public']['Tables']['users']['Insert'];

interface CreateUserFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onCancel, onSuccess }) => {
  const [formData, setFormData] = useState<Omit<UserInsert, 'id' | 'created_at' | 'updated_at' | 'last_login_at' | 'status' | 'hashed_password'> & { password: string }>({
    full_name: '',
    email: '',

    role: 'field_worker',
    password: ''
  }); // location field removed
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate full name
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }
    

    
    // If you want to validate a short code, add a custom field to your Supabase schema and type. Otherwise, remove this validation.
    // (location validation removed)
    // Validate role
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Validate password
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setNotification(null);
    
    try {
      try {
        await createUser(formData);
        setNotification({
          type: 'success',
          message: 'User created successfully'
        });
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } catch (error: any) {
        setNotification({
          type: 'error',
          message: error.message || 'Failed to create user'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate a suggested user code based on full name
  const suggestUserCode = () => {
    if (!formData.full_name.trim()) return;
    
    const nameParts = formData.full_name.trim().split(' ');
    if (nameParts.length >= 2) {
      // Take first letter of first name + last name
      const suggested = (nameParts[0].charAt(0) + nameParts[nameParts.length - 1]).toUpperCase();
      setFormData(prev => ({ ...prev, user_code: suggested }));
    }
  };
  

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Create New User</h2>
        <button className={styles.closeButton} onClick={onCancel} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      
      {notification && (
        <div className={notification.type === 'success' ? styles.success : styles.errorNotification}>
          {notification.message}
        </div>
      )}
      
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="full_name" className={styles.label}>
              Full Name <span className={styles.required}>*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className={styles.input}
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              disabled={isSubmitting}
            />
            {errors.full_name && <div className={styles.error}>{errors.full_name}</div>}
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              disabled={isSubmitting}
            />
            {errors.email && <div className={styles.error}>{errors.email}</div>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              disabled={isSubmitting}
            />
            {errors.password && <div className={styles.error}>{errors.password}</div>}
          </div>
          {/* location field removed */}
          
          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Role <span className={styles.required}>*</span>
            </label>
            <select
              id="role"
              name="role"
              className={styles.select}
              value={formData.role}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            >
              <option value="field_worker">Field Worker</option>
              <option value="admin">Administrator</option>
            </select>
            {errors.role && <div className={styles.error}>{errors.role}</div>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={styles.input}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              disabled={isSubmitting}
            />
            {errors.password && <div className={styles.error}>{errors.password}</div>}
            <div className={styles.hint}>Minimum 6 characters</div>
          </div>
        </div>
        
        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.loading}></span>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Create User</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;