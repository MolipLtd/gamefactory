import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import type { KnowledgeDocument } from "./types.js"

const SUPPORTED_EXTENSIONS = [".md", ".markdown", ".txt"] as const
const MAX_PRINCIPLES_PER_DOCUMENT = 14

const PRINCIPLE_KEYWORDS = [
  "market",
  "audience",
  "pitch",
  "experience",
  "core loop",
  "core mechanic",
  "ftue",
  "hook",
  "clarity",
  "feedback",
  "first tap",
  "first win",
  "fair",
  "prototype",
  "시장성",
  "타겟",
  "유저",
  "가치",
  "욕망",
  "차별화",
  "한 문장",
  "15초",
  "20분",
  "코어 루프",
  "핵심 재미",
  "메카닉",
  "실행 가능",
  "프로토타입",
  "첫 30초",
  "첫 조작",
  "첫 승리",
  "목표",
  "시각적 큐",
  "보상",
  "마찰",
  "튜토리얼",
  "공정",
  "피드백",
  "성취",
] as const

export async function loadKnowledgeDocuments(
  docsPath: string,
): Promise<readonly KnowledgeDocument[]> {
  const entries = await readdir(docsPath, { withFileTypes: true })
  const files = entries
    .filter(
      (entry) =>
        entry.isFile() && !entry.name.startsWith("._") && hasSupportedExtension(entry.name),
    )
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
  const principles = unique(documents.flatMap((document) => document.principles)).slice(0, 48)
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
    .map((line) => normalizePrincipleLine(line))
    .filter((line) => line.length > 0)

  return unique([
    ...derivePrinciplesFromContent(content),
    ...lines.filter((line) => isPrincipleLine(line)),
  ]).slice(0, MAX_PRINCIPLES_PER_DOCUMENT)
}

function isPrincipleLine(line: string): boolean {
  const normalized = line.toLowerCase()
  if (line.startsWith("![") || line.startsWith("[") || line.length > 180) {
    return false
  }
  return PRINCIPLE_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function normalizePrincipleLine(line: string): string {
  return line
    .trim()
    .replace(/^[-*]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/^#+\s+/, "")
    .replaceAll("**", "")
    .replaceAll("`", "")
    .replaceAll("|", " ")
    .replace(/\s+/g, " ")
    .trim()
}

function derivePrinciplesFromContent(content: string): readonly string[] {
  const normalized = content.toLowerCase()
  const principles: string[] = []
  if (hasAny(normalized, ["한 문장", "15초", "pitch"])) {
    principles.push("Concepts must be explainable in one sentence or a short video pitch.")
  }
  if (hasAny(normalized, ["첫 30초", "strong hook", "강력한 도입"])) {
    principles.push("FTUE must create a strong hook in the first 30 seconds.")
  }
  if (hasAny(normalized, ["첫 조작", "first tap", "first action"])) {
    principles.push("The first action must expose the core fun immediately.")
  }
  if (hasAny(normalized, ["first win", "첫 승리", "first tap"])) {
    principles.push("Map the first-session funnel from first tap to first win.")
  }
  if (hasAny(normalized, ["시각적 큐", "visual cue", "feedback", "피드백"])) {
    principles.push("Use visual cues and responsive feedback to keep goals readable.")
  }
  if (hasAny(normalized, ["마찰", "회원가입", "forced", "paywall"])) {
    principles.push("Minimize FTUE friction such as login, forced waits, and paywalls.")
  }
  if (hasAny(normalized, ["시장성", "market", "audience", "타겟"])) {
    principles.push("Validate market appeal, target audience desire, and user value.")
  }
  if (hasAny(normalized, ["코어 루프", "핵심 재미", "core loop", "mechanic"])) {
    principles.push("The core loop should be simple, repeatable, and addictive.")
  }
  if (hasAny(normalized, ["실행 가능", "프로토타입", "development"])) {
    principles.push("Prefer concepts that can be prototyped quickly with low execution risk.")
  }
  if (hasAny(normalized, ["보상", "성취", "reward"])) {
    principles.push("Give fast, clear rewards tied to the player's action.")
  }
  return principles
}

function hasAny(content: string, needles: readonly string[]): boolean {
  return needles.some((needle) => content.includes(needle))
}

function unique(items: readonly string[]): readonly string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const item of items) {
    if (!seen.has(item)) {
      seen.add(item)
      result.push(item)
    }
  }
  return result
}
