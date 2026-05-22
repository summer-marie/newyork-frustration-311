/**
 * ZIP Overlap Analysis Query
 * 
 * Finds ZIP codes that appear in both top-20 noise and top-20 rodent lists.
 * This reveals areas with overlapping urban quality-of-life issues.
 */

const db = require('../db.cjs');

/**
 * Get ZIP codes appearing in both top-20 noise and top-20 rodent complaint lists
 * 
 * Algorithm:
 * 1. Query top 20 noise ZIPs with counts
 * 2. Query top 20 rodent ZIPs with counts
 * 3. Find intersection using Set
 * 4. Merge data from both queries
 * 5. Sort by noise complaints descending
 * 
 * @returns {Array} Array of {incident_zip, borough, noise_total, rodent_total} objects
 */
function getZipOverlap() {
  // Query 1: Top 20 noise ZIPs
  const noiseQuery = db.prepare(`
    SELECT incident_zip, borough, COUNT(*) as noise_total
    FROM service_requests
    WHERE complaint_type LIKE '%Noise%' AND incident_zip != ''
    GROUP BY incident_zip 
    ORDER BY noise_total DESC 
    LIMIT 20
  `);
  const noiseZips = noiseQuery.all();
  
  // Query 2: Top 20 rodent ZIPs
  const rodentQuery = db.prepare(`
    SELECT incident_zip, borough, COUNT(*) as rodent_total
    FROM service_requests
    WHERE complaint_type LIKE '%Rodent%' AND incident_zip != ''
    GROUP BY incident_zip 
    ORDER BY rodent_total DESC 
    LIMIT 20
  `);
  const rodentZips = rodentQuery.all();
  
  // Create maps for fast lookup by ZIP code
  const noiseMap = new Map(noiseZips.map(row => [row.incident_zip, row]));
  const rodentMap = new Map(rodentZips.map(row => [row.incident_zip, row]));
  
  // Find ZIPs that exist in both top-20 lists
  const overlap = [];
  for (const [zip, noiseData] of noiseMap) {
    const rodentData = rodentMap.get(zip);
    if (rodentData) {
      overlap.push({
        incident_zip: zip,
        borough: noiseData.borough,
        noise_total: noiseData.noise_total,
        rodent_total: rodentData.rodent_total
      });
    }
  }
  
  // Sort by noise complaints descending
  overlap.sort((a, b) => b.noise_total - a.noise_total);
  
  return overlap;
}

module.exports = {
  getZipOverlap
};
