/**
 * NYC 311 Frustration Analysis - Main Entry Point
 * 
 * This file orchestrates the entire data visualization application:
 * - Fetches data from Express API server (port 3001) backed by SQLite DB
 * - Initializes all Chart.js visualizations
 * - Fetches live complaint data from NYC Open Data API
 * - Calculates and displays aggregate statistics
 * 
 * @author NYC 311 Analysis Team
 */

// Import chart initialization functions
import {
  initBoroughComparisonChart,
  initComplaintTrendChart,
  initNoiseByBoroughChart,
  initNoiseByHourChart,
  initRodentByBoroughChart
} from './modules/charts.js'
import { initZipOverlapTable } from './modules/table.js'
import { initFilters } from './modules/filters.js'
import { initZipMap } from './modules/map.js'
import { getZipComplaintBreakdown, normalizeZipRows } from './modules/zipData.js'
import { formatNumber, formatBorough } from './modules/utils.js'

// NYC Open Data Socrata API endpoint
const BASE = 'https://data.cityofnewyork.us/resource/fhrw-4uyv.json'

/**
 * Fetch the most recent complaints of a specific type from NYC Open Data API
 * 
 * @param {string} type - Complaint type to filter (e.g., 'Rodent', 'Noise - Residential')
 * @param {number} limit - Maximum number of records to return (default: 5)
 * @returns {Promise<Array>} Array of complaint objects with borough, descriptor, created_date
 * 
 * NOTE: API uses SoQL (Socrata Query Language) for filtering and ordering
 * TODO: Add error retry logic for failed API calls
 */
async function fetchLiveComplaints(type, limit = 5) {
  // Build SoQL query: filter by type, sort by date DESC, limit results
  const url = `${BASE}?$where=complaint_type='${encodeURIComponent(type)}'&$order=created_date DESC&$limit=${limit}&$select=complaint_type,borough,descriptor,created_date`
  const res = await fetch(url)
  return res.json()
}

/**
 * Render live complaint data into a feed container
 * 
 * @param {string} containerId - DOM element ID to render into
 * @param {Array} data - Array of complaint objects from API
 * 
 * Each complaint displays: Borough, Description, and formatted timestamp
 * TODO: Add relative time formatting (e.g., "2 hours ago")
 * TODO: Add click handlers to show full complaint details in modal
 */
function renderLiveFeed(containerId, data) {
  const container = document.getElementById(containerId)
  if (!container) return
  
  // Handle empty data gracefully
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-slate-500">No recent complaints</p>'
    return
  }
  
  // Build HTML for each complaint item
  const html = data.map(item => {
    const date = new Date(item.created_date)
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    const isRodent = item.complaint_type === 'Rodent'
    
    return `
      <div class="mb-3 border-b border-slate-700/70 pb-3 last:mb-0 last:border-0 last:pb-0">
        <div class="flex items-start gap-3">
          <span class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isRodent ? 'bg-purple-400' : 'bg-red-400'}"></span>
          <div>
            <div class="font-semibold text-slate-100">${formatBorough(item.borough || 'Unknown')}</div>
            <div class="text-xs leading-5 text-slate-300">${item.descriptor || 'No description'}</div>
            <div class="mt-1 text-xs text-slate-500">${formattedDate}</div>
          </div>
        </div>
      </div>
    `
  }).join('')
  
  container.innerHTML = html
}

function setText(id, value) {
  const element = document.getElementById(id)
  if (element) {
    element.textContent = value
    element.classList.remove('loading-pulse')
  }
}

function updateZipPanelFromRow(row) {
  if (!row) return

  const zip = row.incident_zip
  const { total, noise, rodents, noisePercent, rodentPercent } = getZipComplaintBreakdown(row)

  setText('map-focus-zip', zip ? `ZIP ${zip}` : 'ZIP')
  setText('map-focus-total', `${formatNumber(total)} complaints`)
  setText('zip-panel-title', zip ? `ZIP Code ${zip}` : 'ZIP Code Detail')
  setText('zip-panel-total', formatNumber(total))
  setText('zip-panel-noise', formatNumber(noise))
  setText('zip-panel-rodent', formatNumber(rodents))
  setText('zip-panel-top-type', row.top_complaint_type || 'Noise / Rodent')
  setText('zip-panel-borough', formatBorough(row.borough || 'Unknown'))
  setText('zip-bar-noise', `${noisePercent}%`)
  setText('zip-bar-rodent', `${rodentPercent}%`)

  const noiseFill = document.getElementById('zip-bar-noise-fill')
  const rodentFill = document.getElementById('zip-bar-rodent-fill')
  if (noiseFill) noiseFill.style.width = `${Math.max(noisePercent, 4)}%`
  if (rodentFill) rodentFill.style.width = `${Math.max(rodentPercent, 4)}%`
}

