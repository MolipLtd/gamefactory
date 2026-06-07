import type {
  AgentPosition,
  DebateSummary,
  GameSpec,
  KnowledgeDocument,
  KnowledgeTraceEntry,
} from "./types.js"

export function runDeterministicDebate(
  prompt: string,
  documents: readonly KnowledgeDocument[],
  principles: readonly string[],
  spec: GameSpec,
): DebateSummary {
  const documentEvidence = principles.slice(0, 3)
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
    judgePriorities: ["5-second clarity", "immediate feedback", "first success"],
    conflictResolutions: buildConflictResolutions(documents),
  }
}

export function createKnowledgeTrace(
  documents: readonly KnowledgeDocument[],
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
    extra,
    {
      decision: "Use offline deterministic agents instead of an LLM provider.",
      source: "judge-resolution",
      rationale:
        "The Seed requires the full demo path to work without network access, API keys, or external dependencies.",
    },
  ]
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
