---
name: coreplay-lab
description: Run CorePlay Lab's deterministic multi-agent coreplay validation pipeline for a hybrid-casual puzzle prototype.
---

# CorePlay Lab

Use this skill when you need a reproducible offline workflow that validates a hybrid-casual puzzle idea before and after building a tiny playable prototype.

## Inputs

- A broad game prompt, such as `Make a U.S.-popular hybrid-casual puzzle game`.
- A folder of Markdown or plain-text game knowledge documents.
- An output folder for the generated demo and reports.

## Run

```bash
npm run coreplay -- --prompt "Make a U.S.-popular hybrid-casual puzzle game" --docs ./doc2 --out ./runs/demo
```

## What It Does

1. Loads user game knowledge documents as the primary grounding source.
2. Extracts key success factors such as market appeal, one-sentence pitch clarity, FTUE hook, first action fun, first win, feedback clarity, and low-friction onboarding.
3. Generates 2-3 deterministic candidate puzzle concepts from the internal mechanic catalog.
4. Runs Market, Coreplay, Level Design, and Production Agent evaluations for each candidate.
5. Uses the Judge Agent to select the winning concept and record document-grounded reasons.
6. Builds a playable 3-level web prototype from the selected concept.
7. Re-evaluates the prototype, chooses only the top 3 weaknesses, and applies only those improvements.
8. Writes JSON and Markdown artifacts plus a lightweight local review page.

## Outputs

- `runs/demo/index.html`
- `runs/demo/prototype/index.html`
- `runs/demo/artifacts/candidate-debate.*`
- `runs/demo/artifacts/judge-decision.*`
- `runs/demo/artifacts/post-build-debate.*`
- `runs/demo/artifacts/improvement-rationale.*`
- `runs/demo/artifacts/scorecard.*`
- `runs/demo/artifacts/knowledge-trace.*`
- `runs/demo/artifacts/improvements.*`
- `runs/demo/artifacts/demo-script.*`

## Quality Criteria

- The pipeline must run offline without API keys.
- Candidate evaluation must show document-derived success factors.
- The Judge decision must be traceable to the candidate debate and user documents.
- The final prototype must have 3 levels, one core mechanic, and one lightweight meta/progression element.
- Improvements must be limited to the top 3 weaknesses.
