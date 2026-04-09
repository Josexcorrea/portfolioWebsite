/**
 * @param {string} query
 * @param {{ weakRag?: boolean }} [opts] - When true, ask for deeper search (more results) to compensate for thin RAG.
 */
export async function searchWeb(query, opts = {}) {
  const weatherFallback = await searchWeatherFallback(query)
  if (weatherFallback) return weatherFallback

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey || !query) return null

  const weakRag = Boolean(opts.weakRag)

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: weakRag ? 6 : 4,
        search_depth: weakRag ? 'advanced' : 'basic',
        topic: 'general',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error(
        'Tavily HTTP error:',
        response.status,
        errText.slice(0, 500),
      )
      return null
    }

    const data = await response.json()
    if (!data?.results || !Array.isArray(data.results)) return null

    return data.results.map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content || r.snippet || '',
    }))
  } catch (err) {
    console.error('Web search failed:', err)
    return null
  }
}

function isWeatherQuery(query) {
  return /\b(weather|forecast|temperature)\b/i.test(String(query || ''))
}

function extractWeatherLocation(query) {
  const q = String(query || '').trim()
  if (!q) return null

  const inMatch = q.match(/\b(?:weather|forecast|temperature)\s+(?:in|for)\s+(.+)$/i)
  const weatherPrefixMatch = q.match(/^\s*(?:weather|forecast|temperature)\s+(.+)$/i)
  const from = inMatch?.[1] || weatherPrefixMatch?.[1]
  if (!from) return null

  return from
    .replace(/\b(today|now|right now|currently|please)\b/gi, '')
    .replace(/[?.!,]+$/g, '')
    .trim()
}

function describeWeatherCode(code) {
  const map = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'drizzle',
    55: 'dense drizzle',
    61: 'light rain',
    63: 'rain',
    65: 'heavy rain',
    71: 'light snow',
    73: 'snow',
    75: 'heavy snow',
    80: 'rain showers',
    81: 'rain showers',
    82: 'violent rain showers',
    95: 'thunderstorm',
    96: 'thunderstorm with hail',
    99: 'thunderstorm with hail',
  }
  return map[Number(code)] || 'mixed conditions'
}

async function searchWeatherFallback(query) {
  if (!isWeatherQuery(query)) return null
  const location = extractWeatherLocation(query)
  if (!location) return null

  try {
    const geoUrl =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}` +
      '&count=1&language=en&format=json'
    const geoResponse = await fetch(geoUrl)
    if (!geoResponse.ok) return null
    const geoData = await geoResponse.json()
    const place = geoData?.results?.[0]
    if (!place?.latitude || !place?.longitude) return null

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}` +
      '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&timezone=auto'
    const weatherResponse = await fetch(weatherUrl)
    if (!weatherResponse.ok) return null
    const weatherData = await weatherResponse.json()
    const current = weatherData?.current
    if (!current) return null

    const name = [place.name, place.admin1, place.country].filter(Boolean).join(', ')
    const condition = describeWeatherCode(current.weather_code)
    const snippet =
      `Current weather for ${name}: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C), ` +
      `${condition}, wind ${current.wind_speed_10m} km/h. Source timestamp: ${current.time}.`

    return [
      {
        title: `Current weather for ${name}`,
        url: 'https://open-meteo.com/',
        snippet,
      },
    ]
  } catch (err) {
    console.error('Weather fallback failed:', err)
    return null
  }
}

