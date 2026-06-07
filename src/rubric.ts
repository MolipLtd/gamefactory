import type { GameSpec, RubricDimensionId, RubricScore, Scorecard } from "./types.js"
import { RUBRIC_DIMENSION_IDS } from "./types.js"
import { assertNever, mustGet } from "./util.js"

const LABELS: Record<RubricDimensionId, string> = {
  "5-second-clarity": "5-Second Clarity",
  "immediate-feedback": "Immediate Fun / Feedback",
  "first-success": "First Success",
  "fair-challenge": "Fair Challenge",
  "strategic-depth": "Strategic Depth",
  "hybrid-casual-appeal": "Hybrid-Casual Appeal",
  "production-stability": "Production / Demo Stability",
}

const TIE_BREAK: Record<RubricDimensionId, number> = {
  "5-second-clarity": 0,
  "immediate-feedback": 1,
  "first-success": 2,
  "fair-challenge": 3,
  "production-stability": 4,
  "hybrid-casual-appeal": 5,
  "strategic-depth": 6,
}

export function evaluateGameSpec(spec: GameSpec): Scorecard {
  const dimensions = RUBRIC_DIMENSION_IDS.map((id) => scoreDimension(id, spec))
  const total = dimensions.reduce((sum, dimension) => sum + dimension.score, 0)
  const noLowDimension = dimensions.every((dimension) => dimension.score >= 3)
  return {
    dimensions,
    total,
    funEnough: total >= 24 && noLowDimension,
    threshold: "total score >= 24/35 and no dimension below 3",
  }
}

export function selectImprovementPriorities(scorecard: Scorecard): readonly RubricDimensionId[] {
  return scorecard.dimensions
    .slice()
    .sort((left, right) => {
      if (left.score !== right.score) {
        return left.score - right.score
      }
      return TIE_BREAK[left.id] - TIE_BREAK[right.id]
    })
    .slice(0, 3)
    .map((dimension) => dimension.id)
}

function scoreDimension(id: RubricDimensionId, spec: GameSpec): RubricScore {
  switch (id) {
    case "5-second-clarity":
      return makeScore(
        id,
        scoreClarity(spec),
        "Instruction cue and visible goal are immediately understandable.",
      )
    case "immediate-feedback":
      return makeScore(
        id,
        scoreFeedback(spec),
        "First actions produce visible, score, or state feedback.",
      )
    case "first-success":
      return makeScore(id, scoreFirstSuccess(spec), "Level 1 creates a quick meaningful win.")
    case "fair-challenge":
      return makeScore(
        id,
        scoreFairChallenge(spec),
        "Failure states explain moves, goals, and what to improve.",
      )
    case "strategic-depth":
      return makeScore(
        id,
        scoreStrategicDepth(spec),
        "The mechanic supports choices beyond pure tapping.",
      )
    case "hybrid-casual-appeal":
      return makeScore(
        id,
        scoreHybridAppeal(spec),
        "A lightweight collection or progression layer exists.",
      )
    case "production-stability":
      return makeScore(
        id,
        scoreProduction(spec),
        "The prototype is readable, restartable, and demo-stable.",
      )
    default:
      return assertNever(id)
  }
}

function makeScore(id: RubricDimensionId, score: number, rationale: string): RubricScore {
  return { id, label: LABELS[id], score, rationale }
}

function scoreClarity(spec: GameSpec): number {
  if (spec.clarityCue.length === 0) return 1
  if (spec.clarityCue.length < 18) return 3
  return 4
}

function scoreFeedback(spec: GameSpec): number {
  if (spec.feedback.length === 0) return 1
  if (spec.feedback.length === 1) return 2
  if (spec.feedback.length === 2) return 3
  return 5
}

function scoreFirstSuccess(spec: GameSpec): number {
  const firstLevel = mustGet(spec.levels, 0, "first level")
  if (spec.successCue.length === 0) return 1
  if (firstLevel.moves < 8) return 2
  return firstLevel.difficulty <= 1 ? 4 : 3
}

function scoreFairChallenge(spec: GameSpec): number {
  if (spec.failureCue.length === 0) return 2
  return spec.levels.every((level) => level.moves >= 8) ? 4 : 3
}

function scoreStrategicDepth(spec: GameSpec): number {
  if (spec.rules.length < 2) return 2
  return spec.mechanicId === "tap-clear" ? 3 : 4
}

function scoreHybridAppeal(spec: GameSpec): number {
  if (spec.metaProgression.length === 0) return 1
  return spec.metaProgression.length > 20 ? 4 : 3
}

function scoreProduction(spec: GameSpec): number {
  const hasThreeLevels = spec.levels.length === 3
  const hasReadableCues = spec.failureCue.length > 0 && spec.rules.length > 0
  return hasThreeLevels && hasReadableCues ? 4 : 2
}
