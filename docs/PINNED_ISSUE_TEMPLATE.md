# Pinned GitHub Issue Template

**Create this as a pinned issue in your repository**

---

**Title:** 🔒 Branch Protection Enabled - Read Before Contributing

**Labels:** `announcement`, `documentation`, `pinned`

**Body:**

```markdown
## 🔒 Important: Branch Protection Rules Now Active

Hey team! 👋

As of **2025-11-12**, the `main` branch is now **protected**. This means:

### 🚫 What You Can't Do

- ❌ Push directly to `main`
- ❌ Force push to `main`
- ❌ Delete `main`
- ❌ Bypass CI checks
- ❌ Merge without approval

### ✅ What You Should Do

**All changes must go through Pull Requests (PRs).**

#### Quick Workflow:

1. **Create a branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat: describe your change"
   ```

3. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open a PR on GitHub:**
   - Fill out the PR template
   - Tag a reviewer (e.g., @wmoore012)
   - Wait for CI checks to pass
   - Get 1 approving review
   - Merge when green! 🎉

### 📋 Required Before Merge

Every PR must have:

- ✅ **All CI checks passing:**
  - Lint
  - Type Check
  - Tests (Node 18.x and 20.x)
  - Build
- ✅ **At least 1 approving review**
- ✅ **Code owner review** (for certain files)
- ✅ **All conversations resolved**

### 🌿 Branch Naming Convention

Use these prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `chore/` - Maintenance
- `test/` - Tests

**Examples:**
- `feature/add-export-button`
- `fix/narrative-step-count`
- `docs/update-readme`

### 👤 Who Can Push to Main?

**Only @wmoore012** can push directly to `main` (for emergency hotfixes).

Everyone else: **use PRs!**

### 🆘 Help! I Got Blocked

If you see this error:
```
[remote rejected] main -> main (protected branch hook declined)
```

**You tried to push to `main` directly.** Here's how to fix it:

```bash
# Create a branch from your current work
git checkout -b feature/my-changes

# Push the branch
git push origin feature/my-changes

# Reset your local main
git checkout main
git reset --hard origin/main
```

Then open a PR for your branch!

### 📚 Documentation

- **Quick Reference:** [docs/QUICK_REFERENCE.md](https://github.com/wmoore012/Bowtie_Project/blob/main/docs/QUICK_REFERENCE.md)
- **Full Setup Guide:** [docs/BRANCH_PROTECTION_SETUP.md](https://github.com/wmoore012/Bowtie_Project/blob/main/docs/BRANCH_PROTECTION_SETUP.md)
- **Contributing Guide:** [CONTRIBUTING.md](https://github.com/wmoore012/Bowtie_Project/blob/main/CONTRIBUTING.md)
- **Team Announcement:** [docs/TEAM_ANNOUNCEMENT.md](https://github.com/wmoore012/Bowtie_Project/blob/main/docs/TEAM_ANNOUNCEMENT.md)

### ❓ Questions?

Ask in the team chat or comment below!

---

### Why Are We Doing This?

1. ✅ **Prevents accidental breaking changes** to production
2. ✅ **Ensures all code is reviewed** by at least one other person
3. ✅ **Maintains quality gates** through automated CI/CD
4. ✅ **Creates clear audit trail** for academic integrity
5. ✅ **Professional development practice** for real-world workflows
6. ✅ **Required for company MVP standards**

Thanks for your cooperation! 🙏

---

**Effective:** 2025-11-12  
**Set up by:** @wmoore012  
**Questions?** Comment below or ping @wmoore012
```

---

## How to Create This Issue

1. Go to: https://github.com/wmoore012/Bowtie_Project/issues/new
2. Copy the markdown above (everything in the code block)
3. Paste as the issue body
4. Set title: `🔒 Branch Protection Enabled - Read Before Contributing`
5. Add labels: `announcement`, `documentation`, `pinned`
6. Click "Submit new issue"
7. **Pin the issue:**
   - Click the "Pin issue" button on the right sidebar
   - This keeps it at the top of the issues list

---

**This will be the first thing contributors see when they visit the Issues tab!**

