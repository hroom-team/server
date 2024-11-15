import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the dist directory
app.use('/workers', express.static(path.join(__dirname, '../dist')));

// Handle /workers route for the React app
app.get('/workers/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Root redirect to /workers
app.get('/', (req, res) => {
  res.redirect('/workers');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});