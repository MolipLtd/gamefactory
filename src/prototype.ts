import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import type { GameSpec } from "./types.js"
import { escapeHtml } from "./util.js"

export async function writePrototype(outputPath: string, spec: GameSpec): Promise<string> {
  const prototypeDir = join(outputPath, "prototype")
  await mkdir(prototypeDir, { recursive: true })
  const html = renderPrototype(spec)
  const filePath = join(prototypeDir, "index.html")
  await writeFile(filePath, html)
  return filePath
}

function renderPrototype(spec: GameSpec): string {
  const data = JSON.stringify({
    title: spec.title,
    clarityCue: spec.clarityCue,
    successCue: spec.successCue,
    failureCue: spec.failureCue,
    metaProgression: spec.metaProgression,
    levels: spec.levels,
  })
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(spec.title)}</title>
<style>
body{margin:0;font-family:Inter,system-ui,sans-serif;background:#10202a;color:#f5fbff}
main{max-width:900px;margin:0 auto;padding:24px}
.bar{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.panel{background:#17313f;border:1px solid #285063;border-radius:8px;padding:16px;margin:14px 0}
.grid{display:grid;grid-template-columns:repeat(4,minmax(56px,1fr));gap:10px;margin:18px 0}
button.tile{aspect-ratio:1;border:0;border-radius:8px;color:white;font-size:24px;font-weight:800;cursor:pointer}
button.tile:disabled{opacity:.35;cursor:not-allowed}.a{background:#2d9cdb}.b{background:#f2994a}.c{background:#27ae60}.d{background:#bb6bd9}
.pulse{animation:pulse .25s ease}@keyframes pulse{from{transform:scale(.92)}to{transform:scale(1)}}
button.action{border:0;border-radius:6px;background:#f2c94c;color:#10202a;padding:10px 14px;font-weight:800;cursor:pointer}
</style>
</head>
<body>
<main>
<div class="bar"><h1>${escapeHtml(spec.title)}</h1><button class="action" id="restart">Restart Level</button></div>
<section class="panel">
<strong id="levelName"></strong>
<p>${escapeHtml(spec.clarityCue)}</p>
<p id="status"></p>
</section>
<section class="grid" id="grid"></section>
<section class="panel"><strong>Progression</strong><p id="meta">${escapeHtml(spec.metaProgression)}</p></section>
</main>
<script>
const game = ${data};
const colors = ["a","b","c","d"];
let levelIndex = 0;
let moves = 0;
let matches = 0;
let firstPick = null;
const grid = document.getElementById("grid");
const status = document.getElementById("status");
const levelName = document.getElementById("levelName");
function level(){ return game.levels[levelIndex]; }
function target(){ return levelIndex + 2; }
function draw(){
  const current = level();
  moves = current.moves;
  matches = 0;
  firstPick = null;
  levelName.textContent = "Level " + (levelIndex + 1) + ": " + current.goal;
  grid.innerHTML = "";
  const count = 8 + levelIndex * 2;
  for (let i = 0; i < count; i += 1) {
    const button = document.createElement("button");
    const color = colors[i % colors.length];
    button.className = "tile " + color;
    button.textContent = "●";
    button.dataset.color = color;
    button.addEventListener("click", () => pick(button));
    grid.appendChild(button);
  }
  update("Make " + target() + " matching links. Moves: " + moves);
}
function pick(button){
  if (moves <= 0 || button.disabled) return;
  button.classList.add("pulse");
  if (firstPick === null) {
    firstPick = button;
    update("Pick another " + button.dataset.color + " node.");
    return;
  }
  moves -= 1;
  if (firstPick.dataset.color === button.dataset.color && firstPick !== button) {
    firstPick.disabled = true;
    button.disabled = true;
    matches += 1;
    update("Bloom! +" + (matches * 100) + " score. Moves: " + moves);
  } else {
    update("Not a match. " + game.failureCue + " Moves: " + moves);
  }
  firstPick = null;
  if (matches >= target()) {
    if (levelIndex < game.levels.length - 1) {
      levelIndex += 1;
      update(game.successCue);
      setTimeout(draw, 650);
    } else {
      update("Demo complete. " + game.metaProgression);
    }
  }
  if (moves <= 0 && matches < target()) update(game.failureCue);
}
function update(message){ status.textContent = message; }
document.getElementById("restart").addEventListener("click", draw);
draw();
</script>
</body>
</html>`
}
