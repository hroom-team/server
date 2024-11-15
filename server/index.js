import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Worker } from 'worker_threads';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with credentials from credits.ts
const serviceAccount = {
  projectId: "hroom-mpv-2f31e",
  clientEmail: "firebase-adminsdk-kunoo@hroom-mpv-2f31e.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCkJ2hnWdMmdnxQ\nsXpFl7OwrSYfPdu9Zs1S8qw16SvnAr20jL5zcM2fazDiZaHbmFvrob5ldio7DRud\ncYVpKAWuMBuLhIesKstOhFNKlncs5jmVfmqf5vQhZv3Rfs9oDmhzGkbaTL/DZANN\n54ptgK/XwdSmZq/EuKYlEP1CC+nBjPyB4Gz7HSVs8wX7VwFV14XfMST+Qod2IDsn\nx7AlZRrdRFYmUTiscVo/PwBW4mD3jet3yP9uRUTGbuBYgOJBKHybZPvXCvs1jaiJ\nmqdGw4UunKW2RM2N6pyctfvKQjjMBBppp6jVYn/DcbQS7M2d+BPtTvNVBRA/KeMC\nY9FeT8HtAgMBAAECggEAJSmRwoIMoiLFUoxXWs10/ey5Gm4J4vdUyPBM6diLmp0d\nfvQ1ApP5TRu6gaqSCdGUj8P6g2RMu7kkNRDX695GaPCVr9B1WZYHmFMvOw3U1Zqa\nUzx/HYuu3agAEs8zW8KVRWefvjiNWkn4UIj4ZwFw7bbBMlnBdZb68B3IRA1H4ovw\nWdNQtTArsvEnCuaJYxeyKLn0iHdUEZgA7bYQamI3foVV4YFZx5f/wGgSjaQdz7TY\n4qS6aYuOO21bswPsBxw66Pkk28VbEKz5EJe9RRmlf7Cf/Bcm9adJpXV3fWWG+KPP\nNpRJuW+qu7BnLaEcLQl5wu6zoyQ549xI81C1yO1y8QKBgQDTn9sLCq/vBF5XhWlE\neS+ARdnA1rTZy2O9HnSgHBwlvret0j8Q9X5l3Q9rdEG2q2vCgk4PWp7F0gzgLsnY\nQ4PyHS+JGpiD3SgWUktFb86QgJehMPaiJg+jAGxLFI1bZiIaxSPgDu/59qaEa+6M\nJxS18po/e0dHbwX1Y4SQfJTksQKBgQDGk02oFksprnE7g9AUvJQxMZaf03mRViLv\nmf1/++tMUbmK2PyRt+SqkhQhZKmwq/HWWnbaEpb700zXFir8+voO2kt8Kso72fW0\n1gLkKTgKFRmRqsRHnIdpLqJEUvEUshPz6Vn1ZC5JeOZzUcS6edlXaC6DciXhR0MW\ntL5flFFv/QKBgQCnTH68EezYBhoXEq8PpMY6n/3vh01dyH7G6abFVLOj20wWLFoT\nLCCKouInzraMlKQSFzViyf8u4EmxiQuk3msXIp+LwezEgjfIvbIn6KXicuZsVesE\ncRZ3hEQYbtz5XpqjkyozXVu1vpoRocnqHpMu6+WpPeoxvMF3Jv+LwhFrYQKBgQCG\nT0WcJhAKjjGKRppsHCzDpT2yto+oLLGOjAI5GYRJ55Duh9s1GENy10EEYRihJXt6\nN0/iKeazR3TWmejTmVGe0Cl0P2Dv4HlfKc1k0zhTIXhc3TrLEOVJ0D/ypILpM5Vp\nSXEOGAdyrHJ6l1jPo/DMPOwQ/hj+6XtIFVIaRbBbZQKBgHmRmkrjpidB+Ll+/en7\n5MjmKo1xd9gP2QdNIsthGpUoVM5KNHeb4nnJAs5My21mOREOgWjsUA4tB1WtTuhQ\nw3Q1fT8gr5nWeM7vpH6Pmibs6CpUoy+iyKKmq94qPPcg1WLpaYZwwT9ZFo8csSFU\nngHuIjrYiHAZ9Y8tyTJLIjJq\n-----END PRIVATE KEY-----\n"
};

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const activeWorkers = new Map();

