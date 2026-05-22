/**
 * Vite Configuration
 * 
 * Enables JSON file imports as JavaScript modules.
 * Without this config, importing .json files would fail.
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
  }
})
