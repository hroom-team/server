import express from 'express';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Worker } from 'worker_threads';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin with credentials
initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
});

const db = getFirestore();
const activeWorkers = new Map();

// Serve static files from the dist directory
app.use('/workers', express.static(path.join(__dirname, '../dist')));

// API routes can go here if needed
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
            projectId: '${process.env.FIREBASE_PROJECT_ID}',
            clientEmail: '${process.env.FIREBASE_CLIENT_EMAIL}',
            privateKey: \`${process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')}\`
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