# AGENTS.md

## Purpose

Shared instructions for AI agents such as Claude, Codex, Cursor, Copilot, or similar tools.

## Core Rules

- Read `.claude/CLAUDE.md` first.
- Do not implement anything until the Plan has been approved.
- `docs/changes/<TICKET>/spec-pack.md` is the single source of truth for the specification.
- Clearly separate facts, assumptions, open issues, and human decisions.
- Do not read or store secrets, PII, credentials, or raw production logs.

## Review Output Requirement

Each finding must include:

- File path or target location
- What will break
- Reproduction conditions
- Basis from the specification or existing behavior
- Suggested fix
- Suggested test
- Confidence