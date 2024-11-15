import { Worker } from 'worker_threads';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function runWorker(workerId) {
  try {
    const workerDoc = await getDoc(doc(db, 'workers', workerId));
    if (!workerDoc.exists()) {
      console.error(`Worker ${workerId} not found`);
      return;
    }

    const workerData = workerDoc.data();
    if (workerData.status !== 'running') {
      console.log(`Worker ${workerId} is not running`);
      return;
    }

    // Create a new worker thread with the worker's code
    const worker = new Worker(
      `data:text/javascript,${encodeURIComponent(workerData.code)}`,
      { eval: true }
    );

    worker.on('message', (message) => {
      console.log(`Worker ${workerId} message:`, message);
    });

    worker.on('error', (error) => {
      console.error(`Worker ${workerId} error:`, error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        console.error(`Worker ${workerId} stopped with exit code ${code}`);
      }
    });
  } catch (error) {
    console.error(`Error running worker ${workerId}:`, error);
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