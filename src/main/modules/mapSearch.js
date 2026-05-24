export const meta = {
  type: 'mapSearch',
  label: 'Recherche Carte',
  category: 'map'
}

export async function execute(config, inputData) {
  try {
    const query = config.query || inputData?.query || 'boulangerie'
    const location = config.location || inputData?.location || 'Paris'
    const radius = (config.radius || 5) * 1000 // Convert km to meters

    // Step 1: Geocode the location to get coordinates
    const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
    const geoResponse = await fetch(geoUrl, {
      headers: { 'User-Agent': 'FlowForge/1.0 (workflow-automation)' }
    })

    if (!geoResponse.ok) {
      return {
        success: false,
        error: `Erreur géocodage: ${geoResponse.status}`,
        places: [],
        count: 0
      }
    }

    const geoData = await geoResponse.json()
    if (!geoData || geoData.length === 0) {
      return {
        success: false,
        error: `Lieu non trouvé: ${location}`,
        places: [],
        count: 0
      }
    }

    const lat = parseFloat(geoData[0].lat)
    const lon = parseFloat(geoData[0].lon)

    // Step 2: Search for places using Nominatim
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' ' + location)}&format=json&limit=20&addressdetails=1&extratags=1`
    const searchResponse = await fetch(searchUrl, {
      headers: { 'User-Agent': 'FlowForge/1.0 (workflow-automation)' }
    })

    if (!searchResponse.ok) {
      return {
        success: false,
        error: `Erreur recherche: ${searchResponse.status}`,
        places: [],
        count: 0
      }
    }

    const searchData = await searchResponse.json()

    const places = searchData.map(place => {
      const address = place.address || {}
      return {
        name: place.display_name?.split(',')[0] || place.name || 'Sans nom',
        fullAddress: place.display_name || '',
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        type: place.type || 'unknown',
        category: place.category || 'place',
        street: address.road || address.street || '',
        city: address.city || address.town || address.village || '',
        postcode: address.postcode || '',
        country: address.country || '',
        phone: place.extratags?.phone || '',
        website: place.extratags?.website || '',
        openingHours: place.extratags?.opening_hours || ''
      }
    })

    // Filter by rough radius (bounding box approximation)
    const filteredPlaces = places.filter(p => {
      const dLat = (p.lat - lat) * 111320
      const dLon = (p.lon - lon) * 111320 * Math.cos(lat * Math.PI / 180)
      const distance = Math.sqrt(dLat * dLat + dLon * dLon)
      p.distanceMeters = Math.round(distance)
      return distance <= radius
    })

    filteredPlaces.sort((a, b) => a.distanceMeters - b.distanceMeters)

    const resultSummary = filteredPlaces.length > 0 
      ? filteredPlaces.map((p, i) => `${i+1}. ${p.name} (${p.street || ''}, ${p.city || ''}) - à ${p.distanceMeters}m`).join('\n')
      : 'Aucun lieu trouvé.'

    return {
      success: true,
      query,
      location,
      center: { lat, lon },
      radius: config.radius || 5,
      places: filteredPlaces,
      count: filteredPlaces.length,
      totalFound: searchData.length,
      result: resultSummary
    }
  } catch (error) {
    return {
      success: false,
      error: `Erreur: ${error.message}`,
      places: [],
      count: 0
    }
  }
}
