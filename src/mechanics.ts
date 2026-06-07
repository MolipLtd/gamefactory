import type { GameSpec, KnowledgeTraceEntry, LevelSpec } from "./types.js"
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

export function createInitialGameSpec(mechanic: MechanicTemplate): GameSpec {
  return {
    title: mechanic.title,
    mechanicId: mechanic.id,
    theme: mechanic.theme,
    rules: mechanic.rules,
    levels: createLevels(mechanic.id),
    feedback: ["soft tile pulse"],
    metaProgression: "collect bloom badges after each level",
    clarityCue: "",
    successCue: "",
    failureCue: "Moves remaining explains each failed attempt",
  }
}

export function createMechanicTrace(mechanic: MechanicTemplate): KnowledgeTraceEntry {
  return {
    decision: `Selected ${mechanic.title} (${mechanic.id}) from the internal mechanic catalog.`,
    source: "supplemental-heuristic",
    rationale:
      "The catalog is deterministic and small, satisfying the MVP breadth limit while supporting broad puzzle prompts.",
  }
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
