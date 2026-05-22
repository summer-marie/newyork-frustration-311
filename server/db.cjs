/**
 * Database Connection Module
 * 
 * Establishes connection to NYC 311 SQLite database using better-sqlite3.
 * Exports a shared database instance for use across all query modules.
 * 
 * Connection is persistent and synchronous (better-sqlite3 design).
 */

const Database = require('better-sqlite3');
const path = require('path');

// Connect to SQLite database in project root
// Using readonly mode for safety - we only query, never write
const dbPath = path.join(__dirname, '..', 'nyc_311_2023.db');
const db = new Database(dbPath, { readonly: true });

console.log('✓ Connected to NYC 311 database');

module.exports = db;
