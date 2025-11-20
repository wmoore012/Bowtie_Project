# Bowtie Builder Pro · DSBA 5122

Interactive Bowtie risk storytelling tool built with React, TypeScript, React Flow, ELK.js, and GSAP. It ships with both Builder and Story modes so a facilitator can design scenarios live, then narrate the incident with confident visuals.

https://bowtie-project.vercel.app

> **🔒 IMPORTANT:** The `main` branch is protected. **Do not push directly to `main`.** All changes ship through Pull Requests with passing CI + review. Only @wmoore012 can push to `main`. See [Contributing Guide](CONTRIBUTING.md) and [Branch Protection Setup](docs/BRANCH_PROTECTION_SETUP.md).

![Bowtie Builder Pro - Demo hero](src/assets/BT%201.png)

<div style="display: flex; flex-wrap: wrap; gap: 16px; margin: 16px 0;">
  <img src="src/assets/BT 2.png" alt="Inspector details in demo mode" style="flex: 1 1 240px; min-width: 240px;" />
  <img src="src/assets/BT 3.png" alt="Narrated story state" style="flex: 1 1 240px; min-width: 240px;" />
  <img src="src/assets/BT 4.png" alt="Threats and escalation factors" style="flex: 1 1 240px; min-width: 240px;" />
  <img src="src/assets/BT 5 Builder.png" alt="Builder mode palette and canvas" style="flex: 1 1 240px; min-width: 240px;" />
</div>

## Quick Links
- Hosted prototype: https://bowtie-project.vercel.app (Story + Builder modes, keyboard narration, reduced-motion safe).
- Visual/token reference: `docs/design-tokens-reference.html`
- Scenario data: `src/domain/scenarios/*` (swap to showcase new stories).

## Team & Approach
- **Team #:** Group 2 · **Course:** DSBA 5122 (UNC Charlotte)
- **Members:** Bobby Deasy · Sreedhar Lakamsani · Davis Martin · Will Moore · Chris Weihrauch
- **Approach:** *Approach 1 – Build* (full custom React + ELK implementation with deterministic layout, inline editing, GSAP cues, export-to-PNG, and accessibility-first defaults).

## Risk Story Summary
Fleet operations typically stay safe thanks to trained drivers, layered barriers, and telemetry. Latent weaknesses—missed maintenance, stale calibrations, ignored alerts—quietly erode that safety margin until multiple threats land at once. Our featured scenario walks through a winter highway run where a missed weather notification, uncalibrated ADAS sensors, and an unresolved ABS fault converge on black ice. Radar alerts plus defensive driving hold the line just in time, avoiding collisions, injuries, or rollovers. The narrative highlights how prevention, escalation, mitigation, and consequence barriers must align so a single failure does not domino into catastrophe.

## Run & View
1. `npm install`
2. `npm run dev` – launch Vite dev server with hot reload
3. `npm run build` – type-check + build production bundle (fails on TS/ESLint errors)
4. `npm run preview` – preview the production bundle locally
5. `npm run test:run` – execute the Vitest/Jest unit suite once (ideal for fast TDD loops)

> ✅ **Tip:** The Builder autosave writes to `localStorage`. Use the “Clear Diagram” action or `clearDiagramFromLocalStorage` helper during development to reset local state between tests.

## Experience Highlights
### Story Mode
- Deterministic ELK layout keeps the hazard centered above the knot with symmetric prevention/mitigation wings.
- Story timeline exposes only the relevant branch by default, applying GSAP-powered pulses and role-colored halos that respect `prefers-reduced-motion`.
- Arrow-key narration, role filter chips, and focus management make it workshop-ready for mixed-experience participants.

### Builder Mode
- Palette drag + drop snaps hazards, top events, threats, barriers, and consequences into the correct lanes using magnetic positioning along existing anchors.
- “Clear & Start Fresh” keeps only the seed hazard/top event nodes (now with blank labels) so new workshops start clean without reloading.
- Inspector supports inline renaming, metadata tags, likelihood/severity adjustments, and automatic ELK reflow to keep diagrams tidy.

### Collaboration & Export
- PNG/PDF export captures any state (story, builder, filtered) with consistent typography.
- JSON import/export enables scenario versioning; autosave restores the last working copy per browser.
- Accessibility features include focus-visible buttons, keyboard shortcuts, and ARIA live narration of node counts.

## Preattentive & Design System
- **Color:** hazard amber, threat sand, prevention green, mitigation blue, consequence red, escalation yellow stripe.
- **Shape/Size:** banner hazard + knot emphasize hierarchy; escalation factors remain pill-shaped; barriers/cards stay compact for scannability.
- **Motion:** GSAP sequences pulse active nodes, while reduced-motion users receive static emphasis instead.
- **Opacity/Glow:** inactive nodes dim and active nodes glow to direct attention without losing context.
- **Position:** prevention always left, mitigation right, escalation factors hug their parent lanes—the layout encodes meaning even without text.

Design tokens (color, spacing, typography, motion) live in `docs/design-tokens-reference.html` with a matching CSS module for implementation parity.

## Scenario & Data Model
- Narrative steps reside in `src/domain/scenarios/highwayDrivingNarrative.ts` plus `highway_driving.groups.ts` for lane groupings.
- Swap in other industries by replacing those files or adding new scenario modules referenced by `BowtieGraph` props.
- Diagram persistence uses the `BowtieDiagram` schema defined in `src/domain/bowtie.types.ts`; builder utilities live in `src/components/bowtie/builderFields.ts`.

## Development Workflow
- Follow feature branches + PR review (no direct pushes to `main`).
- Favor **TDD** for interactive elements: write/update tests in `src/tests/**` (or co-located `*.test.tsx`) and run `npm run test:run` frequently.
- `npm run build` doubles as type-check/lint gate; treat failures as blocking.
- For manual QA, cover: Builder drag/drop, story narration (keyboard + mouse), export flows, and clear/start-over behavior.

## Acknowledgements
- Built with React Flow, ELK.js, GSAP, and Vite.
- Inspired by Bowtie methodology from safety + risk management literature.
- Created for DSBA 5122 in collaboration with Todus Advisors and the UNC Charlotte M.S. Data Science program.
