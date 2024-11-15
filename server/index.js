import express from 'express';
import cors from 'cors';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Worker } from 'worker_threads';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

const activeWorkers = new Map();

async function startWorker(workerId) {
  try {
    const workerDoc = await db.collection('workers').doc(workerId).get();
    if (!workerDoc.exists) {
      console.error(`Worker ${workerId} not found`);
      return;
    }

    const workerData = workerDoc.data();
    if (workerData.status !== 'running') return;

    // Stop existing worker if any
    if (activeWorkers.has(workerId)) {
      activeWorkers.get(workerId).terminate();
      activeWorkers.delete(workerId);
    }

    // Create worker with the provided code
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      const firebase = require('firebase-admin');
      
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