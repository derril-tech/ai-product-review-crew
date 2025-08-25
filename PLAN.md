# Project Plan — Product Review Crew

## Current Goal
Ship an MVP that runs end‑to‑end: **brief → ingest sources → extract & verify claims → criteria/weights → score & rank (+ sensitivity) → pros/cons & use‑case picks → article/SEO → CMS/MD/HTML exports with affiliate mapping and citations**.

## 80/20 Build Strategy
- **80% [Cursor]**: monorepo & infra, DB schema + migrations, REST/OpenAPI, WS events, FE (criteria/matrix/editor/export), scoring & sensitivity math, exporters (Markdown/HTML/MDX/CSV/ZIP), affiliate link manager, CI/CD, observability, RBAC/RLS.
- **20% [Claude]**: CrewAI graphs (Reviewer/Skeptic/Comparison Analyst/Consumer Advocate/Fact‑Checker/Pricing/Copy/SEO/Image/Compliance), prompt packs, claim patterns, pricing normalization heuristics, copy/style constraints, disclosure checks.

## Next 3 Tasks
1. **[Cursor]** Scaffold monorepo + `docker-compose.dev` (Postgres+pgvector, Redis, NATS, MinIO) + `.env.example` + GitHub Actions (lint/test/build, SBOM & signing).
2. **[Cursor]** NestJS gateway modules: auth, reviews/briefs/products/sources/claims, criteria/scoring/rankings, writeups/sections, SEO/affiliate, exports; OpenAPI 3.1, Problem+JSON, Idempotency, WS.
3. **[Claude]** Orchestrator (FastAPI + CrewAI) FSM `created→researching→scoring→drafting→reviewing→approved→exported` + tool adapters (Sources.fetch, Claims.extract/verify, Pricing.normalize, Criteria.plan, Score.compute/sensitivity, ProsCons.summarize, UseCases.recommend, Copy.edit, SEO.generate, Export.bundle).

## Phase Plan
- **P0** Repo/infra/CI
- **P1** DB + API contracts + auth/RLS
- **P2** Source ingest + citation store
- **P3** Claim extraction + pricing normalization
- **P4** Criteria planner + scoring + sensitivity
- **P5** Pros/cons & use‑case drafts + contradiction surfacing
- **P6** Narrative/SEO/disclosures + editorial guardrails
- **P7** Affiliate mapping + compliance checks
- **P8** Exports (MD/HTML/MDX/CSV/ZIP) + CMS push
- **P9** Analytics & red‑flags + hardening/tests
- **P10** Cost guardrails, dashboards, docs

## Definition of Done (MVP)
- Create review from brief; add products; ingest ≥1 source per product (snapshot + citations).
- Claims stored with anchors & confidence; pricing normalized to USD/mo with caveats.
- Criteria & weights editable; scores & rankings computed; sensitivity (+/‑10/20/50%) visible.
- Pros/cons and “Best for …” picks generated with citation coverage ≥ 80% across product sections.
- Narrative, methodology, FAQ, SEO pack (title/meta/FAQ JSON‑LD) ready; disclosure block present.
- Affiliate links stored & auto‑inserted; compliance check green.
- Exports work: Markdown, HTML, MDX, CSV (matrix/claims), ZIP bundle.
- Realtime progress via WS; org‑scoped RLS; immutable audit for edits/weights/exports.
