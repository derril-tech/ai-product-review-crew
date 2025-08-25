# DONE — Product Review Crew

## Phase 0 — Repo, Rules, CI/CD
[2024-12-19] [Cursor] Monorepo: `apps/{frontend,gateway,orchestrator,workers}`, `packages/{sdk-web,sdk-node}`; base ESLint/Prettier/TS configs.
[2024-12-19] [Cursor] `docker-compose.dev.yml`: Postgres+pgvector, Redis, NATS, MinIO; healthchecks; seed script.
[2024-12-19] [Cursor] `env.example`: DB/REDIS/NATS/S3/JWT/OAuth; CMS creds (optional); FX rates source key.
[2024-12-19] [Cursor] `.gitignore`: Comprehensive ignore patterns for all languages and tools.

## Phase 1 — DB & API Contracts
[2024-12-19] [Cursor] SQL migrations (tables in ARCH).
[2024-12-19] [Cursor] NestJS modules: Auth (JWT) + RBAC guards + org‑scope injection.
[2024-12-19] [Cursor] NestJS modules: Reviews/Briefs/Products.
[2024-12-19] [Cursor] NestJS modules: Sources/Citations/Claims/Criteria/Scoring/Editorial/SEO/Affiliate/Exports (placeholders).
[2024-12-19] [Cursor] Generate typed SDKs (`packages/sdk-*`) for FE/workers.

## Phase 2 — Source Ingest & Citations
[2024-12-19] [Cursor] Worker `source-ingest`: safe HTML fetchers, PDF/DOCX/CSV parsers, snapshot to S3; create `sources` & `citations`.
[2024-12-19] [Cursor] NestJS Sources module: full CRUD with citations, ingest triggers.
[2024-12-19] [Cursor] NestJS Claims module: full CRUD with extraction triggers.
[2024-12-19] [Claude] Adapters/prompting for citation extraction; confidence rubric (A/B/C).

## Phase 3 — Claims & Pricing
[2024-12-19] [Cursor] `claim-extractor`: map {product, key, value, unit, numeric_value}; contradictions table; HNSW index for claim search.
[2024-12-19] [Cursor] `pricing-normalizer`: USD/mo, per‑seat/per‑render flags, FX via daily rates, caveats.
[2024-12-19] [Cursor] `criteria-planner`: category templates, audience weight adjustments.
[2024-12-19] [Cursor] `scoring-engine`: normalization, weighted sums, TOPSIS, sensitivity analysis.
[2024-12-19] [Claude] Pattern library for pricing/limits/features; contradiction detection prompts.

## Phase 4 — Criteria, Scoring, Sensitivity
[2024-12-19] [Cursor] `criteria-planner` (templates per category); `scoring-engine`: normalizers, MCDA weighted sum, TOPSIS option, sensitivity analysis.
[2024-12-19] [Cursor] FE **CriteriaEditor**, **WeightSliderGroup**, **MatrixTable**, **SensitivityChart**.
[2024-12-19] [Claude] Category presets (e.g., AI video) & audience weight heuristics.

## Phase 5 — Pros/Cons, Use‑Cases, Red‑Flags
[2024-12-19] [Cursor] `pros-cons-synthesizer`, `usecase-recommender`; persist `writeups`.
[2024-12-19] [Cursor] FE **ProsConsEditor** + **UseCasePicker**; **RedFlag** surfacing (severity, resolution).
[2024-12-19] [Claude] Evidence‑anchored summarization with citation ids; hidden‑costs prompts.

## Phase 6 — Narrative, SEO, Compliance
[2024-12-19] [Cursor] `narrative-writer`, `seo-packager`; FE **SectionEditor** & **SEOEditor** with JSON‑LD schema validation.
[2024-12-19] [Claude] Style/voice enforcement, disclosure phrasing; internal links suggestions.

## Phase 7 — Affiliate, Export, Compliance
[2024-12-19] [Cursor] `affiliate-link-manager` worker; link health pings; auto‑insert; disclosure blocks.
[2024-12-19] [Cursor] FE **AffiliateManager**; link CRUD + health monitoring; auto‑insert settings.
[2024-12-19] [Cursor] `exporter` worker; PDF/Word/HTML/JSON exports; S3/MinIO upload.
[2024-12-19] [Cursor] FE **ExportHub**; format selection; job monitoring; download management.

## Phase 9 — Analytics & Hardening
[2024-12-19] [Cursor] `analytics-collector` worker; claim coverage, confidence mix, rank volatility metrics.
[2024-12-19] [Cursor] FE **AnalyticsDashboard**; performance, quality, cost visualization with Recharts.

## Phase 10 — Testing
[2024-12-19] [Cursor] Comprehensive test suite for all worker tasks; unit, integration, and performance tests.
[2024-12-19] [Cursor] GitHub Actions CI/CD pipeline; linting, testing, security scanning, Docker builds, deployment.
