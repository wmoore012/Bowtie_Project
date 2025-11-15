# Changelog

All notable changes to Bowtie Builder Pro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Deterministic barrier chaining on both wings (threat → sequential prevention barriers → top event and top event → mitigation chains → consequence), including node toggles that expand/collapse individual chains, automatic spacing, and story-mode driven reveals/highlights.
- Interactive narrative controls that auto-reset manual highlights between steps, ensure focused nodes bring their required chain into view, and keep the entire bowtie highlighted when expanding from the Top Event.
- Comprehensive regression coverage for the new layout, handle semantics, chain toggles, and narrative interactions.
- Contributing guidelines (CONTRIBUTING.md)
- Code of Conduct (CODE_OF_CONDUCT.md)
- Security policy (SECURITY.md)
- GitHub issue and PR templates
- CI/CD workflow for automated testing
- CODEOWNERS file for review assignments

### Changed
- Rebuilt `computeSimpleLayout` into a symmetric bow tie so Hazard sits above the Top Event, left-wing nodes flow threat → prevention → (left) escalation, and right-wing nodes flow mitigation → consequence with the proper hierarchy and spacing.
- Redesigned handle semantics across every node type (hazard bottom source, top event top/left/right handles, threats with right sources, consequences with left targets, barriers with left targets + right/bottom sources, wing-specific escalation factor handles) and updated all node components accordingly.
- Extended the story stepper to 11 phases so each prevention and mitigation chain reveals one-at-a-time, synchronized with the builder/demo keyboard navigation.
- Updated Top Event highlighting/pulse behaviour: the knot wrapper now owns sizing, handles stick to true centers, and highlight growth keeps the visual circle aligned with the hitbox.
- Top Event click logic now expands the entire diagram (including highlight state) unless everything is already expanded, in which case it collapses back to the hazard/top-event spine without affecting unrelated nodes.
- General UX polish: consistent node orientations, predictable spacing, improved sr-only counts, and smoother reveal/highlight transitions.
- Updated README with contributing section

### Deprecated
- None

### Removed
- None

### Fixed
- Edge construction now uses the correct handles/ordering for every bow-tie chain: hazard → top (top-event-hazard handle), threat chains into left/top event handle, mitigation chains out of the right handle, and sequential barrier links with orientation-aware handles. This eliminated the “couldn’t create edge for handle id …” warnings and restored proper flow to mitigation barriers, consequences, and both escalation wings.
- Escalation factors/barriers respect the `wing` metadata so left/right clusters anchor to the correct sides.
- Top Event toggle no longer hides consequences or threats incorrectly; hazard clicks are likewise limited to their logical scope.
- Removed the invisible/visible circle mismatch on the Top Event knot (padding, --knot-size, and layout tweaks) so the gradient ring matches the actual node size, text remains padded, and handles remain glued during animation.
- Stories no longer retain manual highlights/reveals from previous steps, and narrative-controlled chains stay expanded even after the user interacts with other nodes.
- Corrected handle ID targeting so that paths between nodes originate from the correct Top Event node
- Separated escalation factors and barriers into two groups so they no longer default to left side nodes

### Security
- None

---

## How to Update This Changelog

When making changes, add entries under the `[Unreleased]` section in the appropriate category:

- **Added** – New features
- **Changed** – Changes to existing functionality
- **Deprecated** – Soon-to-be removed features
- **Removed** – Removed features
- **Fixed** – Bug fixes
- **Security** – Security fixes or improvements

When releasing a new version, move unreleased changes to a new version section with the date.

### Example Entry Format

```markdown
## [1.0.0] - 2025-01-15

### Added
- Export to PDF functionality (#23)
- Keyboard shortcuts for common actions (#45)

### Fixed
- Layout calculation error with empty diagrams (#42)
- Focus trap in modal dialogs (#38)
```

---

## Version History

<!-- Versions will be added here as releases are made -->

## [0.0.0] - 2025-01-12

### Added
- Initial MVP release
- React Flow-based bowtie diagram visualization
- ELK.js deterministic layout engine
- Story/presentation mode with narrative progression
- Builder mode with drag-and-drop editing
- Inspector panel for node metadata
- PNG export functionality
- GSAP-powered animations
- Incident timeline framework integration
- Highway Driving Risk scenario (20 steps)
- Accessibility features (keyboard nav, ARIA, reduced motion)
- Design token system
- Comprehensive test suite (Vitest)
- TypeScript strict mode
- ESLint configuration
- Vercel deployment

---

**Note:** This project is part of an M.S. Data Science program and serves as an MVP for potential real-world use.

