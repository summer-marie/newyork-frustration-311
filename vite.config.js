/**
 * Vite Configuration
 * 
 * Enables JSON file imports as JavaScript modules.
 * Without this config, importing .json files would fail.
 * 
 * Also configures proxy to forward /api requests to Express backend.
 */

import { defineConfig } from 'vite'

export default defineConfig({
  // Include JSON files as importable assets
  assetsInclude: ['**/*.json'],
  
  // Parse JSON and export as JS objects (not stringified)
  // This allows: import data from './data.json'
  // Instead of: import dataString from './data.json?raw'
  json: {
    stringify: false  // Export as parsed objects, not strings
  },
  
  // Development server configuration
  server: {
    // Proxy API requests to Express backend
    // When frontend calls fetch('/api/...'), it forwards to port 3001
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
