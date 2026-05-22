import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const chartDefaults = {
  backgroundColor: '#1a1a2e',
  gridColor: 'rgba(255, 255, 255, 0.1)',
  textColor: 'rgba(255, 255, 255, 0.9)'
}

export function initNoiseByBoroughChart(data) {
  const ctx = document.getElementById('noise-borough-chart')
  if (!ctx) return
  
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
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
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

export function initRodentByBoroughChart(data) {
  const ctx = document.getElementById('rodent-borough-chart')
  if (!ctx) return
  
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
      maintainAspectRatio: true,
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

export function initNoiseByHourChart(data) {
  const ctx = document.getElementById('noise-hour-chart')
  if (!ctx) return
  
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
      maintainAspectRatio: true,
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
            text: 'Hour of Day (0-23)',
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
