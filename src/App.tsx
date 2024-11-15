import React, { useState, useEffect } from 'react';
import { Clock, Users, ClipboardList } from 'lucide-react';

interface Stats {
  planned: number;
  active: number;
}

function App() {
  const [stats, setStats] = useState<Stats>({ planned: 0, active: 0 });
  const [monitoringInterval, setMonitoringInterval] = useState(300000);
  const [surveyForm, setSurveyForm] = useState({
    surveyId: '',
    employeeId: '',
    answers: '',
    followups: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (error) {
        setError('Failed to connect to server. Please ensure the backend is running.');
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const updateMonitoringInterval = async (interval: number) => {
    try {
      const response = await fetch('http://localhost:3000/api/monitoring-interval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interval })
      });
      if (!response.ok) {
        throw new Error('Failed to update interval');
      }
      setMonitoringInterval(interval);
      setError(null);
    } catch (error) {
      setError('Failed to update monitoring interval. Please ensure the backend is running.');
      console.error('Failed to update interval:', error);
    }
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/submit-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyId: surveyForm.surveyId,
          employeeId: surveyForm.employeeId,
          answers: surveyForm.answers.split(',').map(a => a.trim()).filter(Boolean),
          followups: surveyForm.followups.split(',').map(f => f.trim()).filter(Boolean)
        })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert('Survey submitted successfully!');
        setSurveyForm({
          surveyId: '',
          employeeId: '',
          answers: '',
          followups: ''
        });
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to submit survey');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit survey');
      console.error('Failed to submit survey:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Survey Management Dashboard</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg flex items-center">
              <ClipboardList className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Planned Surveys</h2>
                <p className="text-3xl font-bold text-blue-600">{stats.planned}</p>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg flex items-center">
              <Users className="w-12 h-12 text-green-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Active Surveys</h2>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>

          {/* Monitoring Interval */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monitoring Interval</h2>
            <div className="flex gap-4">
              <button
                onClick={() => updateMonitoringInterval(5000)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                5 Seconds
              </button>
              <button
                onClick={() => updateMonitoringInterval(60000)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                1 Minute
              </button>
              <button
                onClick={() => updateMonitoringInterval(300000)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                5 Minutes
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Current interval: {monitoringInterval / 1000} seconds
            </p>
          </div>

          {/* Test Survey Form */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Survey Submission</h2>
            <form onSubmit={handleSubmitSurvey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Survey ID</label>
                <input
                  type="text"
                  value={surveyForm.surveyId}
                  onChange={(e) => setSurveyForm({ ...surveyForm, surveyId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                <input
                  type="text"
                  value={surveyForm.employeeId}
                  onChange={(e) => setSurveyForm({ ...surveyForm, employeeId: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Answers (comma-separated)</label>
                <input
                  type="text"
                  value={surveyForm.answers}
                  onChange={(e) => setSurveyForm({ ...surveyForm, answers: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Follow-ups (comma-separated)</label>
                <input
                  type="text"
                  value={surveyForm.followups}
                  onChange={(e) => setSurveyForm({ ...surveyForm, followups: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Test Survey
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;