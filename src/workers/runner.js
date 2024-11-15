import { Worker } from 'worker_threads';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

async function runWorker(workerId) {
  try {
    const workerDoc = await getDoc(doc(db, 'workers', workerId));
    if (!workerDoc.exists()) {
      console.error(`[${new Date().toISOString()}] Worker ${workerId} not found`);
      return;
    }

    const workerData = workerDoc.data();
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
        env: { INTERVAL: workerData.interval.toString() }
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
const unsubscribe = onSnapshot(collection(db, 'workers'), (snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const worker = { id: change.doc.id, ...change.doc.data() };
    
    if (change.type === 'added' || change.type === 'modified') {
      if (worker.status === 'running') {
        runWorker(worker.id);
      }
    }
  });
});

process.on('SIGINT', () => {
  unsubscribe();
  process.exit(0);
});