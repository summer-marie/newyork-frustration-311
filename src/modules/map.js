import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { formatBorough, formatNumber } from './utils.js'

const NYC_CENTER = [40.7128, -74.006]
const NYC_BOUNDS = [
  [40.44, -74.32],
  [40.96, -73.62]
]

function getIntensityColor(row, maxTotal) {
  const ratio = maxTotal ? row.total_complaints / maxTotal : 0
  if (row.rodent_count > row.noise_count) return ratio > 0.65 ? '#c084fc' : '#a855f7'
  return ratio > 0.65 ? '#f8c537' : '#ff5148'
}

function getRadius(row, maxTotal) {
  const ratio = maxTotal ? row.total_complaints / maxTotal : 0
  return 7 + Math.sqrt(ratio) * 20
}

function setMapSearchStatus(message) {
  const status = document.getElementById('zip-map-status')
  if (status) status.textContent = message
}

/**
 * Initialize the interactive ZIP map.
 *
 * This marker-based layer is intentionally shaped so ZIP GeoJSON can replace
 * the marker loop later while keeping the same click callback contract.
 * Future boundary support should swap L.circleMarker for L.geoJSON(features)
 * and call onZipSelect(row) from each feature's click handler.
 */
export function initZipMap(zipRows, onZipSelect) {
  const container = document.getElementById('zip-map')
  if (!container || !Array.isArray(zipRows) || zipRows.length === 0) return null

  const map = L.map(container, {
    center: NYC_CENTER,
    zoom: 10,
    minZoom: 9,
    maxZoom: 15,
    maxBounds: NYC_BOUNDS,
    zoomControl: false,
    attributionControl: false
  })

  L.control.zoom({
    position: 'topleft'
  }).addTo(map)

  L.control.attribution({
    position: 'bottomleft',
    prefix: false
  }).addAttribution('Tiles &copy; CARTO, OpenStreetMap contributors').addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map)

  const maxTotal = Math.max(...zipRows.map(row => row.total_complaints || 0))
  const markers = new Map()
  const markerGroup = L.featureGroup().addTo(map)
  let selectedMarker = null

  zipRows.forEach(row => {
    const lat = Number(row.latitude)
    const lng = Number(row.longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const color = getIntensityColor(row, maxTotal)
    const marker = L.circleMarker([lat, lng], {
      radius: getRadius(row, maxTotal),
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.42,
      opacity: 0.95,
      className: 'zip-complaint-marker',
      zipData: row
    })

    marker.bindTooltip(
      `<strong>${row.incident_zip}</strong><br>${formatNumber(row.total_complaints)} complaints`,
      {
        direction: 'top',
        offset: [0, -8],
        opacity: 0.95
      }
    )

    marker.bindPopup(`
      <div class="zip-popup">
        <strong>ZIP ${row.incident_zip}</strong>
        <span>${formatBorough(row.borough)}</span>
        <span>${formatNumber(row.total_complaints)} total complaints</span>
        <span>${formatNumber(row.noise_count)} noise / ${formatNumber(row.rodent_count)} rodent</span>
      </div>
    `)

    marker.on('click', () => {
      if (selectedMarker) {
        selectedMarker.getElement()?.classList.remove('is-selected')
        selectedMarker.setStyle({
          weight: 2,
          fillOpacity: 0.42
        })
      }
      selectedMarker = marker
      marker.getElement()?.classList.add('is-selected')
      marker.setStyle({
        weight: 4,
        fillOpacity: 0.72
      })
      onZipSelect(row)
      setMapSearchStatus(`Selected ZIP ${row.incident_zip}`)
    })

    marker.addTo(markerGroup)
    markers.set(String(row.incident_zip), marker)
  })

  if (markerGroup.getLayers().length > 0) {
    map.fitBounds(markerGroup.getBounds().pad(0.16), {
      maxZoom: 11
    })
  }

  const selectZip = zip => {
    const cleanZip = String(zip).trim()
    const marker = markers.get(cleanZip)
    if (!marker) {
      setMapSearchStatus(`ZIP ${cleanZip || 'entered'} was not found in the current ZIP data.`)
      return
    }

    if (!map.hasLayer(marker)) {
      marker.addTo(markerGroup)
      setMapSearchStatus(`ZIP ${cleanZip} found outside the active filters.`)
    }

    map.flyTo(marker.getLatLng(), 13, {
      duration: 0.55
    })
    marker.fire('click')
    marker.openPopup()
  }

  const searchInput = document.getElementById('zip-map-search')
  const searchButton = document.getElementById('zip-map-search-button')
  const handleSearch = () => {
    const zip = searchInput?.value
    if (!zip) return
    selectZip(zip)
  }

  searchButton?.addEventListener('click', handleSearch)
  searchInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') handleSearch()
  })

  const firstZip = String(zipRows[0].incident_zip)
  if (firstZip) {
    window.requestAnimationFrame(() => selectZip(firstZip))
  }

  const setFilters = ({ complaintType = 'all', borough = 'all' } = {}) => {
    let visibleCount = 0
    markerGroup.clearLayers()

    markers.forEach(marker => {
      const row = marker.options.zipData
      const complaintMatches =
        complaintType === 'all' ||
        (complaintType === 'noise' && row.noise_count > 0) ||
        (complaintType === 'rodent' && row.rodent_count > 0)
      const boroughMatches = borough === 'all' || row.borough === borough

      if (complaintMatches && boroughMatches) {
        marker.addTo(markerGroup)
        visibleCount += 1
      }
    })

    if (visibleCount === 0) {
      setMapSearchStatus('No ZIP markers match the selected filters.')
      return { visibleCount }
    }

    const bounds = markerGroup.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.16), {
        maxZoom: 12
      })
    }
    setMapSearchStatus(`Showing ${visibleCount} ZIP marker${visibleCount === 1 ? '' : 's'} for the active filters.`)
    return { visibleCount }
  }

  return {
    map,
    selectZip,
    setFilters
  }
}
