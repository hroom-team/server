import { Worker } from 'worker_threads';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, onSnapshot } from 'firebase/firestore';

console.log('[Worker Runner] Starting worker monitoring system...');

async function runWorker(workerId) {
  console.log(`[Worker Runner] Attempting to run worker: ${workerId}`);
  
  try {
    const workerDoc = await getDoc(doc(db, 'workers', workerId));
    if (!workerDoc.exists()) {
      console.error(`[${new Date().toISOString()}] Worker ${workerId} not found`);
      return;
    }

    const workerData = workerDoc.data();
    console.log(`[Worker Runner] Worker data:`, workerData);

    if (workerData.status !== 'running') {
      console.log(`[${new Date().toISOString()}] Worker ${workerId} is not running`);
      return;
    }

    console.log(`[${new Date().toISOString()}] Starting worker: ${workerData.name} (${workerId})`);

    // Create a new worker thread with the worker's code
    const worker = new Worker(
      `data:text/javascript,${encodeURIComponent(workerData.code)}`,
      { 
        eval: true,
        env: { 
          INTERVAL: workerData.interval.toString(),
          FIREBASE_CONFIG: JSON.stringify({
            apiKey: "AIzaSyBrshtX9K8EYYyewiPVcT7TZ05K-whJxNY",
            authDomain: "hroom-mpv-2f31e.firebaseapp.com",
            projectId: "hroom-mpv-2f31e",
            storageBucket: "hroom-mpv-2f31e.firebasestorage.app",
            messagingSenderId: "356587190634",
            appId: "1:356587190634:web:f7759be737658700830d13"
          })
        }
      }
    );

    worker.on('message', (message) => {
      const timestamp = new Date().toISOString();
      if (message.type === 'start') {
        console.log(`[${timestamp}] Worker ${workerData.name} started execution`);
      } else if (message.type === 'complete') {
        console.log(`[${timestamp}] Worker ${workerData.name} completed successfully`);
        console.log(`[${timestamp}] Results:`, message.results);
      } else {
        console.log(`[${timestamp}] Worker ${workerData.name} message:`, message);
      }
    });

    worker.on('error', (error) => {
      console.error(`[${new Date().toISOString()}] Worker ${workerData.name} error:`, error);
      updateDoc(doc(db, 'workers', workerId), {
        status: 'stopped',
        lastError: error.message,
        updatedAt: new Date()
      });
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[${new Date().toISOString()}] Worker ${workerData.name} stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error running worker ${workerId}:`, error);
  }
}

// Monitor workers collection for changes
console.log('[Worker Runner] Setting up Firestore listener...');

const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
  console.log('[Worker Runner] Received Firestore update');
  
  snapshot.docChanges().forEach((change) => {
    const worker = { id: change.doc.id, ...change.doc.data() };
    console.log(`[Worker Runner] Worker change: ${change.type}`, worker);
    
    if (change.type === 'added' || change.type === 'modified') {
      if (worker.status === 'running') {
        runWorker(worker.id);
      }
    }
  });
}, (error) => {
  console.error('[Worker Runner] Firestore listener error:', error);
});

process.on('SIGINT', () => {
  console.log('[Worker Runner] Shutting down...');
  unsubscribe();
  process.exit(0);
});