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
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CorePlay Lab Review</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#f7f9fb;color:#17212b}
main{max-width:1100px;margin:0 auto;padding:24px}h1{font-size:28px}.grid{display:grid;grid-template-columns:1.2fr .8fr;gap:18px}
iframe{width:100%;height:640px;border:1px solid #ccd6dd;border-radius:8px;background:white}.panel{background:white;border:1px solid #dce3e8;border-radius:8px;padding:16px;margin-bottom:14px}
a{color:#0f6fff}.score{font-size:34px;font-weight:800}.small{color:#5f6f7a;font-size:14px}
@media(max-width:850px){.grid{grid-template-columns:1fr}iframe{height:520px}}
</style>
</head>
<body>
<main>
<h1>CorePlay Lab Review</h1>
<p class="small">Prompt: ${escapeHtml(result.prompt)}</p>
<div class="grid">
<section>
<h2>Playable Prototype</h2>
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
