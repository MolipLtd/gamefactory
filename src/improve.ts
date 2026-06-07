import type {
  GameSpec,
  Improvement,
  ImprovementReport,
  RubricDimensionId,
  Scorecard,
} from "./types.js"
import { assertNever } from "./util.js"

export function improveGameSpec(
  spec: GameSpec,
  priorities: readonly RubricDimensionId[],
): { readonly spec: GameSpec; readonly improvements: readonly Improvement[] } {
  let improved = spec
  const improvements: Improvement[] = []
  for (const priority of priorities) {
    const result = applyImprovement(improved, priority)
    improved = result.spec
    improvements.push(result.improvement)
  }
  return { spec: improved, improvements }
}

export function createImprovementReport(
  before: Scorecard,
  after: Scorecard,
  priorities: readonly RubricDimensionId[],
  improvements: readonly Improvement[],
): ImprovementReport {
  return {
    beforeTotal: before.total,
    afterTotal: after.total,
    selectedWeaknesses: priorities,
    improvements,
    scopeDiscipline:
      "Only the selected top 3 rubric weaknesses were changed; no unrelated features were added.",
  }
}

function applyImprovement(
  spec: GameSpec,
  dimension: RubricDimensionId,
): { readonly spec: GameSpec; readonly improvement: Improvement } {
  switch (dimension) {
    case "5-second-clarity":
      return {
        spec: {
          ...spec,
          clarityCue: "Draw a path between matching glowing nodes before the moves run out.",
        },
        improvement: {
          dimension,
          change: "Added an explicit first-screen instruction cue.",
          rationale: "A first-time player needs the action verb and target visible immediately.",
        },
      }
    case "immediate-feedback":
      return {
        spec: {
          ...spec,
          feedback: ["glowing path pulse", "score popups", "combo bloom meter"],
        },
        improvement: {
          dimension,
          change: "Added pulse, score, and combo feedback for the first action.",
          rationale: "Immediate sensory response makes the mechanic feel satisfying quickly.",
        },
      }
    case "first-success":
      return {
        spec: {
          ...spec,
          successCue: "Complete two links to bloom the first badge in under 30 seconds.",
        },
        improvement: {
          dimension,
          change: "Added a small first-level win condition and success cue.",
          rationale: "The first level should deliver a meaningful success almost immediately.",
        },
      }
    case "fair-challenge":
      return {
        spec: {
          ...spec,
          failureCue: "Moves remaining and target progress explain what to improve.",
        },
        improvement: {
          dimension,
          change: "Clarified failure feedback around moves and target progress.",
          rationale: "Failures should be understandable and non-random.",
        },
      }
    case "strategic-depth":
      return {
        spec: { ...spec, rules: [...spec.rules, "Save longer chains for combo turns"] },
        improvement: {
          dimension,
          change: "Added a combo-planning rule.",
          rationale: "Strategic choice should come from timing longer chains, not pure tapping.",
        },
      }
    case "hybrid-casual-appeal":
      return {
        spec: { ...spec, metaProgression: "collect petals to unlock three garden badges" },
        improvement: {
          dimension,
          change: "Clarified the lightweight collection goal.",
          rationale: "A tiny progression layer gives the run a goal beyond one-off play.",
        },
      }
    case "production-stability":
      return {
        spec,
        improvement: {
          dimension,
          change: "Kept the static restartable implementation path.",
          rationale: "The current static output is already the lowest-risk production path.",
        },
      }
    default:
      return assertNever(dimension)
  }
}
