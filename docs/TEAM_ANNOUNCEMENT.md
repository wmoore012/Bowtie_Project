# 🔒 Branch Protection Announcement

**Post this in your team chat, Discord, or create a pinned GitHub issue**

---

## Important: New Branch Protection Rules

Hey team! 👋

We've enabled **branch protection** on `main` to maintain code quality and prevent accidental pushes.

### 🚫 What Changed

- **You can NO LONGER push directly to `main`**
- All changes must go through Pull Requests (PRs)
- PRs require:
  - ✅ All CI checks to pass (lint, type-check, tests, build)
  - ✅ At least 1 approving review
  - ✅ Code owner review (if you touch certain files)
  - ✅ All conversations resolved

### ✅ New Workflow (Super Simple)

```bash
# 1. Create a branch
git checkout -b feature/my-awesome-feature
# or: fix/bug-name, docs/update-readme, chore/cleanup

# 2. Make your changes
# ... code code code ...

# 3. Commit and push
git add .
git commit -m "feat: add awesome feature"
git push origin feature/my-awesome-feature

# 4. Open PR on GitHub
# - Fill out the PR template
# - Tag a reviewer (e.g., @wmoore012)
# - Wait for CI checks and approval
# - Merge when green! 🎉
```

### 🎯 Branch Naming Convention

Use these prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `chore/` - Maintenance, refactoring, dependencies
- `test/` - Test additions or fixes

**Examples:**
- `feature/add-export-button`
- `fix/narrative-step-count`
- `docs/update-contributing-guide`
- `chore/upgrade-react-flow`

### 👥 Who Can Push to Main?

**Only @wmoore012** can push directly to `main` (for emergency hotfixes or releases).

Everyone else: **use PRs!**

### 🆘 If You Get Blocked

**Error:** `[remote rejected] main -> main (protected branch hook declined)`

**Solution:** You tried to push to `main` directly. Create a branch instead:

```bash
# If you already committed to main locally:
git checkout -b feature/my-changes  # Create branch from current state
git push origin feature/my-changes  # Push the branch
git checkout main                   # Go back to main
git reset --hard origin/main        # Reset main to match remote
```

### 📚 More Info

- **Full guide:** [docs/BRANCH_PROTECTION_SETUP.md](./BRANCH_PROTECTION_SETUP.md)
- **Contributing guide:** [CONTRIBUTING.md](../CONTRIBUTING.md)
- **PR template:** [.github/pull_request_template.md](../.github/pull_request_template.md)

### ❓ Questions?

Ask in the team chat or ping @wmoore012!

---

**Why are we doing this?**

1. ✅ Prevents accidental breaking changes
2. ✅ Ensures all code is reviewed
3. ✅ Maintains CI/CD quality gates
4. ✅ Creates clear audit trail
5. ✅ Professional development practice
6. ✅ Required for academic integrity and company standards

Thanks for your cooperation! 🙏

---

**Effective immediately** | Set up by @wmoore012 | 2025-11-12

