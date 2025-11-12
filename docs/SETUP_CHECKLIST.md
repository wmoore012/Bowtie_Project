# Branch Protection Setup Checklist

**Complete these tasks to fully protect your `main` branch.**

**Time estimate:** 10-30 minutes total

---

## ✅ Immediate Tasks (5-10 minutes)

### 1. Enable Branch Protection on GitHub

- [ ] Go to: https://github.com/wmoore012/Bowtie_Project/settings/branches
- [ ] Click "Add rule"
- [ ] Set branch name pattern: `main`
- [ ] Check these boxes:
  - [ ] Require a pull request before merging
    - [ ] Require approvals: 1
    - [ ] Dismiss stale pull request approvals when new commits are pushed
    - [ ] Require review from Code Owners
  - [ ] Require status checks to pass before merging
    - [ ] Require branches to be up to date before merging
    - [ ] Select checks: `Lint`, `Type Check`, `Test (18.x)`, `Test (20.x)`, `Build`
  - [ ] Require conversation resolution before merging
  - [ ] Do not allow bypassing the above settings
  - [ ] Restrict who can push to matching branches
    - [ ] Add user: `wmoore012`
  - [ ] Do not allow force pushes
  - [ ] Do not allow deletions
- [ ] Click "Create" or "Save changes"

**Note:** If status checks don't appear, push a commit first to trigger CI, then come back and add them.

### 2. Verify CI Workflow

- [ ] Check that `.github/workflows/ci.yml` exists
- [ ] Push a commit to trigger CI
- [ ] Verify all checks pass:
  - [ ] Lint
  - [ ] Type Check
  - [ ] Test (18.x)
  - [ ] Test (20.x)
  - [ ] Build
  - [ ] Security Audit (optional)

### 3. Test Branch Protection

- [ ] Try to push directly to `main` (should fail):
  ```bash
  echo "test" >> README.md
  git add README.md
  git commit -m "test: verify protection"
  git push origin main
  ```
  **Expected:** ❌ Push rejected

- [ ] Create a test PR (should work):
  ```bash
  git checkout -b test/branch-protection
  git push origin test/branch-protection
  ```
  **Expected:** ✅ Branch pushed, can open PR

- [ ] Clean up test:
  ```bash
  git checkout main
  git reset --hard origin/main
  git branch -D test/branch-protection
  git push origin --delete test/branch-protection
  ```

---

## 📢 Communication Tasks (10-15 minutes)

### 4. Announce to Team

- [ ] **Option A:** Post in team chat/Discord
  - [ ] Copy content from `docs/TEAM_ANNOUNCEMENT.md`
  - [ ] Post in main team channel
  - [ ] Pin the message

- [ ] **Option B:** Create pinned GitHub issue
  - [ ] Go to: https://github.com/wmoore012/Bowtie_Project/issues/new
  - [ ] Copy content from `docs/PINNED_ISSUE_TEMPLATE.md`
  - [ ] Create issue with title: `🔒 Branch Protection Enabled - Read Before Contributing`
  - [ ] Add labels: `announcement`, `documentation`, `pinned`
  - [ ] Pin the issue (right sidebar)

- [ ] **Option C:** Both! (Recommended)

### 5. Update Documentation Links

- [ ] Verify README.md has branch protection notice (already done ✅)
- [ ] Share quick reference with team:
  - [ ] Link to `docs/QUICK_REFERENCE.md` in team chat
  - [ ] Consider printing and posting near workstations

---

## 🔧 Optional Enhancements (10-20 minutes)

### 6. Enable Additional GitHub Features

- [ ] **Enable Discussions:**
  - [ ] Go to: Settings → Features
  - [ ] Check "Discussions"
  - [ ] Create welcome post

- [ ] **Enable Security Advisories:**
  - [ ] Go to: Settings → Security → Private vulnerability reporting
  - [ ] Enable private vulnerability reporting

- [ ] **Enable Dependabot:**
  - [ ] Go to: Settings → Security → Dependabot
  - [ ] Enable Dependabot alerts
  - [ ] Enable Dependabot security updates
  - [ ] Enable Dependabot version updates

### 7. Add Issue Labels

- [ ] Go to: https://github.com/wmoore012/Bowtie_Project/labels
- [ ] Create these labels if missing:
  - [ ] `announcement` (blue)
  - [ ] `documentation` (blue)
  - [ ] `pinned` (yellow)
  - [ ] `good first issue` (green)
  - [ ] `help wanted` (green)
  - [ ] `bug` (red)
  - [ ] `enhancement` (purple)
  - [ ] `high priority` (red)

### 8. Configure CODEOWNERS

- [ ] Review `.github/CODEOWNERS`
- [ ] Add team members if needed
- [ ] Assign specific file/folder ownership
- [ ] Test by opening PR that touches owned files

---

## 🎯 Verification Tasks (5 minutes)

### 9. Final Checks

- [ ] **Branch protection active:**
  - [ ] Visit: https://github.com/wmoore012/Bowtie_Project/settings/branches
  - [ ] Verify rule exists for `main`

- [ ] **CI checks required:**
  - [ ] Open any PR
  - [ ] Scroll to bottom
  - [ ] See required checks listed

- [ ] **Team notified:**
  - [ ] Announcement posted
  - [ ] Team members acknowledged

- [ ] **Documentation accessible:**
  - [ ] README.md has notice
  - [ ] Quick reference available
  - [ ] Setup guide available

---

## 📊 Success Metrics

After setup, you should see:

- ✅ **0 direct pushes to `main`** (except from @wmoore012)
- ✅ **All changes via PRs**
- ✅ **All PRs have CI checks**
- ✅ **All PRs have reviews**
- ✅ **No broken builds on `main`**

---

## 🆘 Troubleshooting

### Status checks not appearing

**Problem:** Can't select checks in branch protection settings.

**Solution:**
1. Push a commit to trigger CI
2. Wait for CI to complete
3. Go back to branch protection settings
4. Checks should now appear in the dropdown

### Accidentally locked yourself out

**Problem:** Can't push even as admin.

**Solution:**
1. Go to: Settings → Branches → Edit rule
2. Uncheck "Do not allow bypassing the above settings"
3. Make your push
4. Re-enable the setting

### Team members confused

**Problem:** Team doesn't understand new workflow.

**Solution:**
1. Share `docs/QUICK_REFERENCE.md`
2. Walk through one PR together
3. Offer to help with first few PRs
4. Point to `CONTRIBUTING.md` for details

---

## 📅 Ongoing Maintenance

### Weekly
- [ ] Review open PRs
- [ ] Check CI health
- [ ] Monitor for protection bypasses

### Monthly
- [ ] Review branch protection settings
- [ ] Update documentation if workflow changes
- [ ] Audit team permissions

### Quarterly
- [ ] Review CODEOWNERS assignments
- [ ] Update CI checks if needed
- [ ] Gather team feedback on process

---

## ✅ Completion

When all immediate and communication tasks are done:

- [ ] Mark this checklist as complete
- [ ] Archive this document for reference
- [ ] Celebrate! 🎉 Your `main` branch is now protected!

---

**Setup by:** @wmoore012  
**Date:** 2025-11-12  
**Status:** [ ] In Progress / [ ] Complete

