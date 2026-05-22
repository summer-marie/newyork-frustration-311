/**
 * Express Server Entry Point
 * 
 * Starts the API server on port 3001 to serve NYC 311 data endpoints.
 * Designed to run alongside Vite dev server (port 5173).
 * Vite proxies /api requests to this server.
 */

const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api.cjs');

const app = express();
const PORT = 3001;

// === Middleware ===

// Enable CORS for all origins (dev-friendly)
// In production, restrict to specific origins
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// === Routes ===

// Mount API router at /api
app.use('/api', apiRouter);

// Root endpoint for server health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'NYC 311 API Server',
    version: '1.0.0',
    endpoints: [
      'GET /api/noise/by-borough',
      'GET /api/noise/by-hour',
      'GET /api/noise/by-zip',
      'GET /api/noise/by-type',
      'GET /api/complaints/trend',
      'GET /api/rodent/by-borough',
      'GET /api/rodent/by-zip',
      'GET /api/overlap/zip'
    ]
  });
});

// === Start Server ===

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`\nTest endpoints:`);
  console.log(`  curl http://localhost:${PORT}/api/noise/by-borough`);
  console.log(`  curl http://localhost:${PORT}/api/overlap/zip\n`);
});
