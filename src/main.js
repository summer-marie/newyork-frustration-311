// Import modules
import { initNoiseByBoroughChart, initRodentByBoroughChart, initNoiseByHourChart } from './modules/charts.js'
import { initZipOverlapTable } from './modules/table.js'
import { initFilters } from './modules/filters.js'
import { formatNumber, formatBorough } from './modules/utils.js'

// Import data files
import noiseByBorough from './data/noise_by_borough.json'
import rodentByBorough from './data/rodent_by_borough.json'
import noiseByHour from './data/noise_by_hour.json'
import zipOverlap from './data/zip_overlap.json'
import complaintTrends from './data/complaint_trends.json'

// Console log data to confirm imports work
console.log('Noise by Borough:', noiseByBorough)
console.log('Rodent by Borough:', rodentByBorough)
console.log('Noise by Hour:', noiseByHour)
console.log('ZIP Overlap:', zipOverlap)
console.log('Complaint Trends:', complaintTrends)

// Live API fetch
const BASE = 'https://data.cityofnewyork.us/resource/fhrw-4uyv.json'

async function fetchLiveComplaints(type, limit = 5) {
  const url = `${BASE}?$where=complaint_type='${encodeURIComponent(type)}'&$order=created_date DESC&$limit=${limit}&$select=complaint_type,borough,descriptor,created_date`
  const res = await fetch(url)
  return res.json()
}

function renderLiveFeed(containerId, data) {
  const container = document.getElementById(containerId)
  if (!container) return
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No recent complaints</p>'
    return
  }
  
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('NYC 311 Frustration Analysis initialized')
  
  // Calculate totals for stat bar
  const totalNoise = noiseByBorough.reduce((sum, row) => sum + row.noise_count, 0)
  const totalRodent = rodentByBorough.reduce((sum, row) => sum + row.rodent_count, 0)
  const totalOverlap = zipOverlap.length
  
  // Update stat bar
  document.getElementById('stat-noise').textContent = formatNumber(totalNoise)
  document.getElementById('stat-rodent').textContent = formatNumber(totalRodent)
  document.getElementById('stat-overlap').textContent = totalOverlap
  
  // Initialize charts and table with data
  initNoiseByBoroughChart(noiseByBorough)
  initRodentByBoroughChart(rodentByBorough)
  initNoiseByHourChart(noiseByHour)
  initZipOverlapTable(zipOverlap)
  initFilters()
  
  // Fetch and render live data
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
