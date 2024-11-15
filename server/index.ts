import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { SurveyMonitor } from './services/surveyMonitor';

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
  credential: admin.credential.applicationDefault(),
  projectId: "hroom-mpv-2f31e"
});

const db = getFirestore();
const timeZone = process.env.TZ || 'Europe/Moscow';
const defaultInterval = 300000; // 5 minutes

// Initialize survey monitor
const surveyMonitor = new SurveyMonitor(db, timeZone, defaultInterval);

// Start monitoring immediately
surveyMonitor.start();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current interval to new clients
  socket.emit('intervalUpdated', defaultInterval);
  
  socket.on('updateInterval', (interval: number) => {
    if (typeof interval === 'number' && interval >= 1000) {
      surveyMonitor.updateInterval(interval);
      io.emit('intervalUpdated', interval);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  surveyMonitor.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.API_PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});