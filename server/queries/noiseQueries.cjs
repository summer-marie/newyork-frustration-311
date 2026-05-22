/**
 * Noise Complaint Query Functions
 * 
 * All database queries related to noise complaints.
 * Each function returns raw data for API endpoints to serialize as JSON.
 */

const db = require('../db.cjs');

/**
 * Get noise complaint counts by NYC borough
 * @returns {Array} Array of {borough, noise_count} objects, sorted descending
 */
function getNoiseByBorough() {
  const query = db.prepare(`
    SELECT borough, COUNT(*) as noise_count
    FROM service_requests
    WHERE complaint_type LIKE '%Noise%'
    GROUP BY borough 
    ORDER BY noise_count DESC
  `);
  
  return query.all();
}

/**
 * Get noise complaint counts by hour of day (0-23)
 * @returns {Array} Array of {created_hour, total} objects, sorted by hour
 */
function getNoiseByHour() {
  const query = db.prepare(`
    SELECT created_hour, COUNT(*) as total
    FROM service_requests
    WHERE complaint_type LIKE '%Noise%'
    GROUP BY created_hour 
    ORDER BY created_hour
  `);
  
  return query.all();
}

/**
 * Get top 20 ZIP codes by noise complaint volume
 * @returns {Array} Array of {incident_zip, borough, total} objects, top 20
 */
function getNoiseByZip() {
  const query = db.prepare(`
    SELECT incident_zip, borough, COUNT(*) as total
    FROM service_requests
    WHERE complaint_type LIKE '%Noise%' AND incident_zip != ''
    GROUP BY incident_zip 
    ORDER BY total DESC 
    LIMIT 20
  `);
  
  return query.all();
}

/**
 * Get noise complaints broken down by specific complaint type
 * @returns {Array} Array of {complaint_type, total} objects, sorted descending
 */
function getNoiseByType() {
  const query = db.prepare(`
    SELECT complaint_type, COUNT(*) as total
    FROM service_requests
    WHERE complaint_type LIKE '%Noise%'
    GROUP BY complaint_type 
    ORDER BY total DESC
  `);
  
  return query.all();
}

/**
 * Get monthly complaint counts for noise and rodent categories.
 * @returns {Array} Array of {created_month, noise_total, rodent_total} objects
 */
function getComplaintTrend() {
  const query = db.prepare(`
    SELECT
      created_month,
      SUM(CASE WHEN complaint_type LIKE '%Noise%' THEN 1 ELSE 0 END) as noise_total,
      SUM(CASE WHEN complaint_type LIKE '%Rodent%' THEN 1 ELSE 0 END) as rodent_total
    FROM service_requests
    WHERE created_month IS NOT NULL
      AND (complaint_type LIKE '%Noise%' OR complaint_type LIKE '%Rodent%')
    GROUP BY created_month
    ORDER BY created_month
  `);

  return query.all();
}

module.exports = {
  getNoiseByBorough,
  getNoiseByHour,
  getNoiseByZip,
  getNoiseByType,
  getComplaintTrend
};
