import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import {
  debateMarkdown,
  demoScriptMarkdown,
  improvementsMarkdown,
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
  readonly finalScorecard: Scorecard
  readonly knowledgeTrace: readonly KnowledgeTraceEntry[]
  readonly improvementReport: ImprovementReport
} {
  return {
    debateSummary: result.debateSummary,
    finalScorecard: result.finalScorecard,
    knowledgeTrace: result.knowledgeTrace,
    improvementReport: result.improvementReport,
  }
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
}
