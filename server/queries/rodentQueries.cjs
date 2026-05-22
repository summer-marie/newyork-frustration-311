/**
 * Rodent Complaint Query Functions
 * 
 * All database queries related to rodent complaints.
 */

const db = require('../db.cjs');

/**
 * Get rodent complaint counts by NYC borough
 * @returns {Array} Array of {borough, rodent_count} objects, sorted descending
 */
function getRodentByBorough() {
  const query = db.prepare(`
    SELECT borough, COUNT(*) as rodent_count
    FROM service_requests
    WHERE complaint_type LIKE '%Rodent%'
    GROUP BY borough 
    ORDER BY rodent_count DESC
  `);
  
  return query.all();
}

/**
 * Get top 20 ZIP codes by rodent complaint volume
 * @returns {Array} Array of {incident_zip, borough, total} objects, top 20
 */
function getRodentByZip() {
  const query = db.prepare(`
    SELECT incident_zip, borough, COUNT(*) as total
    FROM service_requests
    WHERE complaint_type LIKE '%Rodent%' AND incident_zip != ''
    GROUP BY incident_zip 
    ORDER BY total DESC 
    LIMIT 20
  `);
  
  return query.all();
}

module.exports = {
  getRodentByBorough,
  getRodentByZip
};
