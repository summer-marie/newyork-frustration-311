/**
 * NYC 311 Frustration Analysis - Main Entry Point
 * 
 * This file orchestrates the entire data visualization application:
 * - Imports static JSON data from src/data/ (exported from SQLite DB)
 * - Initializes all Chart.js visualizations
 * - Fetches live complaint data from NYC Open Data API
 * - Calculates and displays aggregate statistics
 * 
 * @author NYC 311 Analysis Team
 */

// Import chart initialization functions
import { initNoiseByBoroughChart, initRodentByBoroughChart, initNoiseByHourChart } from './modules/charts.js'
import { initZipOverlapTable } from './modules/table.js'
import { initFilters } from './modules/filters.js'
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
    container.innerHTML = '<p class="text-gray-500">No recent complaints</p>'
    return
  }
  
  // Build HTML for each complaint item
  const html = data.map(item => {
    const date = new Date(item.created_date)
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    
    return `
      <div class="mb-3 pb-3 border-b border-gray-700 last:border-0">
        <div class="font-semibold text-gray-200">${formatBorough(item.borough || 'Unknown')}</div>
        <div class="text-gray-400 text-xs">${item.descriptor || 'No description'}</div>
        <div class="text-gray-500 text-xs mt-1">${formattedDate}</div>
      </div>
    `
  }).join('')
  
  container.innerHTML = html
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
  const [noiseByBorough, rodentByBorough, noiseByHour, zipOverlap] = await Promise.all([
    fetch('/api/noise/by-borough').then(r => r.json()),
    fetch('/api/rodent/by-borough').then(r => r.json()),
    fetch('/api/noise/by-hour').then(r => r.json()),
    fetch('/api/overlap/zip').then(r => r.json())
  ])
  
  // Calculate aggregate statistics by summing counts across all boroughs
  const totalNoise = noiseByBorough.reduce((sum, row) => sum + row.noise_count, 0)
  const totalRodent = rodentByBorough.reduce((sum, row) => sum + row.rodent_count, 0)
  const totalOverlap = zipOverlap.length // Number of ZIPs in both top-20 lists
  
  // Update stat bar cards with formatted numbers
  document.getElementById('stat-noise').textContent = formatNumber(totalNoise)
  document.getElementById('stat-rodent').textContent = formatNumber(totalRodent)
  document.getElementById('stat-overlap').textContent = totalOverlap
  
  // Initialize all visualizations with static data
  // These render synchronously, so charts appear immediately on page load
  initNoiseByBoroughChart(noiseByBorough)
  initRodentByBoroughChart(rodentByBorough)
  initNoiseByHourChart(noiseByHour)
  initZipOverlapTable(zipOverlap)
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
    document.getElementById('live-rodent').innerHTML = '<p class="text-red-500">Unable to load live data</p>'
    document.getElementById('live-noise').innerHTML = '<p class="text-red-500">Unable to load live data</p>'
  })
})
