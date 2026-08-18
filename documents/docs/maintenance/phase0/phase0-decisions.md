# Phase 0-A — Decisions Log

## D001 — Place .claude/ at the workspace root (D:\EDCAP_FULL\)

**Decision**: `.claude/` is placed at `D:\EDCAP_FULL\.claude\`, not inside EDCAP_BE or EDCAP_FE.

**Rationale**: EDCAP_FULL is the workspace that contains both BE and FE. Claude Code loads CLAUDE.md and settings.json from the root directory of the working directory. Placing it at the root ensures the safety gate applies to the entire workspace.

**Tradeoff**: If BE and FE are later split into two separate repositories, a separate `.claude/` directory will need to be created for each repository.

---

## D002 — Fully deny (no prompt) secrets and destructive commands

**Decision**: Secrets and destructive commands are placed in the `deny` list, not `ask`.

**Rationale**: If they are set to `ask`, the user may accidentally approve them. The risk of unintentionally reading a secret or accidentally running `rm -rf` is higher than the risk of being blocked when access is genuinely needed. When access is truly required, the user can temporarily adjust the settings.

**Tradeoff**: If `.env.example` needs to be read (a template file without secrets), it must be added to the allow list or excluded from the deny pattern.

---

## D003 — Use absolute paths in the allow list

**Decision**: Allow patterns use `d:/EDCAP_FULL/...` instead of `**/src/**`.

**Rationale**: A relative pattern like `**/src/**` will match `src/` directories outside the project, for example in `node_modules/` or `.m2/`. Absolute paths are more precise and help avoid false positives.

**Tradeoff**: If the workspace is moved to another machine or the path changes, settings.json must be updated.

---

## D004 — docs/ skeleton contains only README placeholders

**Decision**: Create `docs/architecture/`, `docs/standards/`, and `docs/changes/` with README placeholders, without adding real content.

**Rationale**: Phase 0-A only establishes the structure. Real content, such as architecture diagrams, coding standards, and so on, must be researched and written carefully in Phase 0-B and Phase 1 after reading the actual source code.

**Tradeoff**: Empty docs may confuse other team members when they open them. The README files clearly state "Placeholder" to avoid this.

---

## D005 — Do not create CHANGELOG.md yet

**Decision**: Do not create `CHANGELOG.md` in Phase 0-A; only create the `docs/changes/README.md` placeholder.

**Rationale**: CHANGELOG must be aligned with the versioning strategy. There is no semantic versioning or release process yet. Creating it too early would leave it empty or filled with the wrong format.
