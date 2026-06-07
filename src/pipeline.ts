import { mkdir, rm } from "node:fs/promises"
import { join } from "node:path"
import {
  createDebateSummary,
  createKnowledgeTrace,
  decideWinningConcept,
  runCandidateDebate,
  runPostBuildDebate,
} from "./agents.js"
import { writeArtifacts } from "./artifacts.js"
import { loadKnowledgeDocuments, summarizeDocumentPrinciples } from "./documents.js"
import {
  createImprovementRationale,
  createImprovementReport,
  improveGameSpec,
  selectJudgeImprovementPriorities,
} from "./improve.js"
import {
  createInitialGameSpec,
  createMechanicTrace,
  generateCandidateConcepts,
} from "./mechanics.js"
import { writePrototype } from "./prototype.js"
import { writeReviewPage } from "./review.js"
import { evaluateGameSpec } from "./rubric.js"
import { serveForDemo } from "./server.js"
import type { PipelineInput, PipelineResult } from "./types.js"
import { CorePlayError } from "./util.js"

export async function runCorePlayPipeline(input: PipelineInput): Promise<PipelineResult> {
  await rm(input.outputPath, { recursive: true, force: true })
  await mkdir(input.outputPath, { recursive: true })

  const documents = await loadKnowledgeDocuments(input.docsPath)
  const principles = summarizeDocumentPrinciples(documents)
  const candidates = generateCandidateConcepts(input.prompt, principles)
  const candidateDebate = runCandidateDebate(input.prompt, candidates, documents, principles)
  const judgeDecision = decideWinningConcept(candidateDebate)
  const selectedConcept = candidates.find(
    (candidate) => candidate.id === judgeDecision.selectedCandidateId,
  )
  if (selectedConcept === undefined) {
    throw new CorePlayError("Judge selected a missing candidate")
  }

  const initialSpec = createInitialGameSpec(selectedConcept)
  const initialScorecard = evaluateGameSpec(initialSpec)
  const postBuildDebate = runPostBuildDebate(initialSpec, principles)
  const improvementPriorities = selectJudgeImprovementPriorities(initialScorecard, postBuildDebate)
  const improved = improveGameSpec(initialSpec, improvementPriorities)
  const finalScorecard = evaluateGameSpec(improved.spec)
  const debateSummary = createDebateSummary(input.prompt, documents, improved.spec, judgeDecision)
  const knowledgeTrace = createKnowledgeTrace(
    documents,
    principles,
    createMechanicTrace(selectedConcept),
  )
  const improvementReport = createImprovementReport(
    initialScorecard,
    finalScorecard,
    improvementPriorities,
    improved.improvements,
  )
  const improvementRationale = createImprovementRationale(
    improved.improvements,
    initialScorecard,
    postBuildDebate,
    principles,
  )
  const prototypePath = await writePrototype(input.outputPath, improved.spec)
  const demoScript = createDemoScript(improved.spec.title, finalScorecard.total)

  const partialResult = {
    prompt: input.prompt,
    documents,
    candidateDebate,
    judgeDecision,
    debateSummary,
    postBuildDebate,
    knowledgeTrace,
    gameDesign: improved.spec,
    initialScorecard,
    improvementPriorities,
    improvementReport,
    improvementRationale,
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
