export function initZipOverlapTable(data) {
  const container = document.getElementById('zip-overlap-table')
  if (!container) return
  
  // Table implementation will go here
  console.log('Initializing ZIP Overlap table with data:', data)
  
  container.innerHTML = '<p class="text-gray-500">Table will be populated with ZIP code overlap data</p>'
}
