import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz';
import { isBefore, isAfter } from 'date-fns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:4000",
    methods: ["GET", "POST"]
  }
});

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(join(__dirname, 'firebase-credentials.json')),
  projectId: "hroom-mpv-2f31e"
});

const db = admin.firestore();
let monitoringInterval = 300000; // Default 5 minutes
const timeZone = 'Europe/Moscow';

async function checkAndUpdateSurveyStatuses() {
  try {
    const now = utcToZonedTime(new Date(), timeZone);
    const serverTime = format(now, 'yyyy-MM-dd HH:mm:ss zzz', { timeZone });
    
    console.log(`Running status check at ${serverTime}`);
    io.emit('serverTime', serverTime);

    // Check planned surveys
    const plannedSnapshot = await db
      .collection('surveys')
      .where('status', '==', 'planned')
      .get();

    const plannedUpdates = plannedSnapshot.docs.map(async (doc) => {
      const survey = doc.data();
      const startDate = utcToZonedTime(new Date(survey.startDate), timeZone);
      const endDate = utcToZonedTime(new Date(survey.endDate), timeZone);

      if (isAfter(now, startDate) && isBefore(now, endDate)) {
        await doc.ref.update({ status: 'active' });
        console.log(`Survey ${doc.id} status updated to active`);
      }
    });

    // Check active surveys
    const activeSnapshot = await db
      .collection('surveys')
      .where('status', '==', 'active')
      .get();

    const activeUpdates = activeSnapshot.docs.map(async (doc) => {
      const survey = doc.data();
      const endDate = utcToZonedTime(new Date(survey.endDate), timeZone);

      if (isAfter(now, endDate)) {
        await doc.ref.update({ status: 'processing' });
        console.log(`Survey ${doc.id} status updated to processing`);
      }
    });

    await Promise.all([...plannedUpdates, ...activeUpdates]);
  } catch (error) {
    console.error('Error updating survey statuses:', error);
  }
}

// Start monitoring
let monitoringTimer: NodeJS.Timeout;

function startMonitoring() {
  if (monitoringTimer) {
    clearInterval(monitoringTimer);
  }
  monitoringTimer = setInterval(checkAndUpdateSurveyStatuses, monitoringInterval);
  checkAndUpdateSurveyStatuses(); // Run immediately on start/restart
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('intervalUpdated', monitoringInterval);
  
  socket.on('updateInterval', (interval: number) => {
    if (typeof interval === 'number' && interval >= 1000) {
      monitoringInterval = interval;
      startMonitoring();
      io.emit('intervalUpdated', interval);
      console.log(`Monitoring interval updated to ${interval}ms`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the initial monitoring
startMonitoring();

const PORT = process.env.API_PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});