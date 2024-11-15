import React from 'react';
import { Clock } from 'lucide-react';

interface MonitoringIntervalProps {
  currentInterval: number;
  onIntervalChange: (interval: number) => void;
}

export function MonitoringInterval({ currentInterval, onIntervalChange }: MonitoringIntervalProps) {
  const intervals = [
    { label: '5 seconds', value: 5000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Monitoring Interval</h2>
      </div>
      <div className="space-y-4">
        {intervals.map((interval) => (
          <button
            key={interval.value}
            onClick={() => onIntervalChange(interval.value)}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              currentInterval === interval.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {interval.label}
          </button>
        ))}
      </div>
    </div>
  );
}