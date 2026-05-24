export const meta = {
  type: 'mapSearch',
  label: 'Recherche Carte',
  category: 'map'
}

const queryMap = {
  boulangerie: ['boulangerie', 'bakery'],
  boulangeries: ['boulangerie', 'bakery'],
  bakery: ['bakery', 'boulangerie'],
  restaurant: ['restaurant'],
  restaurants: ['restaurant'],
  pharmacie: ['pharmacie', 'pharmacy'],
  pharmacies: ['pharmacie', 'pharmacy'],
  pharmacy: ['pharmacy', 'pharmacie'],
  epicerie: ['epicerie', 'épicerie', 'grocery', 'supermarket', 'convenience'],
  épicerie: ['epicerie', 'épicerie', 'grocery', 'supermarket', 'convenience'],
  grocery: ['grocery', 'epicerie', 'supermarket'],
  cafe: ['cafe', 'café', 'coffee'],
  café: ['cafe', 'café', 'coffee'],
  coffee: ['coffee', 'cafe', 'café'],
  bar: ['bar', 'pub'],
  pub: ['pub', 'bar'],
  coiffeur: ['coiffeur', 'hairdresser', 'salon'],
  hairdresser: ['hairdresser', 'coiffeur'],
  banque: ['banque', 'bank'],
  bank: ['bank', 'banque'],
  hotel: ['hotel', 'hôtel', 'hostel', 'motel'],
  hôtel: ['hotel', 'hôtel', 'hostel', 'motel'],
  supermarche: ['supermarket', 'supermarché'],
  supermarché: ['supermarket', 'supermarché'],
  supermarket: ['supermarket', 'supermarché'],
  fleuriste: ['florist', 'fleuriste', 'flowers'],
  florist: ['florist', 'fleuriste'],
  boucherie: ['butcher', 'boucherie', 'meat'],
  butcher: ['butcher', 'boucherie']
}

function getSearchTerms(query) {
  const normalized = query.toLowerCase().trim()
  if (queryMap[normalized]) {
    return queryMap[normalized]
  }
  for (const [key, synonyms] of Object.entries(queryMap)) {
    if (normalized.includes(key)) {
      return Array.from(new Set([query, ...synonyms]))
    }
  }
  return [query]
}

export async function execute(config, inputData) {
  try {
    const query = config.query || inputData?.query || 'boulangerie'
    const location = config.location || inputData?.location || 'Paris'
    const radiusKm = config.radius !== undefined ? parseFloat(config.radius) : 5
    const limitValue = config.limit !== undefined ? parseInt(config.limit, 10) : 10

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

    // Step 2: Calculate bounding box coordinates around center
    const deltaLat = radiusKm / 111.32
    const cosLat = Math.cos(lat * Math.PI / 180)
    const deltaLon = radiusKm / (111.32 * (Math.abs(cosLat) > 0.01 ? cosLat : 0.01))

    const left = lon - deltaLon
    const right = lon + deltaLon
    const top = lat + deltaLat
    const bottom = lat - deltaLat

    // Use Nominatim search limit (max 50 to avoid OSM rate limits)
    const osmLimit = limitValue === 0 ? 50 : Math.min(50, limitValue)

    // Step 3: Search for POIs bounded within the viewbox with expanded queries
    const searchTerms = getSearchTerms(query)
    const searchPromises = searchTerms.map(async (term) => {
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&viewbox=${left},${top},${right},${bottom}&bounded=1&format=json&limit=${osmLimit}&addressdetails=1&extratags=1`
      try {
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'FlowForge/1.0 (workflow-automation)' }
        })
        if (response.ok) {
          return await response.json()
        }
      } catch (e) {
        console.error(`Erreur recherche pour ${term}:`, e)
      }
      return []
    })

    const resultsArray = await Promise.all(searchPromises)
    const allResults = resultsArray.flat()

    // Deduplicate by place_id
    const seen = new Set()
    const uniqueResults = []
    for (const place of allResults) {
      const id = place.place_id || `${place.lat}_${place.lon}`
      if (!seen.has(id)) {
        seen.add(id)
        uniqueResults.push(place)
      }
    }

    const places = uniqueResults.map(place => {
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

    // Filter by precise radius in meters
    const radiusMeters = radiusKm * 1000
    const filteredPlaces = places.filter(p => {
      const dLat = (p.lat - lat) * 111320
      const dLon = (p.lon - lon) * 111320 * Math.cos(lat * Math.PI / 180)
      const distance = Math.sqrt(dLat * dLat + dLon * dLon)
      p.distanceMeters = Math.round(distance)
      return distance <= radiusMeters
    })

    filteredPlaces.sort((a, b) => a.distanceMeters - b.distanceMeters)

    // Crop to limitValue if greater than 0
    let finalPlaces = filteredPlaces
    if (limitValue > 0) {
      finalPlaces = filteredPlaces.slice(0, limitValue)
    }

    const resultSummary = finalPlaces.length > 0 
      ? finalPlaces.map((p, i) => `${i+1}. ${p.name} (${p.street || ''}, ${p.city || ''}) - à ${p.distanceMeters}m`).join('\n')
      : 'Aucun lieu trouvé.'

    return {
      success: true,
      query,
      location,
      center: { lat, lon },
      radius: radiusKm,
      places: finalPlaces,
      count: finalPlaces.length,
      totalFound: uniqueResults.length,
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
