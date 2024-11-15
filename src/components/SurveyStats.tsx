import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SurveyStatsProps {
  plannedCount: number;
  activeCount: number;
}

export function SurveyStats({ plannedCount, activeCount }: SurveyStatsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Survey Statistics</h2>
      </div>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-700">Planned Surveys</p>
          <p className="text-2xl font-bold text-blue-600">{plannedCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-700">Active Surveys</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
      </div>
    </div>
  );
}