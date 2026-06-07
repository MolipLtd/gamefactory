import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import type { KnowledgeDocument } from "./types.js"

const SUPPORTED_EXTENSIONS = [".md", ".markdown", ".txt"] as const

export async function loadKnowledgeDocuments(
  docsPath: string,
): Promise<readonly KnowledgeDocument[]> {
  const entries = await readdir(docsPath, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && hasSupportedExtension(entry.name))
    .map((entry) => entry.name)
    .sort()

  const documents: KnowledgeDocument[] = []
  for (const file of files) {
    const path = join(docsPath, file)
    const content = await readFile(path, "utf8")
    documents.push({
      path,
      title: extractTitle(content, file),
      content,
      principles: extractPrinciples(content),
    })
  }
  return documents
}

export function summarizeDocumentPrinciples(
  documents: readonly KnowledgeDocument[],
): readonly string[] {
  const principles = documents.flatMap((document) => document.principles)
  if (principles.length > 0) {
    return principles
  }
  return [
    "User documents are primary; embedded game-design heuristics are supplemental.",
    "Keep the prototype narrow, reproducible, and demo-stable.",
  ]
}

function hasSupportedExtension(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension))
}

function extractTitle(content: string, fallback: string): string {
  const heading = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "))
  return heading === undefined ? fallback : heading.replace(/^#\s+/, "")
}

function extractPrinciples(content: string): readonly string[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  return lines
    .filter((line) => isPrincipleLine(line))
    .map((line) => line.replace(/^[-*]\s+/, ""))
    .slice(0, 8)
}

function isPrincipleLine(line: string): boolean {
  const normalized = line.toLowerCase()
  return (
    line.startsWith("- ") ||
    line.startsWith("* ") ||
    normalized.includes("prioritize") ||
    normalized.includes("do not") ||
    normalized.includes("primary") ||
    normalized.includes("constraint")
  )
}
