import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { PipelineResult } from "./types.js"
import { escapeHtml } from "./util.js"

export async function writeReviewPage(outputPath: string, result: PipelineResult): Promise<string> {
  await mkdir(outputPath, { recursive: true })
  const filePath = join(outputPath, "index.html")
  await writeFile(filePath, renderReview(result))
  return filePath
}

function renderReview(result: PipelineResult): string {
  const candidates = result.candidateDebate.candidates
    .map(
      (candidate) =>
        `<li><strong>${escapeHtml(candidate.title)}</strong>: ${escapeHtml(
          candidate.marketHook,
        )}</li>`,
    )
    .join("")
  const agentDebate = result.candidateDebate.evaluations
    .slice(0, 4)
    .map(
      (evaluation) =>
        `<li><strong>${escapeHtml(evaluation.agent)}</strong>: ${escapeHtml(
          evaluation.strengths[0] ?? "candidate reviewed",
        )}; risk: ${escapeHtml(evaluation.fatalRisks[0] ?? "none")}</li>`,
    )
    .join("")
  const improvements = result.improvementReport.improvements
    .map(
      (improvement) =>
        `<li><strong>${escapeHtml(improvement.dimension)}</strong>: ${escapeHtml(
          improvement.change,
        )}</li>`,
    )
    .join("")
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CorePlay Lab Review</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f7f9fb;color:#17212b}
main{max-width:1180px;margin:0 auto;padding:24px}h1{font-size:30px;margin-bottom:4px}.hero{background:#10202a;color:#f5fbff;border-radius:8px;padding:18px;margin-bottom:18px}.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}.evidence{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
iframe{width:100%;height:640px;border:1px solid #ccd6dd;border-radius:8px;background:white}.panel{background:white;border:1px solid #dce3e8;border-radius:8px;padding:16px;margin-bottom:14px}
a{color:#0f6fff}.score{font-size:34px;font-weight:800}.small{color:#5f6f7a;font-size:14px}li{margin:6px 0}.pill{display:inline-block;background:#e7f0ff;color:#123b7a;border-radius:999px;padding:4px 8px;margin:2px 4px 2px 0;font-size:13px}
@media(max-width:850px){.grid{grid-template-columns:1fr}iframe{height:520px}}
@media(max-width:760px){.evidence{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
<section class="hero">
<h1>CorePlay Lab: Deterministic Multi-Agent Coreplay Validation</h1>
<p>Prompt: ${escapeHtml(result.prompt)}</p>
<p>Agents debated ${result.candidateDebate.candidates.length} candidates, Judge selected <strong>${escapeHtml(
    result.judgeDecision.selectedTitle,
  )}</strong>, the prototype was built, agents re-evaluated it, and only the top 3 weaknesses were improved.</p>
<a href="prototype/index.html">Open final playable prototype</a>
</section>
<section class="evidence">
<div class="panel">
<h2>Candidate Concepts</h2>
<ul>${candidates}</ul>
<a href="artifacts/candidate-debate.md">Read candidate debate</a>
</div>
<div class="panel">
<h2>Agent Debate</h2>
<ul>${agentDebate}</ul>
<a href="artifacts/candidate-debate.md">Inspect all agent evaluations</a>
</div>
<div class="panel">
<h2>Judge-Selected Concept</h2>
<p><strong>${escapeHtml(result.judgeDecision.selectedTitle)}</strong></p>
<p>${escapeHtml(result.judgeDecision.rationale)}</p>
<a href="artifacts/judge-decision.md">Read Judge decision</a>
</div>
<div class="panel">
<h2>Top 3 Improvements</h2>
<ul>${improvements}</ul>
<a href="artifacts/improvement-rationale.md">Read improvement rationale</a>
</div>
</section>
<div class="grid">
<section>
<h2>Final Playable Prototype</h2>
<iframe title="Generated puzzle prototype" src="prototype/index.html"></iframe>
</section>
<aside>
<section class="panel">
<h2>Rubric Scorecard</h2>
<div class="score">${result.finalScorecard.total}/35</div>
<p>${result.finalScorecard.funEnough ? "Fun enough" : "Needs improvement"}</p>
<a href="artifacts/scorecard.md">Read scorecard</a>
</section>
<section class="panel">
<h2>Agent Debate</h2>
<p>${escapeHtml(result.debateSummary.judgePriorities.join(", "))}</p>
<a href="artifacts/debate.md">Read debate summary</a>
<br><a href="artifacts/post-build-debate.md">Read post-build debate</a>
</section>
<section class="panel">
<h2>Knowledge Trace</h2>
<p>User documents are primary; heuristics are supplemental.</p>
<a href="artifacts/knowledge-trace.md">Inspect knowledge trace</a>
</section>
<section class="panel">
<h2>Before/After Improvements</h2>
<p>${escapeHtml(result.improvementPriorities.join(", "))}</p>
<a href="artifacts/improvements.md">Compare improvements</a>
</section>
<section class="panel">
<h2>Demo Script</h2>
<a href="artifacts/demo-script.md">Read 2-minute script</a>
</section>
</aside>
</div>
</main>
</body>
</html>`
}
