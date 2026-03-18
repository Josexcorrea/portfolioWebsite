export function writeNdjson(res, obj) {
  res.write(JSON.stringify(obj) + '\n')
  res.flush?.()
}

