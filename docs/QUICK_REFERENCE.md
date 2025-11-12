# Quick Reference Card

**Print this or keep it handy!** 📋

---

## 🚫 Rule #1: Never Push to Main

```bash
# ❌ DON'T DO THIS
git push origin main

# ✅ DO THIS INSTEAD
git checkout -b feature/my-feature
git push origin feature/my-feature
# Then open a PR on GitHub
```

---

## ✅ Standard Workflow (Copy-Paste Ready)

### 1. Start New Work
```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Work on your code...
# Test locally: npm run test:run
# Lint: npm run lint
# Type check: npx tsc --noEmit
```

### 3. Commit
```bash
git add .
git commit -m "feat: describe your change"
# Use: feat, fix, docs, chore, test, refactor
```

### 4. Push Branch
```bash
git push origin feature/your-feature-name
```

### 5. Open PR
1. Go to: https://github.com/wmoore012/Bowtie_Project/pulls
2. Click "New pull request"
3. Select your branch
4. Fill out template
5. Tag reviewer: `@wmoore012`
6. Submit!

### 6. Wait for Approval
- ✅ CI checks must pass (Lint, Type Check, Test, Build)
- ✅ 1 approving review required
- ✅ All conversations resolved

### 7. Merge
- Click "Merge pull request" when green
- Delete branch after merge

---

## 🌿 Branch Naming

| Type | Prefix | Example |
|------|--------|---------|
| New feature | `feature/` | `feature/add-export-button` |
| Bug fix | `fix/` | `fix/narrative-step-count` |
| Documentation | `docs/` | `docs/update-readme` |
| Maintenance | `chore/` | `chore/upgrade-deps` |
| Tests | `test/` | `test/add-validation-tests` |
| Refactoring | `refactor/` | `refactor/simplify-layout` |

---

## 📝 Commit Message Format

```
type(scope): short description

Longer explanation if needed.

Fixes #123
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding or updating tests
- `chore` - Updating build tasks, package manager configs, etc.

**Examples:**
```bash
git commit -m "feat: add JSON export functionality"
git commit -m "fix: correct narrative step count in story mode"
git commit -m "docs: update contributing guidelines"
git commit -m "chore: upgrade react-flow to v12"
```

---

## 🆘 Common Issues & Fixes

### "Remote rejected: protected branch"
**Problem:** You tried to push to `main` directly.

**Fix:**
```bash
# Create branch from your current work
git checkout -b feature/my-changes

# Push the branch
git push origin feature/my-changes

# Reset local main to match remote
git checkout main
git reset --hard origin/main
```

### "CI checks failing"
**Problem:** Lint, tests, or build failed.

**Fix:**
```bash
# Run locally to see errors
npm run lint
npm run test:run
npx tsc --noEmit
npm run build

# Fix issues, then:
git add .
git commit -m "fix: resolve CI issues"
git push origin your-branch-name
```

### "Merge conflicts"
**Problem:** Your branch is out of sync with `main`.

**Fix:**
```bash
# Update main
git checkout main
git pull origin main

# Rebase your branch
git checkout your-branch-name
git rebase main

# Resolve conflicts in your editor
# Then:
git add .
git rebase --continue
git push origin your-branch-name --force-with-lease
```

### "Need to update PR"
**Problem:** Reviewer requested changes.

**Fix:**
```bash
# Make changes
# Commit
git add .
git commit -m "fix: address review feedback"
git push origin your-branch-name
# PR updates automatically!
```

---

## 🎯 Pre-Push Checklist

Before pushing, run:

```bash
npm run lint          # ✅ No lint errors
npm run test:run      # ✅ All tests pass
npx tsc --noEmit      # ✅ No type errors
npm run build         # ✅ Build succeeds
```

Or use this one-liner:
```bash
npm run lint && npm run test:run && npx tsc --noEmit && npm run build
```

---

## 👥 Who to Tag for Review

- **General changes:** @wmoore012
- **UI/UX changes:** @wmoore012
- **Documentation:** @wmoore012
- **Tests:** @wmoore012

Check [CODEOWNERS](../.github/CODEOWNERS) for specific file ownership.

---

## 📚 Full Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Complete contribution guide
- [BRANCH_PROTECTION_SETUP.md](./BRANCH_PROTECTION_SETUP.md) - Branch protection details
- [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) - Community standards
- [SECURITY.md](../SECURITY.md) - Security policy

---

## 🚀 Quick Commands Reference

```bash
# Clone repo
git clone https://github.com/wmoore012/Bowtie_Project.git
cd Bowtie_Project

# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm run test:run

# Build for production
npm run build

# Create new branch
git checkout -b feature/my-feature

# Push branch
git push origin feature/my-feature

# Update from main
git checkout main && git pull origin main

# Delete local branch
git branch -d feature/my-feature

# Delete remote branch
git push origin --delete feature/my-feature
```

---

**Questions?** Ask in team chat or ping @wmoore012!

**Last updated:** 2025-11-12

