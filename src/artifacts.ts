import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  candidateDebateMarkdown,
  debateMarkdown,
  demoScriptMarkdown,
  improvementRationaleMarkdown,
  improvementsMarkdown,
  judgeDecisionMarkdown,
  postBuildDebateMarkdown,
  scorecardMarkdown,
  traceMarkdown,
} from "./markdown.js"
import type {
  DebateSummary,
  ImprovementReport,
  KnowledgeTraceEntry,
  PipelineResult,
  Scorecard,
} from "./types.js"

export async function writeArtifacts(outputPath: string, result: PipelineResult): Promise<void> {
  const artifactsPath = join(outputPath, "artifacts")
  await mkdir(artifactsPath, { recursive: true })
  await Promise.all([
    writeJson(join(artifactsPath, "debate.json"), result.debateSummary),
    writeFile(join(artifactsPath, "debate.md"), debateMarkdown(result.debateSummary)),
    writeJson(join(artifactsPath, "candidate-debate.json"), result.candidateDebate),
    writeFile(
      join(artifactsPath, "candidate-debate.md"),
      candidateDebateMarkdown(result.candidateDebate),
    ),
    writeJson(join(artifactsPath, "judge-decision.json"), result.judgeDecision),
    writeFile(
      join(artifactsPath, "judge-decision.md"),
      judgeDecisionMarkdown(result.judgeDecision),
    ),
    writeJson(join(artifactsPath, "post-build-debate.json"), result.postBuildDebate),
    writeFile(
      join(artifactsPath, "post-build-debate.md"),
      postBuildDebateMarkdown(result.postBuildDebate),
    ),
    writeJson(join(artifactsPath, "improvement-rationale.json"), result.improvementRationale),
    writeFile(
      join(artifactsPath, "improvement-rationale.md"),
      improvementRationaleMarkdown(result.improvementRationale),
    ),
    writeJson(join(artifactsPath, "scorecard.json"), result.finalScorecard),
    writeFile(join(artifactsPath, "scorecard.md"), scorecardMarkdown(result.finalScorecard)),
    writeJson(join(artifactsPath, "knowledge-trace.json"), result.knowledgeTrace),
    writeFile(join(artifactsPath, "knowledge-trace.md"), traceMarkdown(result.knowledgeTrace)),
    writeJson(join(artifactsPath, "improvements.json"), result.improvementReport),
    writeFile(
      join(artifactsPath, "improvements.md"),
      improvementsMarkdown(result.improvementReport),
    ),
    writeJson(join(artifactsPath, "demo-script.json"), { script: result.demoScript }),
    writeFile(join(artifactsPath, "demo-script.md"), demoScriptMarkdown(result.demoScript)),
    writeJson(join(artifactsPath, "run.json"), summarizeRun(result)),
  ])
}

function summarizeRun(result: PipelineResult): {
  readonly debateSummary: DebateSummary
  readonly candidateDebate: PipelineResult["candidateDebate"]
  readonly judgeDecision: PipelineResult["judgeDecision"]
  readonly finalScorecard: Scorecard
  readonly postBuildDebate: PipelineResult["postBuildDebate"]
  readonly knowledgeTrace: readonly KnowledgeTraceEntry[]
  readonly improvementReport: ImprovementReport
  readonly improvementRationale: PipelineResult["improvementRationale"]
} {
  return {
    debateSummary: result.debateSummary,
    candidateDebate: result.candidateDebate,
    judgeDecision: result.judgeDecision,
    finalScorecard: result.finalScorecard,
    postBuildDebate: result.postBuildDebate,
    knowledgeTrace: result.knowledgeTrace,
    improvementReport: result.improvementReport,
    improvementRationale: result.improvementRationale,
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}
