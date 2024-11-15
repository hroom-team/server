import { Worker } from 'worker_threads';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore();

class WorkerService {
  constructor() {
    this.workers = new Map();
    this.initialize();
  }

  async initialize() {
    console.log('[WorkerService] Initializing worker service...');
    
    try {
      // Subscribe to workers collection changes
      const unsubscribe = db.collection('workers').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const worker = { id: change.doc.id, ...change.doc.data() };
          
          if (change.type === 'removed') {
            this.stopWorker(worker.id);
          } else if (worker.status === 'running') {
            this.startWorker(worker);
          } else {
            this.stopWorker(worker.id);
          }
        });
      });

      process.on('SIGINT', () => {
        unsubscribe();
        this.stopAllWorkers();
        process.exit(0);
      });

    } catch (error) {
      console.error('[WorkerService] Initialization error:', error);
    }
  }

  async startWorker(workerData) {
    console.log(`[WorkerService] Starting worker: ${workerData.name} (${workerData.id})`);

    // Stop existing worker if any
    this.stopWorker(workerData.id);

    try {
      const worker = new Worker(
        `data:text/javascript,${encodeURIComponent(workerData.code)}`,
        {
          eval: true,
          env: {
            WORKER_ID: workerData.id,
            INTERVAL: workerData.interval.toString(),
            FIREBASE_CONFIG: JSON.stringify(process.env.FIREBASE_CONFIG)
          }
        }
      );

      worker.on('message', (message) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Worker ${workerData.name} message:`, message);
        
        // Update worker status in Firestore
        db.collection('workers').doc(workerData.id).update({
          lastRun: timestamp,
          lastMessage: message,
          updatedAt: timestamp
        });
      });

      worker.on('error', async (error) => {
        console.error(`[WorkerService] Worker ${workerData.name} error:`, error);
        
        await db.collection('workers').doc(workerData.id).update({
          status: 'stopped',
          lastError: error.message,
          updatedAt: new Date().toISOString()
        });

        this.stopWorker(workerData.id);
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`[WorkerService] Worker ${workerData.name} exited with code ${code}`);
        }
        this.workers.delete(workerData.id);
      });

      this.workers.set(workerData.id, worker);

    } catch (error) {
      console.error(`[WorkerService] Error starting worker ${workerData.id}:`, error);
      throw error;
    }
  }

  stopWorker(workerId) {
    const worker = this.workers.get(workerId);
    if (worker) {
      console.log(`[WorkerService] Stopping worker: ${workerId}`);
      worker.terminate();
      this.workers.delete(workerId);
    }
  }

  stopAllWorkers() {
    console.log('[WorkerService] Stopping all workers...');
    for (const [workerId] of this.workers) {
      this.stopWorker(workerId);
    }
  }

  getWorkerStatus(workerId) {
    return {
      isRunning: this.workers.has(workerId),
      timestamp: new Date().toISOString()
    };
  }

  getAllWorkersStatus() {
    return {
      totalWorkers: this.workers.size,
      workers: Array.from(this.workers.keys()).map(id => ({
        id,
        isRunning: true,
        timestamp: new Date().toISOString()
      }))
    };
  }
}

export const workerService = new WorkerService();