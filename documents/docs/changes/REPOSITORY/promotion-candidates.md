# Promotion Candidates – Repository CRUD

**Ticket ID**: REPOSITORY-CRUD
**Create date**: 2026-06-23
**Author**: ChatGPT

---

## 1. Purpose

This document extracts reusable knowledge, patterns, and lessons learned from the Repository CRUD implementation and testing.

The goal is to:

* Promote stable patterns into platform standards
* Avoid repeating known failure modes
* Improve future delivery speed and quality

---

## 2. Reusable Implementation Patterns

### 2.1 Standard CRUD Pattern (FE + BE)

**Pattern:**

* FE:

  * Server table + drawer form
  * TanStack Query for data fetching
  * Mutation → invalidate → refresh
* BE:

  * Thin controller
  * Service handles business rules
  * DTO mapping layer
* API:

  * Raw DTO (no envelope)
  * ErrorResponse for failures

**Candidate for:**

* CRUD template
* Developer onboarding guide

---

### 2.2 Soft Delete Pattern

**Behavior:**

* No physical delete
* `delete_flag` used
* Default list excludes deleted
* Detail still accessible
* Update/delete on deleted → reject

**Key Rule:**

* List ≠ Detail behavior

**Candidate for:**

* Database standard
* API behavior guideline

---

### 2.3 Uniqueness Scope Pattern

**Rule:**

* Unique per project (not global)
* Only active rows considered

**Implementation:**

* DB: partial unique index
* BE: validation
* Test: duplicate scenarios

**Candidate for:**

* DB design guideline
* Validation checklist

---

### 2.4 Trim-First Validation Pattern

**Rule:**

* Always trim input before:

  * Validation
  * Duplicate check
  * Persistence

**Failure risk:**

* `"repo-A"` vs `"  repo-A  "` treated differently

**Candidate for:**

* Input validation standard

---

### 2.5 Raw vs Encoded Data Pattern

**Case: repo_url**

* UI: raw value
* DB: encoded (AES-256-GCM)

**Test approach:**

* Validate behavior (not raw value)
* Use round-trip (encode → decode)

**Candidate for:**

* Security guideline
* Testing guideline

---

## 3. Reusable Testing Patterns

### 3.1 AC-driven Black-box Testing

**Structure:**

* AC → Test group
* Each AC includes:

  * Normal
  * Error
  * Boundary

**Benefit:**

* Full coverage
* Clear traceability

**Candidate for:**

* Testing standard update

---

### 3.2 Test Data Strategy

**Principles:**

* Deterministic
* Isolated
* Reusable

**Key techniques:**

* Separate project per test
* Dedicated duplicate dataset
* Soft delete dataset

**Candidate for:**

* Test data guideline

---

### 3.3 E2E Pattern (Playwright)

**Flow-based testing:**

* Create → verify list
* Update → verify persistence
* Delete → verify behavior

**Good practices:**

* Use API for setup/cleanup
* Use UI for validation

**Candidate for:**

* E2E testing template

---

### 3.4 Behavior-driven Validation

Instead of checking internal data:

* Validate:

  * API response
  * UI behavior
* Avoid:

  * Direct DB value assertions (e.g., encrypted fields)

**Candidate for:**

* Black-box testing guideline

---

## 4. Anti-patterns Identified

### 4.1 FE-only Validation

**Problem:**

* FE validation bypassable

**Rule:**

* Backend must enforce all validation

---

### 4.2 Missing Trim Before Validation

**Problem:**

* Duplicate bugs
* Inconsistent data

---

### 4.3 Misunderstanding Soft Delete

**Problem:**

* Treating deleted as non-existent everywhere

**Correct behavior:**

* Hidden in list
* Visible in detail

---

### 4.4 Over-reliance on Spec Text

**Problem:**

* Spec may be inconsistent

**Solution:**

* Cross-check:

  * DB
  * Existing patterns
  * Behavior

---

## 5. Failure Mode Index Candidates

These should be added to Failure Mode Index:

| ID    | Failure Mode              | Description              |
| ----- | ------------------------- | ------------------------ |
| FM-01 | Soft delete inconsistency | List vs detail mismatch  |
| FM-02 | Duplicate scope error     | Wrong uniqueness scope   |
| FM-03 | Missing trim              | Validation inconsistency |
| FM-04 | FE-only validation        | Security bypass          |
| FM-05 | Raw vs encoded confusion  | Data mismatch in tests   |

---

## 6. Living Docs Update Candidates

### 6.1 Testing Standards

Add:

* AC-driven black-box design
* Behavior-first validation
* Test data isolation strategy

---

### 6.2 API Contract Guidelines

Clarify:

* Raw DTO response
* ErrorResponse usage
* No custom envelope

---

### 6.3 Database Standards

Add:

* Soft delete pattern
* Partial unique index usage

---

### 6.4 CRUD Development Guide

Standardize:

* FE page structure
* BE layering
* Validation flow

---

## 7. Reusable Checklist (for future tickets)

Before implementation:

* [ ] AC clearly defined
* [ ] Duplicate scope identified
* [ ] Soft delete behavior defined

Before testing:

* [ ] Black-box cases created
* [ ] Test data prepared
* [ ] Edge cases identified

Before release:

* [ ] All AC tested
* [ ] No critical risk remaining
* [ ] Report completed

---

## 8. Conclusion

This ticket provides a strong reusable baseline for:

* CRUD implementation pattern
* Soft delete handling
* Black-box testing strategy
* E2E validation approach

These patterns should be promoted into platform standards to:

* Reduce ambiguity
* Improve consistency
* Accelerate future development
