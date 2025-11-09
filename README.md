# 🎯 Bowtie Builder Pro

Professional, accessible Bowtie risk diagram tool built with React + TypeScript + Vite + React Flow + ELK.js.

![Hero Screenshot](src/assets/v.5.png)

## Scripts
- `npm run dev` – start dev server
- `npm run build` – type-check and build
- `npm run preview` – preview the production build
- `npm run test:run` – run unit tests once (no watch mode)

## Highlights
- Deterministic ELK-backed layout keeps the hazard above the top event with true left/right symmetry.
- Default “collapsed” bowtie only shows threats, escalation factors, top event, hazard, and consequences; clicking any card or running the story reveals the matching prevention/mitigation barriers.
- Story / presentation mode pulses nodes, auto-reveals the correct branches, and supports arrow-key narration plus restart collapse.
- Escalation factors stay visible as yellow striped pills; new legend entry explains their role.
- Role-based multi-select filtering (chips) with accessible live region feedback.
- Export any state of the diagram to PNG; CSS Modules + design tokens + reduced motion/focus-visible baked in.

## Roadmap (next)
- Smooth GSAP-level zoom/pan choreography for story transitions.
- Inline editing of escalation factors + barriers inside Builder mode.
- Time-travel scrubber that records which barriers were revealed during a workshop.

## Scenario
This repo ships a neutral “Highway Driving Risk” teaching example (with explicit escalation factors). Swap in your own scenario by editing `src/domain/scenarios/*`.