// Serve static files from the dist directory
app.use('/workers', express.static(path.join(__dirname, '../dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Handle /workers route for the React app
app.get('/workers/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Root redirect to /workers
app.get('/', (req, res) => {
  res.redirect('/workers');
});

async function startWorker(workerId) {
  try {
    const workerDoc = await db.collection('workers').doc(workerId).get();
    if (!workerDoc.exists) {
      console.error(`Worker ${workerId} not found`);
      return;
    }

    const workerData = workerDoc.data();
    if (workerData.status !== 'running') return;

    if (activeWorkers.has(workerId)) {
      activeWorkers.get(workerId).terminate();
      activeWorkers.delete(workerId);
    }

    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      const admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: 'hroom-mpv-2f31e',
            clientEmail: 'firebase-adminsdk-kunoo@hroom-mpv-2f31e.iam.gserviceaccount.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCkJ2hnWdMmdnxQ\\nsXpFl7OwrSYfPdu9Zs1S8qw16SvnAr20jL5zcM2fazDiZaHbmFvrob5ldio7DRud\\ncYVpKAWuMBuLhIesKstOhFNKlncs5jmVfmqf5vQhZv3Rfs9oDmhzGkbaTL/DZANN\\n54ptgK/XwdSmZq/EuKYlEP1CC+nBjPyB4Gz7HSVs8wX7VwFV14XfMST+Qod2IDsn\\nx7AlZRrdRFYmUTiscVo/PwBW4mD3jet3yP9uRUTGbuBYgOJBKHybZPvXCvs1jaiJ\\nmqdGw4UunKW2RM2N6pyctfvKQjjMBBppp6jVYn/DcbQS7M2d+BPtTvNVBRA/KeMC\\nY9FeT8HtAgMBAAECggEAJSmRwoIMoiLFUoxXWs10/ey5Gm4J4vdUyPBM6diLmp0d\\nfvQ1ApP5TRu6gaqSCdGUj8P6g2RMu7kkNRDX695GaPCVr9B1WZYHmFMvOw3U1Zqa\\nUzx/HYuu3agAEs8zW8KVRWefvjiNWkn4UIj4ZwFw7bbBMlnBdZb68B3IRA1H4ovw\\nWdNQtTArsvEnCuaJYxeyKLn0iHdUEZgA7bYQamI3foVV4YFZx5f/wGgSjaQdz7TY\\n4qS6aYuOO21bswPsBxw66Pkk28VbEKz5EJe9RRmlf7Cf/Bcm9adJpXV3fWWG+KPP\\nNpRJuW+qu7BnLaEcLQl5wu6zoyQ549xI81C1yO1y8QKBgQDTn9sLCq/vBF5XhWlE\\neS+ARdnA1rTZy2O9HnSgHBwlvret0j8Q9X5l3Q9rdEG2q2vCgk4PWp7F0gzgLsnY\\nQ4PyHS+JGpiD3SgWUktFb86QgJehMPaiJg+jAGxLFI1bZiIaxSPgDu/59qaEa+6M\\nJxS18po/e0dHbwX1Y4SQfJTksQKBgQDGk02oFksprnE7g9AUvJQxMZaf03mRViLv\\nmf1/++tMUbmK2PyRt+SqkhQhZKmwq/HWWnbaEpb700zXFir8+voO2kt8Kso72fW0\\n1gLkKTgKFRmRqsRHnIdpLqJEUvEUshPz6Vn1ZC5JeOZzUcS6edlXaC6DciXhR0MW\\ntL5flFFv/QKBgQCnTH68EezYBhoXEq8PpMY6n/3vh01dyH7G6abFVLOj20wWLFoT\\nLCCKouInzraMlKQSFzViyf8u4EmxiQuk3msXIp+LwezEgjfIvbIn6KXicuZsVesE\\ncRZ3hEQYbtz5XpqjkyozXVu1vpoRocnqHpMu6+WpPeoxvMF3Jv+LwhFrYQKBgQCG\\nT0WcJhAKjjGKRppsHCzDpT2yto+oLLGOjAI5GYRJ55Duh9s1GENy10EEYRihJXt6\\nN0/iKeazR3TWmejTmVGe0Cl0P2Dv4HlfKc1k0zhTIXhc3TrLEOVJ0D/ypILpM5Vp\\nSXEOGAdyrHJ6l1jPo/DMPOwQ/hj+6XtIFVIaRbBbZQKBgHmRmkrjpidB+Ll+/en7\\n5MjmKo1xd9gP2QdNIsthGpUoVM5KNHeb4nnJAs5My21mOREOgWjsUA4tB1WtTuhQ\\nw3Q1fT8gr5nWeM7vpH6Pmibs6CpUoy+iyKKmq94qPPcg1WLpaYZwwT9ZFo8csSFU\\nngHuIjrYiHAZ9Y8tyTJLIjJq\\n-----END PRIVATE KEY-----\\n'
          })
        });
      }
      
      async function runWorkerCode() {
        ${workerData.code}
      }
      
      runWorkerCode().catch(error => {
        console.error('Worker error:', error);
        parentPort.postMessage({ type: 'error', error: error.message });
      });
    `, { eval: true });

    worker.on('message', (message) => {
      console.log(`Worker ${workerId} message:`, message);
    });

    worker.on('error', async (error) => {
      console.error(`Worker ${workerId} error:`, error);
      await db.collection('workers').doc(workerId).update({
        status: 'stopped',
        error: error.message,
        updatedAt: new Date()
      });
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${workerId} stopped with exit code ${code}`);
      }
      activeWorkers.delete(workerId);
    });

    activeWorkers.set(workerId, worker);
  } catch (error) {
    console.error(`Error starting worker ${workerId}:`, error);
  }
}

// Watch for worker changes
db.collection('workers').onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const worker = { id: change.doc.id, ...change.doc.data() };
    
    if (change.type === 'added' || change.type === 'modified') {
      if (worker.status === 'running') {
        startWorker(worker.id);
      } else if (worker.status === 'stopped' && activeWorkers.has(worker.id)) {
        activeWorkers.get(worker.id).terminate();
        activeWorkers.delete(worker.id);
      }
    } else if (change.type === 'removed' && activeWorkers.has(worker.id)) {
      activeWorkers.get(worker.id).terminate();
      activeWorkers.delete(worker.id);
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  for (const [workerId, worker] of activeWorkers) {
    worker.terminate();
    await db.collection('workers').doc(workerId).update({
      status: 'stopped',
      updatedAt: new Date()
    });
  }
  process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Worker manager server running on port ${PORT}`);
});