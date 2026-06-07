import { describe, expect, it } from "vitest"
import { evaluateGameSpec, selectImprovementPriorities } from "../src/rubric.js"
import type { GameSpec } from "../src/types.js"

describe("default coreplay rubric", () => {
  it("scores a complete demo-stable game as fun enough when every dimension is acceptable", () => {
    // Given
    const spec: GameSpec = {
      title: "Circuit Bloom",
      mechanicId: "path-link",
      theme: "connect matching energy nodes before moves run out",
      rules: ["Link same-color nodes", "Longer paths charge combo flowers"],
      levels: [
        { id: "level-1", goal: "Make 2 blooms", moves: 10, difficulty: 1, layout: "intro" },
        { id: "level-2", goal: "Make 3 blooms", moves: 12, difficulty: 2, layout: "turn" },
        { id: "level-3", goal: "Make 4 blooms", moves: 14, difficulty: 3, layout: "fork" },
      ],
      feedback: ["pulse links", "score popups", "combo meter"],
      metaProgression: "collect petals to unlock a garden badge",
      clarityCue: "Draw paths between matching nodes",
      successCue: "Bloom meter fills after each chain",
      failureCue: "Moves remaining shows why a level failed",
    }

    // When
    const scorecard = evaluateGameSpec(spec)

    // Then
    expect(scorecard.total).toBeGreaterThanOrEqual(24)
    expect(scorecard.funEnough).toBe(true)
    expect(scorecard.dimensions.every((dimension) => dimension.score >= 3)).toBe(true)
  })

  it("selects only the top 3 weakest dimensions using the required tie-break order", () => {
    // Given
    const spec: GameSpec = {
      title: "Dim Tap",
      mechanicId: "tap-clear",
      theme: "tap tiles",
      rules: ["Tap tiles"],
      levels: [
        { id: "level-1", goal: "Clear tiles", moves: 8, difficulty: 1, layout: "plain" },
        { id: "level-2", goal: "Clear tiles", moves: 8, difficulty: 2, layout: "plain" },
        { id: "level-3", goal: "Clear tiles", moves: 8, difficulty: 3, layout: "plain" },
      ],
      feedback: [],
      metaProgression: "",
      clarityCue: "",
      successCue: "",
      failureCue: "",
    }

    // When
    const priorities = selectImprovementPriorities(evaluateGameSpec(spec))

    // Then
    expect(priorities).toEqual(["5-second-clarity", "immediate-feedback", "first-success"])
  })
})
