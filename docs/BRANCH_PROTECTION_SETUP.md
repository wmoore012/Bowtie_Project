# Branch Protection Setup Guide

**Goal:** Lock `main` so nobody can push directly except @wmoore012. Everyone else must open PRs.

**Time estimate:** 5-10 minutes

---

## ⚡ Quick Setup (GitHub UI - Recommended)

### Step 1: Navigate to Branch Protection Settings

1. Go to: https://github.com/wmoore012/Bowtie_Project/settings/branches
2. Click **"Add rule"** or **"Add branch protection rule"**

### Step 2: Configure Protection Rule

**Branch name pattern:**
```
main
```

**Check these boxes:**

#### Protect matching branches
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1** (or **2** for stricter review)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners

#### Status checks
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Select these checks** (they'll appear after first CI run):
    - `Lint`
    - `Type Check`
    - `Test (18.x)`
    - `Test (20.x)`
    - `Build`

#### Additional rules
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Add user: `wmoore012`
- ✅ **Do not allow force pushes**
- ✅ **Do not allow deletions**

### Step 3: Save

Click **"Create"** or **"Save changes"**

---

## 🔧 Alternative: Command Line Setup (Advanced)

If you prefer automation, use the GitHub CLI:

### Prerequisites
```bash
# Install GitHub CLI if needed
brew install gh  # macOS
# or: https://cli.github.com/

# Authenticate
gh auth login
```

### Apply Protection Rule
```bash
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  /repos/wmoore012/Bowtie_Project/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["Lint","Type Check","Test (18.x)","Test (20.x)","Build"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"require_code_owner_reviews":true,"required_approving_review_count":1}' \
  -f restrictions='{"users":["wmoore012"],"teams":[],"apps":[]}' \
  -F allow_force_pushes=false \
  -F allow_deletions=false \
  -F required_conversation_resolution=true
```

**If you get errors:**
- Make sure CI has run at least once (so check names exist)
- Verify you have admin permissions on the repo
- Check that check names match exactly (case-sensitive)

---

## ✅ Verification Steps

### Test 1: Try Direct Push (Should Fail)
```bash
# Make a small change
echo "test" >> README.md
git add README.md
git commit -m "test: verify branch protection"
git push origin main
```

**Expected result:** ❌ Push rejected with message about branch protection

### Test 2: PR Workflow (Should Work)
```bash
# Create a branch
git checkout -b test/branch-protection
git push origin test/branch-protection

# Open PR on GitHub
# Should see: "Merging is blocked" until checks pass and review is approved
```

### Test 3: Check Status Checks
1. Open any PR
2. Scroll to bottom
3. Should see required checks:
   - ✅ Lint
   - ✅ Type Check
   - ✅ Test (18.x)
   - ✅ Test (20.x)
   - ✅ Build

---

## 📋 CI Check Names Reference

Our CI workflow (`.github/workflows/ci.yml`) creates these checks:

| Job Name | Check Name | What it does |
|----------|------------|--------------|
| `lint` | `Lint` | Runs ESLint |
| `type-check` | `Type Check` | Runs TypeScript compiler |
| `test` | `Test (18.x)` | Runs tests on Node 18 |
| `test` | `Test (20.x)` | Runs tests on Node 20 |
| `build` | `Build` | Builds production bundle |
| `security` | `Security Audit` | Runs npm audit (optional) |

**Note:** Check names appear in GitHub after the first successful CI run.

---

## 🚨 Troubleshooting

### "No status checks found"
- **Cause:** CI hasn't run yet
- **Fix:** Push a commit to trigger CI, then add checks to branch protection

### "You don't have permission to edit this rule"
- **Cause:** Not a repo admin
- **Fix:** Ask @wmoore012 to set it up or grant you admin access

### "Required status check 'X' is not available"
- **Cause:** Check name doesn't match CI job name
- **Fix:** Check `.github/workflows/ci.yml` for exact job names (case-sensitive)

### Accidentally locked yourself out
- **Fix:** Go to Settings → Branches → Edit rule → Uncheck "Do not allow bypassing"

---

## 📢 Announce to Team

After setup, post this in your team chat or create a pinned issue:

```markdown
## 🔒 Branch Protection Enabled

**New rule:** Do not push directly to `main`. Open a PR instead.

### Quick PR Flow:
1. Create branch: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push: `git push origin feature/your-feature`
4. Open PR on GitHub
5. Tag reviewer: @wmoore012 or team member
6. Wait for:
   - ✅ All CI checks to pass
   - ✅ 1 approving review
7. Merge!

### Only @wmoore012 can push directly to main.

Questions? See [CONTRIBUTING.md](../CONTRIBUTING.md)
```

---

**Setup complete!** 🎉 Your `main` branch is now protected.

