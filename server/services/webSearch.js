export async function searchWeb(query) {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey || !query) return null

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query,
        max_results: 4,
      }),
    })

    if (!response.ok) return null

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

