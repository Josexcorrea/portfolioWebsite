/**
 * Sync RAG knowledge from portfolio source (src/data/content).
 * Reads projects.ts and experiences.ts and writes server/knowledge/documents.json
 * so the AI has the same info as the website.
 * Run: node server/scripts/sync-knowledge-from-source.js
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..', '..')
const SRC = path.join(ROOT, 'src', 'data', 'content')
const KNOWLEDGE = path.join(__dirname, '..', 'knowledge')
const DOCUMENTS_PATH = path.join(KNOWLEDGE, 'documents.json')

function isStringLiteral(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
}

function readSourceFile(filePath) {
  const content = readFileSync(filePath, 'utf8')
  return ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
}

function getPropString(obj, key) {
  const prop = obj.properties.find(
    (p) =>
      ts.isPropertyAssignment(p) &&
      ((ts.isIdentifier(p.name) && p.name.text === key) || (isStringLiteral(p.name) && p.name.text === key))
  )
  if (!prop || !ts.isPropertyAssignment(prop)) return null
  if (isStringLiteral(prop.initializer)) return prop.initializer.text
  return null
}

function getPropStringArray(obj, key) {
  const prop = obj.properties.find(
    (p) =>
      ts.isPropertyAssignment(p) &&
      ((ts.isIdentifier(p.name) && p.name.text === key) || (isStringLiteral(p.name) && p.name.text === key))
  )
  if (!prop || !ts.isPropertyAssignment(prop)) return []
  if (!ts.isArrayLiteralExpression(prop.initializer)) return []
  const out = []
  for (const el of prop.initializer.elements) {
    if (isStringLiteral(el)) out.push(el.text)
  }
  return out
}

function extractExportedArrayOfObjects(sourceFile, exportName) {
  /** @type {ts.ArrayLiteralExpression | null} */
  let arr = null

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return
    const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    if (!isExported) return

    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== exportName) continue
      if (!decl.initializer || !ts.isArrayLiteralExpression(decl.initializer)) continue
      arr = decl.initializer
    }
  })

  if (!arr) return []

  const out = []
  for (const el of arr.elements) {
    if (!ts.isObjectLiteralExpression(el)) continue
    out.push(el)
  }
  return out
}

function extractProjects() {
  const filePath = path.join(SRC, 'projects.ts')
  if (!existsSync(filePath)) return []
  const sf = readSourceFile(filePath)

  const nodes = extractExportedArrayOfObjects(sf, 'projects')
  return nodes
    .map((obj) => {
      const id = getPropString(obj, 'id')
      const name = getPropString(obj, 'name')
      const tagline = getPropString(obj, 'tagline') || ''
      const description = getPropString(obj, 'description') || ''
      const badges = getPropStringArray(obj, 'badges')
      return id && name ? { id, name, tagline, description, badges } : null
    })
    .filter(Boolean)
}

function extractExperiences() {
  const filePath = path.join(SRC, 'experiences.ts')
  if (!existsSync(filePath)) return []
  const sf = readSourceFile(filePath)

  const nodes = extractExportedArrayOfObjects(sf, 'experiences')
  return nodes
    .map((obj) => {
      const id = getPropString(obj, 'id')
      const type = getPropString(obj, 'type') || 'job'
      const title = getPropString(obj, 'title')
      const subtitle = getPropString(obj, 'subtitle') || ''
      const period = getPropString(obj, 'period') || ''
      const details = getPropStringArray(obj, 'details')
      const badges = getPropStringArray(obj, 'badges')
      return id && title ? { id, type, title, subtitle, period, details, badges } : null
    })
    .filter(Boolean)
}

function buildDocuments(projects, experiences) {
  const docs = []

  for (const p of projects) {
    const tech = p.badges?.length ? ` Technologies: ${p.badges.join(', ')}.` : ''
    const desc = p.description.trim().replace(/\.$/, '')
    docs.push({
      title: p.name,
      content: `Project: ${p.name}. Tagline: ${p.tagline}. ${desc}.${tech}`,
    })
  }

  for (const e of experiences) {
    const detailsText = e.details?.length ? e.details.join(' ') : ''
    const skills = e.badges?.length ? ` Skills: ${e.badges.join(', ')}.` : ''
    const typeLabel = e.type === 'education' ? 'Education' : 'Role'
    docs.push({
      title: `${e.title} — ${e.subtitle}`,
      content: `${typeLabel}: ${e.title}. ${e.subtitle}. Period: ${e.period}. ${detailsText}${skills}`,
    })
  }

  return docs
}

function main() {
  const projects = extractProjects()
  const experiences = extractExperiences()

  console.log(`Synced: ${projects.length} projects, ${experiences.length} experiences.`)

  const documents = buildDocuments(projects, experiences)
  writeFileSync(DOCUMENTS_PATH, JSON.stringify(documents, null, 2), 'utf8')
  console.log(`Wrote ${documents.length} documents to ${DOCUMENTS_PATH}.`)
}

main()
