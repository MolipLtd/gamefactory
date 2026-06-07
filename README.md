# CorePlay Lab

CorePlay Lab is not just a game generator. It is an offline deterministic
multi-agent coreplay validation system: agents debate candidate hybrid-casual
puzzle concepts, a Judge Agent selects one, the system builds a playable
prototype, agents re-evaluate it, and only the top 3 weaknesses are improved.

## Run

```bash
npm install
npm run coreplay -- --prompt "Make a U.S.-popular hybrid-casual puzzle game" --docs ./docs --out ./runs/demo
```

The command reads Markdown/plain-text docs from `./docs`, treats those user docs as
the primary grounding source, supplements with embedded deterministic game-design
heuristics, and writes output to `./runs/demo`.

## Output

- `demo-screenshot.png` — demo screenshot for submission
- `runs/demo/index.html` — lightweight review page
- `runs/demo/prototype/index.html` — playable 3-level puzzle prototype
- `runs/demo/artifacts/candidate-debate.*` — 2-3 deterministic candidate concepts
  and Market/Coreplay/Level Design/Production evaluations
- `runs/demo/artifacts/judge-decision.*` — selected concept and Judge rationale
- `runs/demo/artifacts/post-build-debate.*` — agent re-evaluation after the
  prototype is built
- `runs/demo/artifacts/improvement-rationale.*` — why the final top 3
  improvements were selected from rubric weaknesses and agent debate
- `runs/demo/artifacts/scorecard.*`, `knowledge-trace.*`, `improvements.*`, and
  `demo-script.*` — final rubric score, traceability, before/after report, and
  2-minute demo script

Open `runs/demo/index.html` after running the command. The first screen shows the
user prompt, candidate concepts, agent debate summary, Judge-selected concept,
top 3 improvements, final prototype link, and final rubric score.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The MVP has no auth, database, backend dependency, external API dependency,
multiplayer, complex physics, or large level editor.
