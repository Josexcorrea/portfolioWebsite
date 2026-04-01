/**
 * @param {string} query
 * @param {{ weakRag?: boolean }} [opts] - When true, ask for deeper search (more results) to compensate for thin RAG.
 */
export async function searchWeb(query, opts = {}) {
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

