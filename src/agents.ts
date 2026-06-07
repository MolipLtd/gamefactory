import type {
  AgentPosition,
  CandidateConcept,
  CandidateDebate,
  CandidateEvaluation,
  DebateSummary,
  GameSpec,
  JudgeDecision,
  KnowledgeDocument,
  KnowledgeTraceEntry,
  PostBuildDebate,
} from "./types.js"
import { mustGet } from "./util.js"

export function runCandidateDebate(
  prompt: string,
  candidates: readonly CandidateConcept[],
  documents: readonly KnowledgeDocument[],
  principles: readonly string[],
): CandidateDebate {
  return {
    prompt,
    loadedDocuments: documents.map((document) => document.path),
    knowledgePrinciples: principles,
    candidates,
    evaluations: candidates.flatMap((candidate) => evaluateCandidate(candidate, principles)),
  }
}

export function decideWinningConcept(debate: CandidateDebate): JudgeDecision {
  const ranked = debate.candidates
    .map((candidate) => ({
      candidate,
      score: debate.evaluations
        .filter((evaluation) => evaluation.candidateId === candidate.id)
        .reduce((sum, evaluation) => sum + evaluation.score, 0),
    }))
    .sort((left, right) => right.score - left.score)
  const winner = mustGet(ranked, 0, "winning candidate").candidate
  return {
    selectedCandidateId: winner.id,
    selectedTitle: winner.title,
    rationale: `${winner.title} best satisfies the loaded user knowledge: one-sentence clarity, fast FTUE feedback, first-win funnel, and low-risk prototype feasibility.`,
    knowledgeEvidence: winner.knowledgeFit,
    rejectedCandidates: ranked
      .slice(1)
      .map(
        (entry) =>
          `${entry.candidate.title}: lower combined agent confidence against the loaded success factors`,
      ),
    buildPriorities: ["5-second clarity", "immediate feedback", "first success"],
  }
}

export function runPostBuildDebate(spec: GameSpec, principles: readonly string[]): PostBuildDebate {
  const concept: CandidateConcept = {
    id: "built-prototype",
    title: spec.title,
    mechanicId: spec.mechanicId,
    theme: spec.theme,
    rules: spec.rules,
    marketHook: "generated playable prototype",
    metaProgression: spec.metaProgression,
    knowledgeFit: principles.slice(0, 4),
  }
  const evaluations = evaluateCandidate(concept, [
    ...principles,
    "Prototype is now concrete; post-build review prioritizes visible clarity and stability.",
  ])
  return {
    evaluations,
    judgeSummary:
      "Post-build Judge combines rubric weaknesses with agent risks; top improvements must address only clarity, feedback, and first success unless the scorecard exposes worse issues.",
  }
}

export function createDebateSummary(
  prompt: string,
  documents: readonly KnowledgeDocument[],
  spec: GameSpec,
  judgeDecision: JudgeDecision,
): DebateSummary {
  const documentEvidence = documents.flatMap((document) => document.principles).slice(0, 3)
  const positions: readonly AgentPosition[] = [
    {
      agent: "Market Agent",
      position: `${spec.title} fits U.S. hybrid-casual expectations by pairing simple input with collection progress.`,
      priorities: ["clear first action", "visible reward loop", "short-session progression"],
      evidence: documentEvidence,
    },
    {
      agent: "Coreplay Agent",
      position:
        "Moment-to-moment play needs stronger first-action feedback and a fast first success.",
      priorities: ["5-second clarity", "immediate feedback", "first success"],
      evidence: ["Default rubric prioritizes clarity, feedback, and first success."],
    },
    {
      agent: "Level Design Agent",
      position:
        "Three levels should introduce, vary, and test the mechanic without random-feeling failures.",
      priorities: ["intro level", "choice level", "combo level"],
      evidence: ["Seed requires exactly 3 levels and fair challenge."],
    },
    {
      agent: "Production Agent",
      position:
        "Static HTML/CSS/JS output is the safest demo-stable path with no backend or external APIs.",
      priorities: ["static prototype", "restart button", "local review page"],
      evidence: ["Seed excludes backend, external APIs, auth, and database."],
    },
  ]

  return {
    prompt,
    positions,
    judgePriorities: judgeDecision.buildPriorities,
    conflictResolutions: buildConflictResolutions(documents),
  }
}

