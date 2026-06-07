export const RUBRIC_DIMENSION_IDS = [
  "5-second-clarity",
  "immediate-feedback",
  "first-success",
  "fair-challenge",
  "strategic-depth",
  "hybrid-casual-appeal",
  "production-stability",
] as const

export type RubricDimensionId = (typeof RUBRIC_DIMENSION_IDS)[number]

export type LevelSpec = {
  readonly id: string
  readonly goal: string
  readonly moves: number
  readonly difficulty: number
  readonly layout: string
}

export type GameSpec = {
  readonly title: string
  readonly mechanicId: string
  readonly theme: string
  readonly rules: readonly string[]
  readonly levels: readonly LevelSpec[]
  readonly feedback: readonly string[]
  readonly metaProgression: string
  readonly clarityCue: string
  readonly successCue: string
  readonly failureCue: string
}

export type KnowledgeDocument = {
  readonly path: string
  readonly title: string
  readonly content: string
  readonly principles: readonly string[]
}

export type KnowledgeTraceEntry = {
  readonly decision: string
  readonly source: "user-document" | "supplemental-heuristic" | "judge-resolution"
  readonly rationale: string
}

export type AgentRole =
  | "Market Agent"
  | "Coreplay Agent"
  | "Level Design Agent"
  | "Production Agent"
  | "Judge Agent"

export type AgentPosition = {
  readonly agent: AgentRole
  readonly position: string
  readonly priorities: readonly string[]
  readonly evidence: readonly string[]
}

export type DebateSummary = {
  readonly prompt: string
  readonly positions: readonly AgentPosition[]
  readonly judgePriorities: readonly string[]
  readonly conflictResolutions: readonly string[]
}

export type RubricScore = {
  readonly id: RubricDimensionId
  readonly label: string
  readonly score: number
  readonly rationale: string
}

export type Scorecard = {
  readonly dimensions: readonly RubricScore[]
  readonly total: number
  readonly funEnough: boolean
  readonly threshold: string
}

export type Improvement = {
  readonly dimension: RubricDimensionId
  readonly change: string
  readonly rationale: string
}

export type ImprovementReport = {
  readonly beforeTotal: number
  readonly afterTotal: number
  readonly selectedWeaknesses: readonly RubricDimensionId[]
  readonly improvements: readonly Improvement[]
  readonly scopeDiscipline: string
}

export type PipelineInput = {
  readonly prompt: string
  readonly docsPath: string
  readonly outputPath: string
  readonly serve: boolean
}

export type PipelineResult = {
  readonly prompt: string
  readonly documents: readonly KnowledgeDocument[]
  readonly debateSummary: DebateSummary
  readonly knowledgeTrace: readonly KnowledgeTraceEntry[]
  readonly gameDesign: GameSpec
  readonly initialScorecard: Scorecard
  readonly improvementPriorities: readonly RubricDimensionId[]
  readonly improvementReport: ImprovementReport
  readonly finalScorecard: Scorecard
  readonly demoScript: string
  readonly outputPath: string
  readonly reviewPagePath: string
  readonly prototypePath: string
  readonly forbiddenFeaturesAbsent: boolean
}
