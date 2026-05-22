/**
 * API Routes Module
 * 
 * Express router defining all REST API endpoints for NYC 311 data.
 * Each endpoint calls a corresponding database query function and returns JSON.
 */

const express = require('express');
const router = express.Router();

// Import query functions
const { 
  getNoiseByBorough, 
  getNoiseByHour, 
  getNoiseByZip, 
  getNoiseByType,
  getComplaintTrend
} = require('../queries/noiseQueries.cjs');

const { 
  getRodentByBorough, 
  getRodentByZip 
} = require('../queries/rodentQueries.cjs');

const { 
  getZipOverlap 
} = require('../queries/overlapQueries.cjs');

// === Noise Endpoints ===

/**
 * GET /api/noise/by-borough
 * Returns noise complaint counts aggregated by NYC borough
 */
router.get('/noise/by-borough', (req, res, next) => {
  try {
    const data = getNoiseByBorough();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/noise/by-hour
 * Returns noise complaint counts by hour of day (0-23)
 */
router.get('/noise/by-hour', (req, res, next) => {
  try {
    const data = getNoiseByHour();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/noise/by-zip
 * Returns top 20 ZIP codes by noise complaint volume
 */
router.get('/noise/by-zip', (req, res, next) => {
  try {
    const data = getNoiseByZip();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/noise/by-type
 * Returns noise complaints broken down by specific complaint type
 */
router.get('/noise/by-type', (req, res, next) => {
  try {
    const data = getNoiseByType();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/complaints/trend
 * Returns monthly noise and rodent complaint counts
 */
router.get('/complaints/trend', (req, res, next) => {
  try {
    const data = getComplaintTrend();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// === Rodent Endpoints ===

/**
 * GET /api/rodent/by-borough
 * Returns rodent complaint counts aggregated by NYC borough
 */
router.get('/rodent/by-borough', (req, res, next) => {
  try {
    const data = getRodentByBorough();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/rodent/by-zip
 * Returns top 20 ZIP codes by rodent complaint volume
 */
router.get('/rodent/by-zip', (req, res, next) => {
  try {
    const data = getRodentByZip();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// === Overlap Endpoints ===

/**
 * GET /api/overlap/zip
 * Returns ZIP codes appearing in both top-20 noise and top-20 rodent lists
 */
router.get('/overlap/zip', (req, res, next) => {
  try {
    const data = getZipOverlap();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// === Error Handler ===

/**
 * Centralized error handler for all API routes
 * Returns JSON error response with 500 status
 */
router.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    endpoint: req.path
  });
});

module.exports = router;