export function createKnowledgeTrace(
  documents: readonly KnowledgeDocument[],
  principles: readonly string[],
  extra: KnowledgeTraceEntry,
): readonly KnowledgeTraceEntry[] {
  const documentTrace = documents.map((document) => ({
    decision: `Treat ${document.title} as primary grounding.`,
    source: "user-document" as const,
    rationale:
      "User-provided game knowledge documents govern philosophy, rubric definitions, constraints, and do-not-build rules.",
  }))
  return [
    ...documentTrace,
    {
      decision: "Apply extracted user success factors to candidate idea validation.",
      source: "user-document",
      rationale: principles.slice(0, 6).join("; "),
    },
    extra,
    {
      decision: "Use offline deterministic agents instead of an LLM provider.",
      source: "judge-resolution",
      rationale:
        "The Seed requires the full demo path to work without network access, API keys, or external dependencies.",
    },
  ]
}

function evaluateCandidate(
  candidate: CandidateConcept,
  principles: readonly string[],
): readonly CandidateEvaluation[] {
  const evidence = knowledgeEvidenceFor(candidate, principles)
  return [
    {
      agent: "Market Agent",
      candidateId: candidate.id,
      evidence: evidence.market,
      strengths: [candidate.marketHook, "simple theme readable in a short demo"],
      fatalRisks: marketRisk(candidate),
      concreteImprovements: [
        "make the first reward visible",
        "show collection progress on the first screen",
      ],
      score: candidate.mechanicId === "merge-lane" ? 18 : 17,
    },
    {
      agent: "Coreplay Agent",
      candidateId: candidate.id,
      evidence: evidence.coreplay,
      strengths: ["one clear core action", "combo potential from repeated choices"],
      fatalRisks: ["weak first-action feedback would make the game feel inert"],
      concreteImprovements: ["add pulse feedback", "add a fast first success cue"],
      score: candidate.mechanicId === "path-link" ? 19 : 16,
    },
    {
      agent: "Level Design Agent",
      candidateId: candidate.id,
      evidence: evidence.level,
      strengths: ["three-level ramp can introduce, vary, then test the mechanic"],
      fatalRisks: ["too many rules would obscure fairness"],
      concreteImprovements: ["keep one goal per level", "show moves and target progress"],
      score: candidate.mechanicId === "path-link" ? 18 : 15,
    },
    {
      agent: "Production Agent",
      candidateId: candidate.id,
      evidence: evidence.production,
      strengths: ["static HTML prototype is feasible", ...candidate.knowledgeFit.slice(0, 2)],
      fatalRisks: productionRisk(candidate),
      concreteImprovements: ["avoid physics", "prefer deterministic tile interactions"],
      score: candidate.mechanicId === "path-link" ? 19 : 15,
    },
  ]
}

function knowledgeEvidenceFor(
  candidate: CandidateConcept,
  principles: readonly string[],
): {
  readonly market: readonly string[]
  readonly coreplay: readonly string[]
  readonly level: readonly string[]
  readonly production: readonly string[]
} {
  return {
    market: unique(
      pickEvidence(principles, ["market", "audience", "user value", "one sentence"]).concat(
        candidate.knowledgeFit.slice(0, 1),
      ),
    ),
    coreplay: unique(
      pickEvidence(principles, ["core", "first action", "feedback", "reward"]).concat(
        candidate.knowledgeFit.slice(1, 2),
      ),
    ),
    level: unique(
      pickEvidence(principles, ["first win", "goal", "fair", "visual cue"]).concat(
        candidate.knowledgeFit.slice(2, 3),
      ),
    ),
    production: unique(
      pickEvidence(principles, ["prototype", "friction", "login", "paywall"]).concat(
        candidate.knowledgeFit.slice(3, 4),
      ),
    ),
  }
}

function pickEvidence(
  principles: readonly string[],
  needles: readonly string[],
): readonly string[] {
  const matches = principles.filter((principle) => {
    const normalized = principle.toLowerCase()
    return needles.some((needle) => normalized.includes(needle))
  })
  return (matches.length > 0 ? matches : principles).slice(0, 3)
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

function marketRisk(candidate: CandidateConcept): readonly string[] {
  if (candidate.mechanicId === "shape-drop") {
    return ["spatial fit may read more midcore than hybrid-casual if controls are unclear"]
  }
  return ["collection goal must be visible or the play may feel like a one-off puzzle"]
}

function productionRisk(candidate: CandidateConcept): readonly string[] {
  if (candidate.mechanicId === "shape-drop") {
    return ["shape placement can imply physics or drag complexity outside MVP scope"]
  }
  return ["demo needs clear restart and no hidden state"]
}

function buildConflictResolutions(documents: readonly KnowledgeDocument[]): readonly string[] {
  if (documents.length === 0) {
    return [
      "No user document conflicts found; embedded heuristics fill only missing game-design details.",
    ]
  }
  return [
    "If a document principle conflicts with a heuristic, the Judge Agent gives the document principle priority.",
    "No embedded heuristic may override user do-not-build rules.",
  ]
}
