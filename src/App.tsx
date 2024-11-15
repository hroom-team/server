import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { io } from 'socket.io-client';
import { MonitoringInterval } from './components/MonitoringInterval';
import { SurveyStats } from './components/SurveyStats';
import { ServerTime } from './components/ServerTime';

const firebaseConfig = {
  apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
  authDomain: "hroom-mpv-2f31e.firebaseapp.com",
  projectId: "hroom-mpv-2f31e",
  storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
  messagingSenderId: "356587190634",
  appId: "1:356587190634:web:f7759be737658700830d13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const socket = io('http://localhost:3000');

function App() {
  const [monitoringInterval, setMonitoringInterval] = useState(300000);
  const [plannedCount, setPlannedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [serverTime, setServerTime] = useState('');

  useEffect(() => {
    const surveysQuery = query(
      collection(db, 'surveys'),
      where('status', 'in', ['planned', 'active'])
    );

    const unsubscribe = onSnapshot(surveysQuery, (snapshot) => {
      const planned = snapshot.docs.filter(doc => doc.data().status === 'planned').length;
      const active = snapshot.docs.filter(doc => doc.data().status === 'active').length;
      
      setPlannedCount(planned);
      setActiveCount(active);
    });

    socket.on('serverTime', (time: string) => {
      setServerTime(time);
    });

    socket.on('intervalUpdated', (interval: number) => {
      setMonitoringInterval(interval);
    });

    return () => {
      unsubscribe();
      socket.off('serverTime');
      socket.off('intervalUpdated');
    };
  }, []);

  const handleIntervalChange = (newInterval: number) => {
    socket.emit('updateInterval', newInterval);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Survey Monitoring Dashboard</h1>
            <p className="text-gray-600">Real-time survey status monitoring and control</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <MonitoringInterval 
              currentInterval={monitoringInterval} 
              onIntervalChange={handleIntervalChange} 
            />
            <SurveyStats 
              plannedCount={plannedCount} 
              activeCount={activeCount} 
            />
          </div>

          <ServerTime time={serverTime} />
        </div>
      </div>
    </div>
  );
}

export default App;