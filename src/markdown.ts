import type { DebateSummary, ImprovementReport, KnowledgeTraceEntry, Scorecard } from "./types.js"

export function debateMarkdown(debate: DebateSummary): string {
  const positions = debate.positions
    .map(
      (position) =>
        `### ${position.agent}\n\n${position.position}\n\nPriorities:\n${bullets(position.priorities)}\n`,
    )
    .join("\n")
  return `# Multi-Agent Debate\n\nPrompt: ${debate.prompt}\n\n${positions}\n## Judge Priorities\n\n${bullets(
    debate.judgePriorities,
  )}\n\n## Conflict Resolutions\n\n${bullets(debate.conflictResolutions)}\n`
}

export function scorecardMarkdown(scorecard: Scorecard): string {
  const rows = scorecard.dimensions
    .map((dimension) => `| ${dimension.label} | ${dimension.score} | ${dimension.rationale} |`)
    .join("\n")
  return `# Coreplay Scorecard\n\nThreshold: ${scorecard.threshold}\n\nTotal: ${scorecard.total}/35\n\nFun enough: ${
    scorecard.funEnough ? "yes" : "no"
  }\n\n| Dimension | Score | Rationale |\n| --- | ---: | --- |\n${rows}\n`
}

export function traceMarkdown(trace: readonly KnowledgeTraceEntry[]): string {
  const entries = trace
    .map((entry) => `- **${entry.decision}** (${entry.source}) — ${entry.rationale}`)
    .join("\n")
  return `# Knowledge Trace\n\n${entries}\n`
}

export function improvementsMarkdown(report: ImprovementReport): string {
  const rows = report.improvements
    .map(
      (improvement) =>
        `| ${improvement.dimension} | ${improvement.change} | ${improvement.rationale} |`,
    )
    .join("\n")
  return `# Before/After Improvement Report\n\nBefore: ${report.beforeTotal}/35\nAfter: ${
    report.afterTotal
  }/35\n\nSelected weaknesses:\n${bullets(report.selectedWeaknesses)}\n\n${report.scopeDiscipline}\n\n| Dimension | Change | Rationale |\n| --- | --- | --- |\n${rows}\n`
}

export function demoScriptMarkdown(script: string): string {
  return `# 2-Minute Demo Script\n\n${script}\n`
}

function bullets(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join("\n")
}
