/**
 * Chart Visualization Module
 * 
 * Initializes all Chart.js visualizations with dark theme styling.
 * All charts use horizontal bars for easy borough name reading.
 * 
 * Color scheme:
 * - Noise complaints: Yellow (#facc15)
 * - Rodent complaints: Red (#ef4444)
 * - Dark background to match overall NYC gritty theme
 */

import { Chart, registerables } from 'chart.js'

// Register all Chart.js components (required for v3+)
Chart.register(...registerables)

// Shared styling constants for consistent dark theme across all charts
const chartDefaults = {
  backgroundColor: '#1a1a2e',  // Main page background color
  gridColor: 'rgba(255, 255, 255, 0.1)',  // Subtle grid lines
  textColor: 'rgba(255, 255, 255, 0.9)'   // High contrast white text
}

Chart.defaults.color = chartDefaults.textColor
Chart.defaults.font.family = 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const sharedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartDefaults.textColor,
        boxWidth: 10,
        boxHeight: 10
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: chartDefaults.gridColor
      },
      ticks: {
        color: chartDefaults.textColor
      }
    },
    y: {
      grid: {
        color: chartDefaults.gridColor
      },
      ticks: {
        color: chartDefaults.textColor
      }
    }
  }
}

/**
 * Initialize line chart showing monthly complaint trend for noise and rodents.
 *
 * @param {Array} data - Array of {created_month, noise_total, rodent_total}
 */
export function initComplaintTrendChart(data) {
  const ctx = document.getElementById('complaints-trend-chart')
  if (!ctx) return

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const labels = data.map(row => monthNames[Number(row.created_month) - 1] || row.created_month)
  const noiseValues = data.map(row => row.noise_total)
  const rodentValues = data.map(row => row.rodent_total)

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Noise',
          data: noiseValues,
          borderColor: '#ff5148',
          backgroundColor: 'rgba(255, 81, 72, 0.16)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.34,
          fill: true
        },
        {
          label: 'Rodents',
          data: rodentValues,
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.12)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.34,
          fill: true
        }
      ]
    },
    options: {
      ...sharedOptions,
      plugins: {
        ...sharedOptions.plugins,
        legend: {
          position: 'top',
          labels: sharedOptions.plugins.legend.labels
        }
      }
    }
  })
}

/**
 * Initialize grouped bar chart comparing noise and rodent complaints by borough.
 *
 * @param {Array} noiseData - Array of {borough, noise_count}
 * @param {Array} rodentData - Array of {borough, rodent_count}
 */
export function initBoroughComparisonChart(noiseData, rodentData) {
  const ctx = document.getElementById('borough-comparison-chart')
  if (!ctx) return

  const boroughs = [...new Set([
    ...noiseData.map(row => row.borough),
    ...rodentData.map(row => row.borough)
  ])]
  const noiseByBorough = new Map(noiseData.map(row => [row.borough, row.noise_count]))
  const rodentByBorough = new Map(rodentData.map(row => [row.borough, row.rodent_count]))

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: boroughs,
      datasets: [
        {
          label: 'Noise',
          data: boroughs.map(borough => noiseByBorough.get(borough) || 0),
          backgroundColor: '#ff5148',
          borderRadius: 4
        },
        {
          label: 'Rodents',
          data: boroughs.map(borough => rodentByBorough.get(borough) || 0),
          backgroundColor: '#a855f7',
          borderRadius: 4
        }
      ]
    },
    options: {
      ...sharedOptions,
      plugins: {
        ...sharedOptions.plugins,
        legend: {
          position: 'top',
          labels: sharedOptions.plugins.legend.labels
        }
      }
    }
  })
}

/**
 * Initialize horizontal bar chart showing noise complaints by NYC borough
 * 
 * @param {Array} data - Array of objects with {borough: string, noise_count: number}
 * 
 * Expected data format from noise_by_borough.json:
 * [{borough: "BROOKLYN", noise_count: 1047}, ...]
 * 
 * TODO: Add click handler to filter other views by selected borough
 */
export function initNoiseByBoroughChart(data) {
  const ctx = document.getElementById('noise-borough-chart')
  if (!ctx) return  // Guard: canvas not found in DOM
  
  // Extract borough names and counts from JSON data
  const labels = data.map(row => row.borough)
  const values = data.map(row => row.noise_count)
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Noise Complaints',
        data: values,
        backgroundColor: '#facc15',
        borderColor: '#facc15',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',  // Horizontal bars (y-axis shows borough labels)
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false  // Hide legend since single dataset is self-explanatory
        }
      },
      scales: {
        x: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          }
        },
        y: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          }
        }
      }
    }
  })
}

/**
 * Initialize horizontal bar chart showing rodent complaints by NYC borough
 * 
 * @param {Array} data - Array of objects with {borough: string, rodent_count: number}
 * 
 * Same structure as noise chart but with red color scheme
 */
export function initRodentByBoroughChart(data) {
  const ctx = document.getElementById('rodent-borough-chart')
  if (!ctx) return  // Guard: canvas not found in DOM
  
  // Extract borough names and rodent counts
  const labels = data.map(row => row.borough)
  const values = data.map(row => row.rodent_count)
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Rodent Complaints',
        data: values,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          }
        },
        y: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          }
        }
      }
    }
  })
}

/**
 * Initialize bar chart showing noise complaint volume by hour of day (0-23)
 * 
 * @param {Array} data - Array of objects with {created_hour: number, total: number}
 * 
 * Reveals temporal patterns - when are New Yorkers most bothered by noise?
 * Expected peak hours: evening/night (20-23) when people are trying to sleep
 * 
 * TODO: Add interactivity to show which complaint types peak at each hour
 */
export function initNoiseByHourChart(data) {
  const ctx = document.getElementById('noise-hour-chart')
  if (!ctx) return  // Guard: canvas not found in DOM
  
  // Extract hours (0-23) and complaint counts
  const labels = data.map(row => row.created_hour)
  const values = data.map(row => row.total)
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Noise Complaints',
        data: values,
        backgroundColor: '#facc15',
        borderColor: '#facc15',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          },
          title: {
            display: true,
            text: 'Hour of Day (0-23)',  // Military time format
            color: chartDefaults.textColor
          }
        },
        y: {
          grid: {
            color: chartDefaults.gridColor
          },
          ticks: {
            color: chartDefaults.textColor
          },
          title: {
            display: true,
            text: 'Number of Complaints',
            color: chartDefaults.textColor
          }
        }
      }
    }
  })
}
