# Contributing to Bowtie Builder Pro

Thank you for your interest in contributing! This project is both an M.S. Data Science course deliverable and an MVP intended for potential real-world use. We welcome contributions that maintain high quality and academic integrity.

## Quick Start

**Project Lead:** @wmoore012  
**Tech Stack:** React 19 + TypeScript + Vite + React Flow + ELK.js  
**Live Demo:** https://bowtie-project.vercel.app

### Prerequisites

- Node.js 18+ and npm
- Familiarity with React, TypeScript, and React Flow
- Understanding of bowtie risk analysis methodology (optional but helpful)

### Development Setup

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/bowtie-lithium-warehouse.git
   cd bowtie-lithium-warehouse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Run tests**:
   ```bash
   npm run test:run      # Run once
   npm run test:watch    # Watch mode
   ```

5. **Lint your code**:
   ```bash
   npm run lint
   ```

## Contribution Workflow

### 1. Create a Branch

Use descriptive branch names following these conventions:

- `feature/short-description` – New features
- `fix/issue-number-description` – Bug fixes
- `docs/description` – Documentation updates
- `chore/description` – Maintenance tasks

**Examples:**
- `feature/export-to-pdf`
- `fix/42-null-pointer-in-layout`
- `docs/update-installation-guide`

### 2. Make Your Changes

- **Keep changes focused** – One logical change per PR
- **Write tests** – Add or update tests for new functionality
- **Follow existing patterns** – Match the codebase style and architecture
- **Update documentation** – If you change APIs or behavior

**Key architectural principles:**
- Use CSS Modules for component styles
- Leverage design tokens from `src/styles/theme.css`
- Maintain accessibility (ARIA labels, keyboard navigation)
- Respect `prefers-reduced-motion` for animations
- Keep components small and testable

### 3. Test Locally

Before pushing, ensure all checks pass:

```bash
# Type checking and build
npm run build

# Run all tests
npm run test:run

# Lint code
npm run lint
```

### 4. Commit Your Changes

Write clear, descriptive commit messages using conventional commits:

```
type(scope): short description

Longer explanation if needed.

Fixes #issue-number
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
- `feat(builder): add PDF export functionality`
- `fix(layout): prevent null pointer in ELK layout calculation`
- `docs(readme): update installation instructions`
- `test(bowtie): add tests for barrier expansion`

### 5. Open a Pull Request

**PR Title:** Use the same format as commit messages (imperative, concise)

**PR Description must include:**

- **Summary:** What does this PR do? (1-2 sentences)
- **Related Issue:** `Fixes #42` or `Implements #15`
- **Type:** bugfix / feature / docs / chore
- **Risk Level:** low / medium / high
- **Testing Steps:** How to verify the changes locally
- **Screenshots/Videos:** For UI changes (highly recommended)

**PR Checklist:**
- [ ] Tests added or updated
- [ ] All tests pass (`npm run test:run`)
- [ ] Build succeeds (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation updated (if applicable)
- [ ] Accessibility verified (keyboard nav, screen reader, ARIA)
- [ ] Reduced motion respected (if animations added)
- [ ] Reviewer(s) tagged

**Example PR description:**
```markdown
## Summary
Add PDF export functionality to complement existing PNG export.

Related issue: Implements #23

## Type & Impact
- Type: feature
- Risk level: low
- Affects: UI, export functionality

## What Changed
- Added `exportToPDF` utility using jsPDF
- New "Export PDF" button in toolbar
- Updated export menu with both PNG and PDF options

## Testing Steps
1. Checkout branch: `git checkout feature/export-to-pdf`
2. Install: `npm install`
3. Run: `npm run dev`
4. Open app, create/load a diagram
5. Click "Export" → "Export as PDF"
6. Verify PDF downloads with correct diagram rendering

## Checklist
- [x] Tests added
- [x] Build passes
- [x] Lint passes
- [x] Docs updated
- [x] Reviewer tagged: @wmoore012
```

## Code Review Process

### Review Requirements

- **Minimum 1 approving review** required for all PRs
- **2 reviews recommended** for:
  - Architecture changes
  - Infrastructure changes (CI/CD, build config)
  - Breaking changes
  - Security-sensitive code

### What Reviewers Look For

- **Correctness:** Does it work as intended?
- **Tests:** Are changes adequately tested?
- **Code quality:** Is it readable, maintainable, and follows project patterns?
- **Performance:** Any performance implications?
- **Accessibility:** Keyboard navigation, ARIA, screen reader support
- **Security:** No credentials, proper input validation
- **Documentation:** Clear comments for complex logic

### Responding to Feedback

- Address all comments or explain why you disagree
- Push new commits to address feedback
- Re-request review after making changes
- Be respectful and assume good intent

## Code Style & Quality

### TypeScript

- **Strict mode enabled** – No `any` types without justification
- **Explicit types** for function parameters and return values
- **Zod schemas** for runtime validation of external data

### React

- **Functional components** with hooks
- **Custom hooks** for reusable logic
- **CSS Modules** for component styles
- **Accessibility first** – ARIA labels, semantic HTML, keyboard support

### Testing

- **Unit tests** for utilities and hooks
- **Component tests** for UI components
- **Integration tests** for complex workflows
- **Aim for meaningful coverage** – not just high percentages

### File Organization

```
src/
├── components/       # React components (with .module.css)
├── domain/          # Business logic, scenarios, types
├── styles/          # Global styles, design tokens
├── utils/           # Pure utility functions
├── test/            # Test setup and utilities
└── types/           # Shared TypeScript types
```

## Dependencies

### Adding Dependencies

**Use npm** (not yarn or pnpm) to maintain consistency:

```bash
npm install package-name
```

### Dependency Guidelines

- **Justify new dependencies** – Explain why in your PR
- **Check bundle size** – Avoid large dependencies for small features
- **Prefer well-maintained packages** – Active development, good documentation
- **Security** – Run `npm audit` and address vulnerabilities

### Updating Dependencies

- Dependabot will create PRs for updates
- Review and test dependency updates carefully
- Don't mix dependency updates with feature changes

## Academic Integrity & Company Expectations

### Academic Integrity

- This project fulfills M.S. Data Science course requirements
- Follow your institution's collaboration and citation policies
- Don't share solutions to course-specific assignments
- Attribute external code sources properly

### Company Expectations

- Treat this as production-quality code
- No sensitive data or credentials in commits
- Professional communication in issues and PRs
- Respect intellectual property boundaries

**If you encounter company-sensitive data or IP:**
1. **Stop immediately**
2. Contact the course instructor
3. Notify @wmoore012
4. Do not commit or push the data

## Getting Help

- **Questions?** Open a GitHub Discussion or issue
- **Bugs?** Use the bug report template
- **Features?** Open an issue to discuss before implementing
- **Security?** See [SECURITY.md](SECURITY.md) for private reporting

## Recognition

Contributors who make significant contributions will be:
- Added to the project README
- Acknowledged in release notes
- Credited in academic presentations (with permission)

---

**Thank you for contributing to Bowtie Builder Pro!** Your careful work helps make this both a strong academic project and a credible tool for real-world risk analysis.

