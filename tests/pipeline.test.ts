import { mkdir, mkdtemp, readFile, stat, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { runCorePlayPipeline } from "../src/pipeline.js"

async function createDocsFixture(root: string): Promise<string> {
  const docsPath = join(root, "docs")
  await mkdir(docsPath, { recursive: true })
  await writeFile(
    join(docsPath, "principles.md"),
    [
      "# Puzzle Principles",
      "Prioritize 5-second clarity and fair challenge.",
      "Do not build complex physics, multiplayer, login, payments, or external APIs.",
      "Use lightweight collection or combo progression.",
    ].join("\n"),
  )
  return docsPath
}

describe("CorePlay pipeline", () => {
  it("generates deterministic offline artifacts and a playable review output", async () => {
    // Given
    const root = await mkdtemp(join(tmpdir(), "coreplay-test-"))
    const docsPath = await createDocsFixture(root)
    const firstOut = join(root, "run-a")
    const secondOut = join(root, "run-b")
    const prompt = "Make a U.S.-popular hybrid-casual puzzle game."

    // When
    const first = await runCorePlayPipeline({
      prompt,
      docsPath,
      outputPath: firstOut,
      serve: false,
    })
    const second = await runCorePlayPipeline({
      prompt,
      docsPath,
      outputPath: secondOut,
      serve: false,
    })

    // Then
    expect(first.debateSummary).toEqual(second.debateSummary)
    expect(first.candidateDebate).toEqual(second.candidateDebate)
    expect(first.judgeDecision).toEqual(second.judgeDecision)
    expect(first.finalScorecard).toEqual(second.finalScorecard)
    expect(first.improvementPriorities.length).toBeLessThanOrEqual(3)
    expect(first.gameDesign.levels).toHaveLength(3)
    expect(first.gameDesign.title).toBe(first.judgeDecision.selectedTitle)
    expect(first.forbiddenFeaturesAbsent).toBe(true)

    await expect(stat(join(firstOut, "prototype", "index.html"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "index.html"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "candidate-debate.json"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "candidate-debate.md"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "judge-decision.json"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "post-build-debate.md"))).resolves.toBeTruthy()
    await expect(
      stat(join(firstOut, "artifacts", "improvement-rationale.md")),
    ).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "scorecard.json"))).resolves.toBeTruthy()
    await expect(stat(join(firstOut, "artifacts", "scorecard.md"))).resolves.toBeTruthy()

    const review = await readFile(join(firstOut, "index.html"), "utf8")
    expect(review).toContain("prototype/index.html")
    expect(review).toContain("Knowledge Trace")
    expect(review).toContain("Candidate Concepts")
    expect(review).toContain("Judge-Selected Concept")
  })
})
