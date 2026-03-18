export function makeId(prefix = 'msg'): string {
  // crypto.randomUUID is available in modern browsers; fallback keeps ids stable enough for UI keys.
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  return `${prefix}_${id}`
}

