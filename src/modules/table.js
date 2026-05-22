import { formatNumber, formatBorough } from './utils.js'

export function initZipOverlapTable(data) {
  const container = document.getElementById('zip-overlap-table')
  if (!container) return
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p class="text-gray-400">No overlapping ZIP codes found.</p>'
    return
  }
  
  const tableHTML = `
    <div class="overflow-x-auto">
      <table class="w-full text-left">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="py-3 px-4 text-yellow-400 font-semibold">ZIP Code</th>
            <th class="py-3 px-4 text-yellow-400 font-semibold">Borough</th>
            <th class="py-3 px-4 text-yellow-400 font-semibold text-right">Noise Complaints</th>
            <th class="py-3 px-4 text-red-500 font-semibold text-right">Rodent Complaints</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((row, index) => `
            <tr class="border-l-4 border-yellow-400 hover:bg-[#1a1a2e] transition-colors ${index % 2 === 0 ? 'bg-[#16213e]' : 'bg-[#1a1a2e]'}">
              <td class="py-3 px-4 font-mono text-gray-200">${row.incident_zip}</td>
              <td class="py-3 px-4 text-gray-300">${formatBorough(row.borough)}</td>
              <td class="py-3 px-4 text-right text-yellow-400 font-semibold">${formatNumber(row.noise_total)}</td>
              <td class="py-3 px-4 text-right text-red-500 font-semibold">${formatNumber(row.rodent_total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
  
  container.innerHTML = tableHTML
}
