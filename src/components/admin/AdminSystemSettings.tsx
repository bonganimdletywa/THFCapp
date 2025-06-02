import React, { useState } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';

interface SystemSetting {
  id: string;
  name: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
  description: string;
  category: 'general' | 'api' | 'storage' | 'notifications';
}

const AdminSystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([
    {
      id: 'app_name',
      name: 'Application Name',
      value: 'THFC Scanner',
      type: 'text',
      description: 'Display name used throughout the application',
      category: 'general'
    },
    {
      id: 'offline_mode',
      name: 'Enable Offline Mode',
      value: 'true',
      type: 'boolean',
      description: 'Allow users to operate with limited functionality when offline',
      category: 'general'
    },
    {
      id: 'zoho_api_url',
      name: 'Zoho API URL',
      value: 'https://api.zoho.com/v2/',
      type: 'text',
      description: 'Base URL for Zoho API integration',
      category: 'api'
    },
    {
      id: 'api_timeout',
      name: 'API Timeout (seconds)',
      value: '30',
      type: 'number',
      description: 'Maximum time to wait for API responses before timing out',
      category: 'api'
    },
    {
      id: 'retry_attempts',
      name: 'API Retry Attempts',
      value: '3',
      type: 'number',
      description: 'Number of times to retry failed API calls',
      category: 'api'
    },
    {
      id: 'offline_storage_limit',
      name: 'Offline Storage Limit (MB)',
      value: '50',
      type: 'number',
      description: 'Maximum storage space for offline data',
      category: 'storage'
    },
    {
      id: 'log_retention_days',
      name: 'Log Retention Period',
      value: '30',
      type: 'number',
      description: 'Number of days to keep application logs',
      category: 'storage'
    },
    {
      id: 'notification_method',
      name: 'Notification Method',
      value: 'both',
      type: 'select',
      options: ['email', 'in-app', 'both', 'none'],
      description: 'How system notifications are delivered to users',
      category: 'notifications'
    },
    {
      id: 'admin_email',
      name: 'Admin Email',
      value: 'admin@example.com',
      type: 'text',
      description: 'Email address for system notifications',
      category: 'notifications'
    }
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSettingChange = (id: string, newValue: string) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value: newValue } : setting
    ));
  };

  const saveSettings = () => {
    setSaving(true);
    setSavedMessage(null);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSavedMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSavedMessage(null);
      }, 3000);
    }, 1000);
  };

  const categories = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'api', name: 'API Integration', icon: '🔌' },
    { id: 'storage', name: 'Storage & Data', icon: '💾' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  const filteredSettings = settings.filter(setting => setting.category === activeCategory);

  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        );
      case 'boolean':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        );
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800">System Settings</h1>
        <p className="text-gray-600 mt-2">Configure application-wide settings and preferences</p>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 p-6 border-r border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Categories</h2>
          <nav className="space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                  activeCategory === category.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </nav>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <div className="flex items-start">
              <AlertTriangle size={20} className="text-blue-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Need help?</h3>
                <p className="mt-1 text-sm text-blue-500">
                  Contact system administrator for assistance with these settings.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="grid gap-6">
            {filteredSettings.map(setting => (
              <div key={setting.id} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <label htmlFor={setting.id} className="block text-sm font-medium text-gray-700">
                      {setting.name}
                    </label>
                    <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                  </div>
                </div>
                <div className="mt-2">
                  {renderSettingInput(setting)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {saving ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
          
          {savedMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{savedMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
