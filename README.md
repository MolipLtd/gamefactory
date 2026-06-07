# CorePlay Lab

CorePlay Lab is a greenfield Node/Vite/TypeScript MVP generated from Seed
`seed_cf1b6208ab7b`. It runs a one-command, offline deterministic pipeline for
hybrid-casual puzzle prototyping.

## Run

```bash
npm install
npm run coreplay -- --prompt "Make a U.S.-popular hybrid-casual puzzle game" --docs ./docs --out ./runs/demo
```

The command reads Markdown/plain-text docs from `./docs`, treats those user docs as
the primary grounding source, supplements with embedded deterministic game-design
heuristics, and writes output to `./runs/demo`.

## Output

- `runs/demo/index.html` — lightweight review page
- `runs/demo/prototype/index.html` — playable 3-level puzzle prototype
- `runs/demo/artifacts/*.json` and `*.md` — debate, scorecard, knowledge trace,
  improvement report, run summary, and 2-minute demo script

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

The MVP has no auth, database, backend dependency, external API dependency,
multiplayer, complex physics, or large level editor.
