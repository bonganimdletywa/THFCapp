import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Filter, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  status: 'success' | 'warning' | 'error';
}

const AdminActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: '2025-05-27T14:23:41',
        action: 'User Login',
        user: 'John Smith',
        details: 'Successfully logged in from 192.168.1.145',
        status: 'success'
      },
      {
        id: '2',
        timestamp: '2025-05-27T13:18:22',
        action: 'Crate Created',
        user: 'Admin User',
        details: 'Created crate CRATE_XYZ_123',
        status: 'success'
      },
      {
        id: '3',
        timestamp: '2025-05-27T12:05:11',
        action: 'API Error',
        user: 'System',
        details: 'Failed to connect to Zoho API: Timeout',
        status: 'error'
      },
      {
        id: '4',
        timestamp: '2025-05-27T10:42:58',
        action: 'User Created',
        user: 'Admin User',
        details: 'Created new field worker account: worker@example.com',
        status: 'success'
      },
      {
        id: '5',
        timestamp: '2025-05-26T16:37:19',
        action: 'System Warning',
        user: 'System',
        details: 'Database approaching storage limit (85%)',
        status: 'warning'
      },
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 800);
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Activity Logs</h1>
        <div className="flex space-x-3">
          <button className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
            <Calendar size={16} className="mr-2" />
            <span>Date Range</span>
          </button>
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Logs</option>
              <option value="success">Success</option>
              <option value="warning">Warnings</option>
              <option value="error">Errors</option>
            </select>
            <Filter size={16} className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" />
          </div>
          <button 
            className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 800);
            }}
          >
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center px-3 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700">
            <Download size={16} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.user}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              No log entries match your filter criteria
            </div>
          )}

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredLogs.length} of {logs.length} entries
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminActivityLogs;
