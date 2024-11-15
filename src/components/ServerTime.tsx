import { FC } from 'react';
import { Clock } from 'lucide-react';

interface ServerTimeProps {
  time: string;
}

export const ServerTime: FC<ServerTimeProps> = ({ time }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Server Time (Moscow)</h2>
      </div>
      <p className="text-lg text-gray-700">{time || 'Connecting...'}</p>
    </div>
  );
};