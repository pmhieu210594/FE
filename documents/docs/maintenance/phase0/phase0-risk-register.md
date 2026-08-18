# Phase 0-A — Risk Register

| ID | Risk | Level | Status | Mitigation |
|----|------|-------|--------|------------|
| R1 | Deny patterns may not catch secret files with arbitrary names | Medium | Open | Phase 0-B: add a hook to inspect file contents before Read |
| R2 | `DELETE FROM ... WHERE` statements may pass through — potentially deleting many rows | Low-Medium | Open | Add an ASK rule for `Bash(*DELETE FROM*)` in the next iteration |
| R3 | settings.json glob syntax may change between Claude Code versions | Low | Open | Verify after applying and record the result in phase0-review.md |
| R4 | `.env` in EDCAP_BE may be git-tracked | **High** | **Requires user confirmation** | User checks BE `.gitignore`; if tracked → revoke immediately |
| R5 | Safety gate only protects within the Claude Code session | Medium | Accepted | Address in the CI/CD phase (pre-commit hooks, secret scanning) |
| R6 | Allow list uses absolute Windows paths — not portable | Low | Accepted | Documented in D003; update if moving to another machine |

## R4 Details — .env git-tracking (URGENT)

**Check immediately**:
```powershell
# Inside EDCAP_BE/
git ls-files .env
```

If the output is not empty → `.env` is being tracked → **must be handled immediately**:
```powershell
git rm --cached .env
git commit -m "chore: untrack .env from version control"
```

And confirm that `.gitignore` contains this line:
```
.env
```

**Reason for High severity**: `.env` contains the database URL, OAuth2 client secret, and API keys. If it is tracked and pushed to the remote repository, the exposed secrets cannot be unrevealed.
