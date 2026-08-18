# Parser Implementation Knowledge

## Purpose

Capture the smallest reusable lessons from parser tickets (PARSER-REVIEW-CHECKLIST, PARSER-REPORT).
This file is for durable patterns, not for full report history.

---

## Reusable Patterns

| Pattern | Why it matters | Where to reuse |
|---|---|---|
| `sectionMap()` returns UPPERCASE canonical keys | `MarkdownParserCore.canonicalSectionKey()` normalizes headings to UPPERCASE_WITH_UNDERSCORES (e.g. `"OPEN_ISSUES"`, not `"open_issues"`). Lowercase lookup silently returns null — no exception, no compile error. Always use `sections.get(field.toUpperCase())`. | Every parser that calls `document.sectionMap()` |
| Verify key format with a diagnostic test | Before implementing section lookup in a new parser, add one test that asserts `sections.containsKey("SUMMARY")` on a known input. Catches key-format mismatch at Step 1, not at integration. | New parser skeleton (impl-plan Step 1) |
| ParseStatus enum has exactly 4 values | `FAILED` / `PARTIAL` / `DRAFT` / `OFFICIAL` — no `WARNING`. Spec drafts have historically introduced `WARNING` by mistake. Use the enum, never a raw string. | Spec writing, FE/BE contract docs, parser output |
| ParseStatus logic order | `errors not empty → FAILED`; `warnings not empty → PARTIAL`; `parseMode == "official" → OFFICIAL`; else `→ DRAFT`. The order matters — errors take precedence over warnings. | Every new parser's `determineParseStatus()` |
| Parser version string format | `<artifact-type>-parser:v<n>` (e.g. `report-parser:v1`, `spec-pack-parser:v1`). Store in `ParseSnapshot.parserVersion`. Increment major version when `parsedSummary` schema changes. | `ParseSnapshot` construction in every parser |
| Controller test: plain unit test, not `@WebMvcTest` | Parser controllers are thin guards + parser delegation. Instantiate directly: `new ReportMarkdownParserController(new ReportMarkdownParser())`. Faster, no Spring context needed, consistent with existing pattern. | `*MarkdownParserControllerTest` classes |
| Fail-soft: accumulate, never throw | Parsers must not throw exceptions. Accumulate errors and warnings into `ParsingIssue` lists; return a `ParsedArtifact` regardless of content quality. `MarkdownParserCore` errors trigger FAILED; parser-level issues produce warnings. | Every new parser |

---

## When Not to Promote

- Do not add a pattern here because it happened once in one parser.
- Do not generalize a process decision (e.g. a team deferral) into a parsing rule.
- If a pattern grows complex, move the detailed explanation into `docs/standards/backend.md`.
- Revisit LDC-4 (blackbox review checklist as standard artifact) after it appears in a second parser ticket.
