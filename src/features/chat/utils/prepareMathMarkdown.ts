/**
 * Prepare assistant markdown so LaTeX renders with KaTeX.
 * Models often wrap formulas in ( ... ) instead of $$ ... $$ and emit {{ }} from JSON/streaming.
 */

function collapseDoubleBraces(latex: string): string {
  let s = latex
  let prev = ''
  while (s !== prev) {
    prev = s
    s = s.replace(/\{\{/g, '{').replace(/\}\}/g, '}')
  }
  return s
}

/** Index of matching `)` for `(` at openIdx; respects `{}` and escaped parens. */
function matchingParenIndex(s: string, openIdx: number): number {
  let depth = 1
  let j = openIdx + 1
  let brace = 0
  while (j < s.length && depth > 0) {
    const c = s[j]
    if (c === '\\' && j + 1 < s.length) {
      j += 2
      continue
    }
    if (c === '{') brace++
    else if (c === '}') brace = Math.max(0, brace - 1)
    else if (brace === 0) {
      if (c === '(') depth++
      else if (c === ')') depth--
    }
    j++
  }
  return depth === 0 ? j - 1 : -1
}

const HAS_TEX_CMD = /\\(?:frac|sqrt|pm|sum|prod|int|cdot|times|alpha|beta|gamma|delta|theta|pi|infty|leq|geq|neq|approx|mathbb|mathrm|text|quad|qquad|implies|iff)/i

export function prepareAssistantMathMarkdown(content: string): string {
  let s = content

  // Standard LaTeX delimiters
  s = s.replace(/\\\[/g, '$$\n').replace(/\\\]/g, '\n$$')
  s = s.replace(/\\\(/g, '$').replace(/\\\)/g, '$')

  const out: string[] = []
  let i = 0
  while (i < s.length) {
    if (s[i] === '(') {
      const end = matchingParenIndex(s, i)

      if (end > i) {
        const innerRaw = s.slice(i + 1, end).trim()

        // ( ax^2 + bx + c = 0 ) — polynomial standard form, no \commands
        if (
          /x\^2/i.test(innerRaw) &&
          /\b=\s*0\b/.test(innerRaw) &&
          !/\\/.test(innerRaw)
        ) {
          const compact = innerRaw.replace(/\s+/g, ' ')
          out.push(`$${compact}$`)
          i = end + 1
          continue
        }

        // ( ... \frac ... ) or other TeX
        if (HAS_TEX_CMD.test(innerRaw)) {
          const inner = collapseDoubleBraces(innerRaw)
          out.push(`\n\n$$\n${inner}\n$$\n\n`)
          i = end + 1
          continue
        }
      }
    }
    out.push(s[i]!)
    i++
  }

  return out.join('')
}
