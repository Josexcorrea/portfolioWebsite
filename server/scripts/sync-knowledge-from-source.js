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
      const mission = getPropString(obj, 'mission') || ''
      const system = getPropString(obj, 'system') || ''
      const impact = getPropStringArray(obj, 'impact')
      const keyLearnings = getPropStringArray(obj, 'keyLearnings')
      const badges = getPropStringArray(obj, 'badges')
      const code = getPropString(obj, 'code') || ''
      const link = getPropString(obj, 'link') || ''
      return id && name
        ? { id, name, tagline, description, mission, system, impact, keyLearnings, badges, code, link }
        : null
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
      const mission = getPropString(obj, 'mission') || ''
      const system = getPropString(obj, 'system') || ''
      const impact = getPropStringArray(obj, 'impact')
      const keyLearnings = getPropStringArray(obj, 'keyLearnings')
      const badges = getPropStringArray(obj, 'badges')
      return id && title
        ? { id, type, title, subtitle, period, mission, system, impact, keyLearnings, badges }
        : null
    })
    .filter(Boolean)
}

function buildDocuments(projects, experiences) {
  const docs = []

  for (const p of projects) {
    const tech = p.badges?.length ? ` Tools & technologies: ${p.badges.join(', ')}.` : ''
    const desc = p.description.trim().replace(/\.$/, '')
    const mission = p.mission ? ` Mission: ${p.mission.trim()}` : ''
    const system = p.system ? ` System: ${p.system.trim()}` : ''
    const impact =
      p.impact?.length ? ` Impact: ${p.impact.map((x) => x.trim()).join(' ')}` : ''
    const learn =
      p.keyLearnings?.length
        ? ` Key learnings: ${p.keyLearnings.map((x) => x.trim()).join(' ')}`
        : ''
    const repo = p.code?.trim() ? ` Public source code: ${p.code.trim()}.` : ''
    const live = p.link?.trim() ? ` Public URL (optional): ${p.link.trim()}.` : ''
    docs.push({
      title: p.name,
      content: `Project: ${p.name}. Tagline: ${p.tagline}. ${desc}.${mission}${system}${impact}${learn}${tech}${repo}${live}`,
    })
  }

  for (const e of experiences) {
    const mission = e.mission ? ` Mission: ${e.mission.trim()}` : ''
    const system = e.system ? ` System: ${e.system.trim()}` : ''
    const impact =
      e.impact?.length ? ` Impact: ${e.impact.map((x) => x.trim()).join(' ')}` : ''
    const learn =
      e.keyLearnings?.length
        ? ` Key learnings: ${e.keyLearnings.map((x) => x.trim()).join(' ')}`
        : ''
    const skills = e.badges?.length ? ` Skills: ${e.badges.join(', ')}.` : ''
    const typeLabel = e.type === 'education' ? 'Education' : 'Role'
    docs.push({
      title: `${e.title} — ${e.subtitle}`,
      content: `${typeLabel}: ${e.title}. ${e.subtitle}. Period: ${e.period}.${mission}${system}${impact}${learn}${skills}`,
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
