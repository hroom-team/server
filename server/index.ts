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
const serviceAccount = {
  type: "service_account",
  project_id: "hroom-mpv-2f31e",
  private_key_id: "4a22a46c3c63b5c357a3ae3d0f1a9c5ba4c071fc",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCkJ2hnWdMmdnxQ\nsXpFl7OwrSYfPdu9Zs1S8qw16SvnAr20jL5zcM2fazDiZaHbmFvrob5ldio7DRud\ncYVpKAWuMBuLhIesKstOhFNKlncs5jmVfmqf5vQhZv3Rfs9oDmhzGkbaTL/DZANN\n54ptgK/XwdSmZq/EuKYlEP1CC+nBjPyB4Gz7HSVs8wX7VwFV14XfMST+Qod2IDsn\nx7AlZRrdRFYmUTiscVo/PwBW4mD3jet3yP9uRUTGbuBYgOJBKHybZPvXCvs1jaiJ\nmqdGw4UunKW2RM2N6pyctfvKQjjMBBppp6jVYn/DcbQS7M2d+BPtTvNVBRA/KeMC\nY9FeT8HtAgMBAAECggEAJSmRwoIMoiLFUoxXWs10/ey5Gm4J4vdUyPBM6diLmp0d\nfvQ1ApP5TRu6gaqSCdGUj8P6g2RMu7kkNRDX695GaPCVr9B1WZYHmFMvOw3U1Zqa\nUzx/HYuu3agAEs8zW8KVRWefvjiNWkn4UIj4ZwFw7bbBMlnBdZb68B3IRA1H4ovw\nWdNQtTArsvEnCuaJYxeyKLn0iHdUEZgA7bYQamI3foVV4YFZx5f/wGgSjaQdz7TY\n4qS6aYuOO21bswPsBxw66Pkk28VbEKz5EJe9RRmlf7Cf/Bcm9adJpXV3fWWG+KPP\nNpRJuW+qu7BnLaEcLQl5wu6zoyQ549xI81C1yO1y8QKBgQDTn9sLCq/vBF5XhWlE\neS+ARdnA1rTZy2O9HnSgHBwlvret0j8Q9X5l3Q9rdEG2q2vCgk4PWp7F0gzgLsnY\nQ4PyHS+JGpiD3SgWUktFb86QgJehMPaiJg+jAGxLFI1bZiIaxSPgDu/59qaEa+6M\nJxS18po/e0dHbwX1Y4SQfJTksQKBgQDGk02oFksprnE7g9AUvJQxMZaf03mRViLv\nmf1/++tMUbmK2PyRt+SqkhQhZKmwq/HWWnbaEpb700zXFir8+voO2kt8Kso72fW0\n1gLkKTgKFRmRqsRHnIdpLqJEUvEUshPz6Vn1ZC5JeOZzUcS6edlXaC6DciXhR0MW\ntL5flFFv/QKBgQCnTH68EezYBhoXEq8PpMY6n/3vh01dyH7G6abFVLOj20wWLFoT\nLCCKouInzraMlKQSFzViyf8u4EmxiQuk3msXIp+LwezEgjfIvbIn6KXicuZsVesE\ncRZ3hEQYbtz5XpqjkyozXVu1vpoRocnqHpMu6+WpPeoxvMF3Jv+LwhFrYQKBgQCG\nT0WcJhAKjjGKRppsHCzDpT2yto+oLLGOjAI5GYRJ55Duh9s1GENy10EEYRihJXt6\nN0/iKeazR3TWmejTmVGe0Cl0P2Dv4HlfKc1k0zhTIXhc3TrLEOVJ0D/ypILpM5Vp\nSXEOGAdyrHJ6l1jPo/DMPOwQ/hj+6XtIFVIaRbBbZQKBgHmRmkrjpidB+Ll+/en7\n5MjmKo1xd9gP2QdNIsthGpUoVM5KNHeb4nnJAs5My21mOREOgWjsUA4tB1WtTuhQ\nw3Q1fT8gr5nWeM7vpH6Pmibs6CpUoy+iyKKmq94qPPcg1WLpaYZwwT9ZFo8csSFU\nngHuIjrYiHAZ9Y8tyTJLIjJq\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-kunoo@hroom-mpv-2f31e.iam.gserviceaccount.com",
  client_id: "102484568664811698250",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kunoo%40hroom-mpv-2f31e.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: "https://hroom-mpv-2f31e.firebaseio.com",
  storageBucket: "hroom-mpv-2f31e.appspot.com"
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
  
  // Send current interval and monitoring status to new clients
  socket.emit('intervalUpdated', defaultInterval);
  socket.emit('monitoringStatus', surveyMonitor.isRunning());
  
  socket.on('checkMonitoringStatus', () => {
    socket.emit('monitoringStatus', surveyMonitor.isRunning());
  });

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