function updateZipDetailPanel(zipOverlap, noiseByZip, rodentByZip) {
  const selected = zipOverlap[0] || null
  const fallback = noiseByZip[0] || rodentByZip[0]
  if (!selected && !fallback) return

  const zip = selected?.incident_zip || fallback.incident_zip
  const noiseMatch = noiseByZip.find(row => row.incident_zip === zip)
  const rodentMatch = rodentByZip.find(row => row.incident_zip === zip)
  const noiseTotal = selected?.noise_total || noiseMatch?.total || 0
  const rodentTotal = selected?.rodent_total || rodentMatch?.total || 0
  const borough = selected?.borough || noiseMatch?.borough || rodentMatch?.borough || 'Unknown'
  updateZipPanelFromRow({
    incident_zip: zip,
    borough,
    total_complaints: noiseTotal + rodentTotal,
    noise_count: noiseTotal,
    rodent_count: rodentTotal,
    top_complaint_type: 'Noise / Rodent'
  })
}

/**
 * Application initialization - runs when DOM is fully loaded
 * 
 * Execution order:
 * 1. Calculate aggregate statistics from imported data
 * 2. Populate stat bar with totals
 * 3. Initialize all charts and tables
 * 4. Fetch and render live API data asynchronously
 */
document.addEventListener('DOMContentLoaded', async () => {
  console.log('NYC 311 Frustration Analysis initialized')
  
  // Fetch static data from backend API
  const [
    noiseByBorough,
    rodentByBorough,
    noiseByHour,
    zipOverlap,
    noiseByZip,
    rodentByZip,
    complaintTrend,
    zipMapRows
  ] = await Promise.all([
    fetch('/api/noise/by-borough').then(r => r.json()),
    fetch('/api/rodent/by-borough').then(r => r.json()),
    fetch('/api/noise/by-hour').then(r => r.json()),
    fetch('/api/overlap/zip').then(r => r.json()),
    fetch('/api/noise/by-zip').then(r => r.json()),
    fetch('/api/rodent/by-zip').then(r => r.json()),
    fetch('/api/complaints/trend').then(r => r.json()),
    fetch('/api/complaints/by-zip').then(r => r.json())
  ])
  
  // Calculate aggregate statistics by summing counts across all boroughs
  const totalNoise = noiseByBorough.reduce((sum, row) => sum + row.noise_count, 0)
  const totalRodent = rodentByBorough.reduce((sum, row) => sum + row.rodent_count, 0)
  const totalOverlap = zipOverlap.length // Number of ZIPs in both top-20 lists
  const normalizedZipRows = normalizeZipRows(zipMapRows)
  
  // Update stat bar cards with formatted numbers
  setText('stat-noise', formatNumber(totalNoise))
  setText('stat-rodent', formatNumber(totalRodent))
  setText('stat-overlap', totalOverlap)
  if (normalizedZipRows.length > 0) {
    updateZipPanelFromRow(normalizedZipRows[0])
  } else {
    updateZipDetailPanel(zipOverlap, noiseByZip, rodentByZip)
  }
  
  // Initialize all visualizations with static data
  // These render synchronously, so charts appear immediately on page load
  initNoiseByBoroughChart(noiseByBorough)
  initRodentByBoroughChart(rodentByBorough)
  initNoiseByHourChart(noiseByHour)
  initComplaintTrendChart(complaintTrend)
  initBoroughComparisonChart(noiseByBorough, rodentByBorough)
  initZipOverlapTable(zipOverlap)
  initZipMap(normalizedZipRows, updateZipPanelFromRow)
  initFilters() // Currently a stub - no active filtering yet
  
  // Fetch live data from NYC Open Data API (asynchronous)
  // These populate the "LIVE" feed cards after the initial page renders
  // TODO: Add auto-refresh every 60 seconds to keep data current
  Promise.all([
    fetchLiveComplaints('Rodent'),
    fetchLiveComplaints('Noise - Residential')
  ]).then(([rodentData, noiseData]) => {
    renderLiveFeed('live-rodent', rodentData)
    renderLiveFeed('live-noise', noiseData)
  }).catch(error => {
    console.error('Error fetching live data:', error)
    document.getElementById('live-rodent').innerHTML = '<p class="text-red-400">Unable to load live data</p>'
    document.getElementById('live-noise').innerHTML = '<p class="text-red-400">Unable to load live data</p>'
  })
})
