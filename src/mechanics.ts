import type { CandidateConcept, GameSpec, KnowledgeTraceEntry, LevelSpec } from "./types.js"
import { mustGet, stableHash } from "./util.js"

type MechanicTemplate = {
  readonly id: string
  readonly title: string
  readonly theme: string
  readonly rules: readonly string[]
}

const MECHANICS = [
  {
    id: "path-link",
    title: "Circuit Bloom",
    theme: "connect matching energy nodes to bloom a tiny city garden",
    rules: ["Draw links between matching nodes", "Longer links charge a combo bloom"],
  },
  {
    id: "merge-lane",
    title: "Snack Stack",
    theme: "merge snack tiles into higher-value treats before the tray fills",
    rules: ["Merge matching snack tiles", "Plan moves to keep lanes open"],
  },
  {
    id: "shape-drop",
    title: "Parcel Pop",
    theme: "drop package shapes into matching slots for combo deliveries",
    rules: ["Place shapes into compatible slots", "Chain perfect fits for delivery streaks"],
  },
] as const satisfies readonly MechanicTemplate[]

export function selectMechanic(prompt: string, principles: readonly string[]): MechanicTemplate {
  const joined = `${prompt}\n${principles.join("\n")}`.toLowerCase()
  if (joined.includes("clarity") || joined.includes("fair")) {
    return MECHANICS[0]
  }
  const index = stableHash(joined) % MECHANICS.length
  return mustGet(MECHANICS, index, "mechanic")
}

export function generateCandidateConcepts(
  prompt: string,
  principles: readonly string[],
): readonly CandidateConcept[] {
  const first = selectMechanic(prompt, principles)
  const startIndex = MECHANICS.findIndex((mechanic) => mechanic.id === first.id)
  return [0, 1, 2].map((offset) => {
    const mechanic = mustGet(MECHANICS, (startIndex + offset) % MECHANICS.length, "candidate")
    return {
      id: `candidate-${offset + 1}`,
      title: mechanic.title,
      mechanicId: mechanic.id,
      theme: mechanic.theme,
      rules: mechanic.rules,
      marketHook: marketHookFor(mechanic.id),
      metaProgression: progressionFor(mechanic.id),
      knowledgeFit: knowledgeFitFor(mechanic.id, principles),
    }
  })
}

export function createInitialGameSpec(concept: CandidateConcept): GameSpec {
  return {
    title: concept.title,
    mechanicId: concept.mechanicId,
    theme: concept.theme,
    rules: concept.rules,
    levels: createLevels(concept.mechanicId),
    feedback: ["soft tile pulse"],
    metaProgression: concept.metaProgression,
    clarityCue: "",
    successCue: "",
    failureCue: "Moves remaining explains each failed attempt",
  }
}

export function createMechanicTrace(concept: CandidateConcept): KnowledgeTraceEntry {
  return {
    decision: `Judge selected ${concept.title} (${concept.mechanicId}) from deterministic candidates.`,
    source: "judge-resolution",
    rationale: `The Judge Agent selects one candidate after Market, Coreplay, Level Design, and Production evaluations. Knowledge fit: ${concept.knowledgeFit.join("; ")}`,
  }
}

function marketHookFor(mechanicId: string): string {
  switch (mechanicId) {
    case "path-link":
      return "calm matching plus combo blooms for short-session puzzle appeal"
    case "merge-lane":
      return "snack-merging fantasy with clear collection goals"
    case "shape-drop":
      return "spatial fit satisfaction with delivery-streak progression"
    default:
      return "simple input with visible progression"
  }
}

function progressionFor(mechanicId: string): string {
  switch (mechanicId) {
    case "path-link":
      return "collect petals to unlock three garden badges"
    case "merge-lane":
      return "collect stars to fill a snack shelf"
    case "shape-drop":
      return "complete deliveries to stamp a route card"
    default:
      return "complete levels to fill a collection badge"
  }
}

function knowledgeFitFor(mechanicId: string, principles: readonly string[]): readonly string[] {
  const joined = principles.join(" ").toLowerCase()
  const factors: string[] = []
  if (
    joined.includes("one sentence") ||
    joined.includes("short video") ||
    joined.includes("hook")
  ) {
    factors.push("one-sentence pitch and fast hook")
  }
  if (
    joined.includes("first action") ||
    joined.includes("first tap") ||
    joined.includes("30 seconds")
  ) {
    factors.push("first action exposes the core fun")
  }
  if (joined.includes("visual") || joined.includes("feedback") || joined.includes("reward")) {
    factors.push("visible feedback and quick reward")
  }
  if (joined.includes("market") || joined.includes("audience") || joined.includes("user value")) {
    factors.push("U.S. hybrid-casual audience value")
  }
  if (mechanicId === "path-link") {
    factors.push("clear matching loop with low prototype risk")
  }
  if (mechanicId === "merge-lane") {
    factors.push("collection-friendly merge loop")
  }
  if (mechanicId === "shape-drop") {
    factors.push("strong spatial satisfaction but higher control risk")
  }
  return factors.slice(0, 5)
}

function createLevels(mechanicId: string): readonly LevelSpec[] {
  return [
    {
      id: "level-1",
      goal: "Complete 2 matches",
      moves: 10,
      difficulty: 1,
      layout: `${mechanicId}-intro`,
    },
    {
      id: "level-2",
      goal: "Complete 3 matches",
      moves: 12,
      difficulty: 2,
      layout: `${mechanicId}-choice`,
    },
    {
      id: "level-3",
      goal: "Complete 4 matches",
      moves: 14,
      difficulty: 3,
      layout: `${mechanicId}-combo`,
    },
  ]
}
