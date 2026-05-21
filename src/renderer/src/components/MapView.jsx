import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

function MapUpdater({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, 13)
    }
  }, [center, map])
  return null
}

export default function MapView({ query, location, radius, results }) {
  const [places, setPlaces] = useState([])
  const [center, setCenter] = useState([48.8566, 2.3522])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchPlaces = async () => {
      if (!location && !query) return
      setLoading(true)

      try {
        // Geocode location
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location || 'Paris')}&format=json&limit=1`
        const geoRes = await fetch(geoUrl, {
          headers: { 'User-Agent': 'FlowForge/1.0' }
        })
        const geoData = await geoRes.json()

        if (geoData && geoData.length > 0) {
          const lat = parseFloat(geoData[0].lat)
          const lon = parseFloat(geoData[0].lon)
          setCenter([lat, lon])

          // Search for places
          if (query) {
            const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' ' + (location || ''))}&format=json&limit=10&addressdetails=1`
            const searchRes = await fetch(searchUrl, {
              headers: { 'User-Agent': 'FlowForge/1.0' }
            })
            const searchData = await searchRes.json()
            setPlaces(searchData.map(p => ({
              name: p.display_name?.split(',')[0] || 'Sans nom',
              fullAddress: p.display_name || '',
              lat: parseFloat(p.lat),
              lon: parseFloat(p.lon)
            })))
          }
        }
      } catch (e) {
        console.error('Map search error:', e)
      }
      setLoading(false)
    }

    const timer = setTimeout(searchPlaces, 800)
    return () => clearTimeout(timer)
  }, [query, location])

  return (
    <div className="map-container">
      {loading && <div className="map-loading">Recherche...</div>}
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '16px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        {places.map((place, i) => (
          <Marker key={i} position={[place.lat, place.lon]}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              <small>{place.fullAddress}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
