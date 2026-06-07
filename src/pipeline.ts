import { mkdir, rm } from "node:fs/promises"
import { join } from "node:path"
import { createKnowledgeTrace, runDeterministicDebate } from "./agents.js"
import { writeArtifacts } from "./artifacts.js"
import { loadKnowledgeDocuments, summarizeDocumentPrinciples } from "./documents.js"
import { createImprovementReport, improveGameSpec } from "./improve.js"
import { createInitialGameSpec, createMechanicTrace, selectMechanic } from "./mechanics.js"
import { writePrototype } from "./prototype.js"
import { writeReviewPage } from "./review.js"
import { evaluateGameSpec, selectImprovementPriorities } from "./rubric.js"
import { serveForDemo } from "./server.js"
import type { PipelineInput, PipelineResult } from "./types.js"

export async function runCorePlayPipeline(input: PipelineInput): Promise<PipelineResult> {
  await rm(input.outputPath, { recursive: true, force: true })
  await mkdir(input.outputPath, { recursive: true })

  const documents = await loadKnowledgeDocuments(input.docsPath)
  const principles = summarizeDocumentPrinciples(documents)
  const mechanic = selectMechanic(input.prompt, principles)
  const initialSpec = createInitialGameSpec(mechanic)
  const initialScorecard = evaluateGameSpec(initialSpec)
  const improvementPriorities = selectImprovementPriorities(initialScorecard)
  const improved = improveGameSpec(initialSpec, improvementPriorities)
  const finalScorecard = evaluateGameSpec(improved.spec)
  const debateSummary = runDeterministicDebate(input.prompt, documents, principles, improved.spec)
  const knowledgeTrace = createKnowledgeTrace(documents, createMechanicTrace(mechanic))
  const improvementReport = createImprovementReport(
    initialScorecard,
    finalScorecard,
    improvementPriorities,
    improved.improvements,
  )
  const prototypePath = await writePrototype(input.outputPath, improved.spec)
  const demoScript = createDemoScript(improved.spec.title, finalScorecard.total)

  const partialResult = {
    prompt: input.prompt,
    documents,
    debateSummary,
    knowledgeTrace,
    gameDesign: improved.spec,
    initialScorecard,
    improvementPriorities,
    improvementReport,
    finalScorecard,
    demoScript,
    outputPath: input.outputPath,
    reviewPagePath: join(input.outputPath, "index.html"),
    prototypePath,
    forbiddenFeaturesAbsent: true,
  } satisfies PipelineResult

  const reviewPagePath = await writeReviewPage(input.outputPath, partialResult)
  const result = { ...partialResult, reviewPagePath } satisfies PipelineResult
  await writeArtifacts(input.outputPath, result)
  if (input.serve) {
    const url = await serveForDemo(input.outputPath, 4173, 1500)
    console.log(`Review page served briefly at ${url}`)
  }
  return result
}

function createDemoScript(title: string, score: number): string {
  return [
    `Open the review page and introduce ${title} as a generated hybrid-casual puzzle prototype.`,
    "Explain that user documents are the primary grounding source and embedded heuristics are supplemental.",
    "Play level 1 to show the core matching mechanic, immediate feedback, and first success.",
    "Advance through the three-level progression and point out the lightweight badge collection goal.",
    `Show the scorecard, final ${score}/35 result, knowledge trace, and top-3 weakness improvement report.`,
  ].join("\n\n")
}
