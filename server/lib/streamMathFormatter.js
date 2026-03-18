const SUPERSCRIPTS = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  n: 'ⁿ',
  i: 'ⁱ',
}

function toSuperscript(str) {
  let out = ''
  for (const ch of str) {
    const mapped = SUPERSCRIPTS[ch]
    if (!mapped) return null
    out += mapped
  }
  return out
}

function formatOutsideCode(text) {
  // LaTeX / KaTeX needs literal ^ (e.g. b^2 inside \sqrt{...}). Do not mangle.
  if (/\\[a-zA-Z]+/.test(text)) return text

  // Complex exponents like x^(1/2) → readable (outside math).
  text = text.replace(/\^\(([^)]+)\)/g, (_m, inner) => ` to the power (${inner})`)
  text = text.replace(/\^\{([^}]+)\}/g, (_m, inner) => ` to the power (${inner})`)

  text = text.replace(/\^([+-]?\d+|[ni])/g, (m, exp) => {
    const sup = toSuperscript(exp)
    return sup ? sup : m
  })

  return text
}

export function createStreamMathFormatter() {
  let pending = ''
  let inCodeFence = false

  function processAll(input) {
    let out = ''
    let i = 0
    while (i < input.length) {
      const fenceIdx = input.indexOf('```', i)
      if (fenceIdx === -1) {
        const chunk = input.slice(i)
        out += inCodeFence ? chunk : formatOutsideCode(chunk)
        break
      }

      const before = input.slice(i, fenceIdx)
      out += inCodeFence ? before : formatOutsideCode(before)
      out += '```'
      inCodeFence = !inCodeFence
      i = fenceIdx + 3
    }
    return out
  }

  return {
    push(delta) {
      pending += delta
      const keepTail = 48
      const safeLen = Math.max(0, pending.length - keepTail)
      const safePart = pending.slice(0, safeLen)
      pending = pending.slice(safeLen)
      return safePart ? processAll(safePart) : ''
    },
    flush() {
      const rest = pending
      pending = ''
      return rest ? processAll(rest) : ''
    },
  }
}

