import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Enable JSON parsing
app.use(express.json());

// Serve static files from the dist directory
app.use('/workers', express.static(path.join(__dirname, '../dist'), {
  maxAge: '1h'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle /workers route for the React app
app.get('/workers/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Root redirect to /workers
app.get('/', (req, res) => {
  res.redirect('/workers');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 3103;

// Create HTTP server with explicit port
const server = app.listen(PORT, '0.0.0.0', () => {
  const addr = server.address();
  console.log(`Server running on http://${addr.address}:${addr.port}`);
  // Write port to stdout for detection
  process.stdout.write(`PORT=${addr.port}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});