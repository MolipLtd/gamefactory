# CorePlay Lab

CorePlay Lab is not just a game generator. It is an offline deterministic
multi-agent coreplay validation system: agents debate candidate hybrid-casual
puzzle concepts, a Judge Agent selects one, the system builds a playable
prototype, agents re-evaluate it, and only the top 3 weaknesses are improved.

The submitted game knowledge docs live in repo-local `./doc2` (copied from the
provided `docs2` folder). They are the primary grounding source for the idea
validation phase, not just final-report metadata.

## Run With Game Knowledge Docs

```bash
npm install
npm run coreplay -- --prompt "Make a U.S.-popular hybrid-casual puzzle game" --docs ./doc2 --out ./runs/demo
```

The command reads Markdown/plain-text docs from `./doc2`, treats those user docs as
the primary grounding source, supplements with embedded deterministic game-design
heuristics, and writes output to `./runs/demo`.

The included `./doc2` documents capture game success factors around market appeal,
target-user desire, one-sentence pitch clarity, FTUE hook, first action fun,
first win, visual feedback, low-friction onboarding, fast rewards, and feasible
prototype execution. Those factors are applied during candidate concept
generation, agent debate, Judge selection, post-build evaluation, and top-3
improvement selection.

## How The Docs Drive Validation

- Candidate concepts record `knowledgeFit` against the extracted `./doc2`
  success factors.
- Market, Coreplay, Level Design, and Production Agent evaluations include
  document-derived evidence for each candidate.
- The Judge Agent selects the winning concept using those debate scores and
  records the document-grounded rationale.
- Post-build debate and top-3 improvement selection combine rubric weaknesses
  with `./doc2` evidence such as first action fun, first win, clear feedback, and
  low-friction FTUE.

## Output

- `demo-screenshot.png` and `runs/demo/demo-screenshot.png` — demo screenshots
  for submission
- `runs/demo/index.html` — lightweight review page
- `runs/demo/prototype/index.html` — playable 3-level puzzle prototype
- `runs/demo/artifacts/candidate-debate.*` — 2-3 deterministic candidate concepts
  and Market/Coreplay/Level Design/Production evaluations, including extracted
  `./doc2` success-factor evidence
- `runs/demo/artifacts/judge-decision.*` — selected concept and Judge rationale
- `runs/demo/artifacts/post-build-debate.*` — agent re-evaluation after the
  prototype is built
- `runs/demo/artifacts/improvement-rationale.*` — why the final top 3
  improvements were selected from rubric weaknesses and agent debate
- `runs/demo/artifacts/scorecard.*`, `knowledge-trace.*`, `improvements.*`, and
  `demo-script.*` — final rubric score, traceability, before/after report, and
  2-minute demo script

Open `runs/demo/index.html` after running the command. The first screen shows the
user prompt, loaded `./doc2` documents, extracted success factors, candidate
concepts, agent debate summary, Judge-selected concept, top 3 improvements,
final prototype link, and final rubric score.

Reusable workflow notes live in `skills/coreplay-lab/SKILL.md`.

Current generated demo result: `Circuit Bloom`, final score `29/35`.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The MVP has no auth, database, backend dependency, external API dependency,
multiplayer, complex physics, or large level editor.
