import express from 'express';
import { workerService } from '../services/workerService.js';

const router = express.Router();

// Get status of all workers
router.get('/status', (req, res) => {
  try {
    const status = workerService.getAllWorkersStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get status of specific worker
router.get('/:id/status', (req, res) => {
  try {
    const status = workerService.getWorkerStatus(req.params.id);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start a worker
router.post('/:id/start', async (req, res) => {
  try {
    await workerService.startWorker(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop a worker
router.post('/:id/stop', (req, res) => {
  try {
    workerService.stopWorker(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;