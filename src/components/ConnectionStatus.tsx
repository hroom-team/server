import { FC } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isMonitoringActive: boolean;
}

export const ConnectionStatus: FC<ConnectionStatusProps> = ({ isConnected, isMonitoringActive }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-gray-700">
            Database Connection: {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isMonitoringActive ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-gray-700">
            Monitoring Service: {isMonitoringActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};