/**
 * ZIP-level complaint queries for map exploration.
 */

const db = require('../db.cjs');

/**
 * Get ZIP-level complaint totals with centroid coordinates for map markers.
 *
 * @returns {Array} Array of ZIP summary rows
 */
function getComplaintsByZip() {
  const query = db.prepare(`
    WITH zip_counts AS (
      SELECT
        incident_zip,
        MAX(borough) as borough,
        COUNT(*) as total_complaints,
        SUM(CASE WHEN complaint_type LIKE '%Noise%' THEN 1 ELSE 0 END) as noise_count,
        SUM(CASE WHEN complaint_type LIKE '%Rodent%' THEN 1 ELSE 0 END) as rodent_count,
        AVG(latitude) as latitude,
        AVG(longitude) as longitude
      FROM service_requests
      WHERE incident_zip != ''
        AND latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND (complaint_type LIKE '%Noise%' OR complaint_type LIKE '%Rodent%')
      GROUP BY incident_zip
    )
    SELECT
      z.*,
      (
        SELECT complaint_type
        FROM service_requests s
        WHERE s.incident_zip = z.incident_zip
          AND (s.complaint_type LIKE '%Noise%' OR s.complaint_type LIKE '%Rodent%')
        GROUP BY complaint_type
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) as top_complaint_type
    FROM zip_counts z
    WHERE latitude BETWEEN 40.45 AND 40.95
      AND longitude BETWEEN -74.3 AND -73.65
    ORDER BY total_complaints DESC
    LIMIT 100
  `);

  return query.all();
}

module.exports = {
  getComplaintsByZip
};
