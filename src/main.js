// Import modules
import { initNoiseByBoroughChart, initRodentByBoroughChart, initNoiseByHourChart } from './modules/charts.js'
import { initZipOverlapTable } from './modules/table.js'
import { initFilters } from './modules/filters.js'
import { formatNumber, getTopN } from './modules/utils.js'

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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  console.log('NYC 311 Frustration Analysis initialized')
  
  // Initialize charts and table with data
  // initNoiseByBoroughChart(noiseByBorough)
  // initRodentByBoroughChart(rodentByBorough)
  // initNoiseByHourChart(noiseByHour)
  // initZipOverlapTable(zipOverlap)
  // initFilters()
})
