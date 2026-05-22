import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export function initNoiseByBoroughChart(data) {
  const ctx = document.getElementById('noise-borough-chart')
  if (!ctx) return
  
  // Chart implementation will go here
  console.log('Initializing Noise by Borough chart with data:', data)
}

export function initRodentByBoroughChart(data) {
  const ctx = document.getElementById('rodent-borough-chart')
  if (!ctx) return
  
  // Chart implementation will go here
  console.log('Initializing Rodent by Borough chart with data:', data)
}

export function initNoiseByHourChart(data) {
  const ctx = document.getElementById('noise-hour-chart')
  if (!ctx) return
  
  // Chart implementation will go here
  console.log('Initializing Noise by Hour chart with data:', data)
}
