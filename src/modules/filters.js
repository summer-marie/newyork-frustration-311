/**
 * Filter Module
 *
 * The current dashboard has practical map filtering for complaint type and
 * borough. Full chart re-aggregation is intentionally left as a future step
 * because the existing chart module initializes Chart.js instances without an
 * update/destroy contract yet.
 */

/**
 * Initialize filter UI components.
 *
 * TODO: Extend chart modules to return Chart.js instances, then update chart
 * datasets here when filters change.
 */
export function initFilters({ mapApi } = {}) {
  const typeSelect = document.getElementById('complaint-type-filter')
  const boroughSelect = document.getElementById('borough-filter')
  const clearButton = document.getElementById('clear-filters')
  const summary = document.getElementById('filter-summary')

  if (!typeSelect || !boroughSelect) {
    console.log('Filters initialized without visible controls')
    return
  }

  const applyFilters = () => {
    const complaintType = typeSelect.value
    const borough = boroughSelect.value
    const result = mapApi?.setFilters?.({ complaintType, borough })
    const typeLabel = typeSelect.options[typeSelect.selectedIndex]?.text || 'All Types'
    const boroughLabel = boroughSelect.options[boroughSelect.selectedIndex]?.text || 'All Boroughs'
    const countText = result?.visibleCount !== undefined ? `${result.visibleCount} ZIP marker${result.visibleCount === 1 ? '' : 's'}` : 'ZIP markers'

    if (summary) {
      summary.textContent = `Showing ${countText} for ${typeLabel.toLowerCase()} in ${boroughLabel}. Charts remain citywide for now.`
    }
  }

  typeSelect.addEventListener('change', applyFilters)
  boroughSelect.addEventListener('change', applyFilters)
  clearButton?.addEventListener('click', () => {
    typeSelect.value = 'all'
    boroughSelect.value = 'all'
    applyFilters()
  })

  applyFilters()
}

/**
 * Apply date range filter to complaint data
 * 
 * @param {Date} startDate - Filter start date
 * @param {Date} endDate - Filter end date
 * 
 * TODO: Filter complaint_trends.json by date range
 * TODO: Re-aggregate all stats within date window
 */
export function applyDateFilter(startDate, endDate) {
  console.log('Applying date filter:', startDate, endDate)
}

/**
 * Filter all data by specific NYC borough
 * 
 * @param {string} borough - Borough name (e.g., "Brooklyn", "Manhattan")
 * 
 * TODO: Filter all datasets to show only selected borough
 * TODO: Update charts to show intra-borough patterns (e.g., by neighborhood)
 */
export function applyBoroughFilter(borough) {
  console.log('Applying borough filter:', borough)
}
