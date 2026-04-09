/** User wants depth: more RAG chunks + higher max_tokens (see createServer config). */
export function isDetailTechnicalQuestion(qLower) {
  const patterns = [
    /\bin[- ]depth\b/,
    /\bdeep dive\b/,
    /\bmore detail\b/,
    /\bdetailed (answer|explanation|overview)\b/,
    /\btechnical (details|detail|explanation|overview|question)\b/,
    /\barchitecture\b/,
    /\bimplementation\b/,
    /\belaborate\b/,
    /\bwalk ?through\b/,
    /\bstep[- ]by[- ]step\b/,
    /\bexplain (how|why)\b/,
    /\bhow does (the )?.+\b(work|function)\b/,
    /\bthoroughly\b/,
    /\bcomprehensive\b/,
    /\bdesign (details|choices|decisions)\b/,
    /\b(what|which) design\b/,
    /\b(option|options)\s+(one|two|1|2|three|3)\b/,
    /\btrade[- ]?offs?\b/,
    /\bwhy (choose|did|pick)\b/,
    /\bconstraint(s)?\b/,
    /\brequirement(s)?\b/,
    /\bcompare\b|\bversus\b|\bvs\.?\b/,
    /\b(the )?stack\b/,
    /\blow[- ]level\b/,
    /\bgo (into|in) detail\b/,
    /\b(deploy|deployment|deployed|hosted|hosting|production|vercel|serverless|ci\/cd)\b/,
    /\bhow (was|is|were)\b.+\b(backend|api|server)\b/,
    /\bfsae\b|\bformula sae\b/,
    /\bpdm\b|\bpower distribution\b/,
    /\becu\b|\bcan bus\b|\btelemetry\b/,
  ]
  return patterns.some((p) => p.test(qLower))
}

/** Real-time or general-web questions where Tavily helps; portfolio-meta questions skip web to avoid noise. */
export function looksLikeFreshnessOrGeneralWebQuery(qLower) {
  return /\b(weather|forecast|temperature|humidity|stock price|exchange rate|news today|breaking news|score (of|for) the|who won|nba |nfl )\b/i.test(
    qLower,
  )
}

export function looksLikeWeatherQuery(qLower) {
  return /\b(weather|forecast|temperature)\b/i.test(qLower)
}

export function looksLikeThisPortfolioMetaQuestion(qLower) {
  return (
    /\b(this portfolio|portfolio website|this site|this website|your site|jose'?s (site|portfolio)|the site'?s)\b/.test(
      qLower,
    ) &&
    /\b(deploy|deployment|deployed|hosted|hosting|backend|vercel|api\/chat|\/api\/chat|rag|how (does|is|was).+ built)\b/.test(
      qLower,
    )
  )
}

export function looksLikePortfolioScopedQuestion(qLower) {
  return /\b(jose|portfolio|this site|this website|your site|projects?|experience|resume|skills?|contact|about|fsae|formula sae|pdm|power distribution)\b/.test(
    qLower,
  )
}

/**
 * @param {{ maxScore: number, chunksLen: number }} rag
 */
export function shouldRunWebSearch(lastQuestion, rag) {
  const qLower = lastQuestion.toLowerCase()
  // Weather gets a direct fallback provider when Tavily is unavailable.
  if (looksLikeWeatherQuery(qLower)) return true
  if (!process.env.TAVILY_API_KEY) return false
  if (looksLikeFreshnessOrGeneralWebQuery(qLower)) return true
  if (looksLikeThisPortfolioMetaQuestion(qLower)) return false
  const isPortfolioScoped = looksLikePortfolioScopedQuestion(qLower)
  const strongPortfolioMatch = rag.chunksLen >= 2 && rag.maxScore >= 0.36
  if (!isPortfolioScoped) return true
  if (strongPortfolioMatch) return false
  return rag.maxScore < 0.42 || rag.chunksLen < 2
}

export function looksLikeSnippetRequest(qLower) {
  return (
    /\b(code|snippet|file|path|implementation|source|show me|exact)\b/.test(qLower) ||
    /\bwhere\b.+\b(in|inside)\b/.test(qLower)
  )
}

export function looksLikeRiskOrSecurityQuestion(qLower) {
  return /\b(what breaks|if skipped|security|signature|verify|validation|webhook|auth|token)\b/.test(qLower)
}

export function hasStrongCodeEvidence(chunks) {
  if (!chunks || chunks.length === 0) return false
  const text = chunks.map((c) => `${c.documentTitle}\n${c.chunkText}`).join('\n')
  return (
    /```/.test(text) ||
    /\b(src|server|api|lib|routes|components)\/[^\s)]+/.test(text) ||
    /\b(function|const|let|class|export|import)\b/.test(text)
  )
}

export function buildOwnerContractInstruction({
  snippetRequested,
  securityStyleQuestion,
  codeEvidenceStrong,
}) {
  const lines = [
    '## Owner-mode response contract (enforced)',
    '- Tone: confident, calm, human, and low-repetition. Keep wording tight; do not restate the same point.',
    '- Use this structure in order:',
    '  1) **Client-ready script** (natural spoken explanation you can read out loud)',
    '  2) **Cheat sheet** (key points, tradeoffs, likely follow-up questions)',
    '  3) **Support block** with adaptive title:',
    '     - Use **Code** when showing code/snippets.',
    '     - Use **Diagram** when showing process flow/visual structure.',
    '     - Use **Equation** when showing formulas/math rules.',
  ]
  if (securityStyleQuestion) lines.push('- Include a short **What breaks if skipped** subsection in the cheat sheet.')

  if (snippetRequested && !codeEvidenceStrong) {
    lines.push(
      '- If exact code evidence is insufficient, include this exact sentence at the top of the cheat sheet snippet subsection:',
      '  "I cannot show the exact snippet from retrieved context for this request."',
      '- After that sentence, name what evidence is available from retrieved context (paths/titles only if present).',
      '- Do not provide invented code, pseudocode, or generic tutorial snippets in this case.',
    )
  } else if (snippetRequested && codeEvidenceStrong) {
    lines.push(
      '- Add a **Snippet** subsection at the top of the cheat sheet.',
      '- The **Snippet** subsection must contain: (a) a file/path line, and (b) a fenced code block copied from retrieved context.',
      '- Prefer the most relevant function-level code (e.g., `export function ...`) when available.',
      '- After the snippet, include **Line-by-line breakdown** (or logical block-by-block when formatting is compressed) explaining what each part does and why it matters.',
      '- The **Client-ready script** must be substantive: explain the problem this code solves, how the flow works end-to-end, and one practical tradeoff.',
      '- Avoid generic filler like "this function wraps behavior"; anchor explanations to the shown snippet.',
      '- When retrieved code evidence exists, do not use the sentence "I cannot show the exact snippet from retrieved context for this request."',
    )
  }

  lines.push('- Keep language human and interview-ready, not robotic.')
  lines.push('- Never show internal RAG labels like [S1].')
  return lines.join('\n')
}

