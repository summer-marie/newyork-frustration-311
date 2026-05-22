/**
 * ZIP complaint data helpers shared by the map and detail panel.
 *
 * The current source is the app's SQLite-backed API. If static src/data JSON
 * files are restored later, normalizeZipRows can accept those rows too as long
 * as they include ZIP, complaint counts, and optional coordinates.
 */

function toNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

export function normalizeZipRow(row) {
  const noiseCount = toNumber(row.noise_count ?? row.noise_total)
  const rodentCount = toNumber(row.rodent_count ?? row.rodent_total)
  const totalComplaints = toNumber(row.total_complaints ?? row.total ?? noiseCount + rodentCount)

  return {
    incident_zip: String(row.incident_zip || row.zip || '').trim(),
    borough: row.borough || 'Unknown',
    total_complaints: totalComplaints,
    noise_count: noiseCount,
    rodent_count: rodentCount,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    top_complaint_type: row.top_complaint_type || 'Noise / Rodent'
  }
}

export function normalizeZipRows(rows) {
  if (!Array.isArray(rows)) return []
  return rows
    .map(normalizeZipRow)
    .filter(row => row.incident_zip && row.total_complaints > 0)
}

export function buildZipLookup(rows) {
  return new Map(normalizeZipRows(rows).map(row => [row.incident_zip, row]))
}

export function getZipComplaintBreakdown(row) {
  const total = row?.total_complaints || 0
  const noise = row?.noise_count || row?.noise_total || 0
  const rodents = row?.rodent_count || row?.rodent_total || 0

  return {
    total,
    noise,
    rodents,
    noisePercent: total ? Math.round((noise / total) * 100) : 0,
    rodentPercent: total ? Math.round((rodents / total) * 100) : 0
  }
}
