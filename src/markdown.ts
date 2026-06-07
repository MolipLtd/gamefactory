import type {
  CandidateDebate,
  DebateSummary,
  ImprovementRationale,
  ImprovementReport,
  JudgeDecision,
  KnowledgeTraceEntry,
  PostBuildDebate,
  Scorecard,
} from "./types.js"

export function candidateDebateMarkdown(debate: CandidateDebate): string {
  const candidates = debate.candidates
    .map(
      (candidate) =>
        `## ${candidate.title}\n\nMechanic: ${candidate.mechanicId}\n\n${candidate.theme}\n\nMarket hook: ${candidate.marketHook}\n\nKnowledge fit:\n${bullets(
          candidate.knowledgeFit,
        )}\n`,
    )
    .join("\n")
  const evaluations = debate.evaluations
    .map(
      (evaluation) =>
        `### ${evaluation.agent} on ${evaluation.candidateId}\n\nDocument evidence:\n${bullets(
          evaluation.evidence,
        )}\n\nStrengths:\n${bullets(
          evaluation.strengths,
        )}\n\nFatal risks:\n${bullets(evaluation.fatalRisks)}\n\nConcrete improvements:\n${bullets(
          evaluation.concreteImprovements,
        )}\n\nScore: ${evaluation.score}\n`,
    )
    .join("\n")
  return `# Candidate Debate\n\nPrompt: ${debate.prompt}\n\n## Loaded Documents\n\n${bullets(
    debate.loadedDocuments,
  )}\n\n## Extracted Knowledge Principles\n\n${bullets(
    debate.knowledgePrinciples,
  )}\n\n${candidates}\n# Agent Evaluations\n\n${evaluations}`
}

export function judgeDecisionMarkdown(decision: JudgeDecision): string {
  return `# Judge Decision\n\nSelected concept: **${decision.selectedTitle}** (${decision.selectedCandidateId})\n\n${decision.rationale}\n\n## Build Priorities\n\n${bullets(
    decision.buildPriorities,
  )}\n\n## Knowledge Evidence\n\n${bullets(
    decision.knowledgeEvidence,
  )}\n\n## Rejected Candidates\n\n${bullets(decision.rejectedCandidates)}\n`
}

export function postBuildDebateMarkdown(debate: PostBuildDebate): string {
  const evaluations = debate.evaluations
    .map(
      (evaluation) =>
        `## ${evaluation.agent}\n\nDocument evidence:\n${bullets(
          evaluation.evidence,
        )}\n\nStrengths:\n${bullets(
          evaluation.strengths,
        )}\n\nFatal risks:\n${bullets(evaluation.fatalRisks)}\n\nConcrete improvements:\n${bullets(
          evaluation.concreteImprovements,
        )}\n`,
    )
    .join("\n")
  return `# Post-Build Debate\n\n${debate.judgeSummary}\n\n${evaluations}`
}

export function improvementRationaleMarkdown(rationale: ImprovementRationale): string {
  const selected = rationale.selected
    .map((improvement) => `- **${improvement.dimension}**: ${improvement.change}`)
    .join("\n")
  return `# Improvement Rationale\n\n${rationale.judgeSummary}\n\n## Selected Top 3\n\n${selected}\n\n## Evidence\n\n${bullets(
    rationale.evidence,
  )}\n\n## Knowledge Evidence\n\n${bullets(rationale.knowledgeEvidence)}\n`
}

export function debateMarkdown(debate: DebateSummary): string {
  const positions = debate.positions
    .map(
      (position) =>
        `### ${position.agent}\n\n${position.position}\n\nPriorities:\n${bullets(
          position.priorities,
        )}\n\nEvidence:\n${bullets(position.evidence)}\n`,
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
