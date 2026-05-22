export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatBorough(str) {
  if (!str) return ''
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function getTopN(arr, key, n = 10) {
  if (!Array.isArray(arr)) return []
  const sorted = [...arr].sort((a, b) => b[key] - a[key])
  return sorted.slice(0, n)
}

export function calculatePercentage(value, total) {
  if (total === 0) return 0
  return ((value / total) * 100).toFixed(2)
}

export function sortByValue(data, key, ascending = false) {
  if (!Array.isArray(data)) return []
  const sorted = [...data].sort((a, b) => {
    if (ascending) {
      return a[key] - b[key]
    }
    return b[key] - a[key]
  })
  return sorted
}
