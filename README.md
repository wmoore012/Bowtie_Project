# 🎯 Bowtie Builder Pro

Professional, accessible Bowtie risk diagram tool built with React + TypeScript + Vite + React Flow + ELK.js.
https://bowtie-project.vercel.app

> **🔒 IMPORTANT:** The `main` branch is protected. **Do not push directly to `main`.** All changes must go through Pull Requests with CI checks and code review. Only @wmoore012 can push to `main`. See [Contributing Guide](CONTRIBUTING.md) and [Branch Protection Setup](docs/BRANCH_PROTECTION_SETUP.md).

![Bowtie Builder Pro - Demo Mode](src/assets/BT%201.png)

<div style="display: flex; gap: 16px; margin: 16px 0;">
  <img src="src/assets/BT 2.png" alt="Bowtie Builder Pro - Inspector Panel" style="width: 48%;" />
  <img src="src/assets/BT 5 Builder.png" alt="Bowtie Builder Pro - Builder Mode" style="width: 48%;" />
</div>

## Team & Approach
**Team #:** Group 2
**Members:** Bobby Deasy, Sreedhar Lakamsani, Davis Martin, Will Moore, Chris Weihrauch
**Chosen Approach:** Approach 1 – Build

Deterministic ELK-backed React + TypeScript experience with guided Builder / Story modes, inline editing, GSAP-driven preattentive cues, export-to-PNG, and strong accessibility defaults.

## Risk Story Summary
Fleet operations normally run smoothly with trained drivers, well-maintained trucks, and multiple safety barriers in place. However, several threats: impaired driving, distraction, sensor drift, mechanical faults, bad weather, and poor visibility, can erode these defenses, especially when latent issues like deferred maintenance or missed alerts accumulate. In this scenario, a missed weather warning, an uncalibrated ADAS system, and an unresolved ABS fault combined during a storm to create a near-loss-of-control event on black ice. Mitigation barriers such as radar alerts and defensive driving ultimately prevented a crash, avoiding consequences like collisions, injuries, or rollovers. The incident reveals how layered barriers can fail or hold, depending on how well the system manages risks and addresses hidden weaknesses.

## Run / View
- `npm install`
- `npm run dev` – start dev server
- `npm run build` – type-check and build
- `npm run preview` – preview the production build
- `npm run test:run` – run unit tests once (no watch mode)

**Hosted prototype:** https://bowtie-project.vercel.app (Story and Builder modes available with keyboard narration support).
Scenario content lives in `src/domain/scenarios/*`; swap these files to showcase alternative risk stories.
Visual / design token reference: `docs/design-tokens-reference.html` for color, motion, and typography mapping.

## Highlights
- Deterministic ELK-powered layout keeps the hazard centered above the knot while maintaining left/right symmetry for prevention and mitigation branches.
- Default collapsed bowtie surfaces only threats, escalation factors, hazard, top event, and consequences until a user clicks or runs the story, simplifying workshop onboarding.
- Story mode animates focus, reveals the correct path, supports arrow-key narration, and records the barrier state for playback.
- Escalation factors remain visible as yellow-striped pills with legend support, and the inspector allows inline editing of labels, tags, and risk metadata.
- Multi-select filtering chips, PNG export, keyboard shortcuts, and reduced-motion/focus-visible defaults keep the tool accessible for mixed-experience teams.

## Preattentive Attributes
- **Color** separates roles (hazard amber, threat sand, prevention green, mitigation blue, consequence red) and timeline stages (normal gray through recovery green).
- **Size and shape** emphasize hierarchy: circular top event node, larger banner hazard/top event cards, standard rectangles elsewhere.
- **Opacity and glow** direct story focus by dimming inactive nodes and applying role-colored highlights to the active branch.
- **Motion** uses short GSAP-driven pulses that respect prefers-reduced-motion to indicate narration steps without overwhelming participants.
- **Position** keeps prevention left, mitigation right, and escalation factors tucked along their respective sides so each pattern maps to a single meaning.

## Acknowledgement
This is a student project developed for DSBA 5122 in collaboration with Todus Advisors.

- Built with React Flow and ELK.js
- Inspired by bowtie methodology from risk management literature
- Developed as part of M.S. Data Science coursework

