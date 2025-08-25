# TODO — Product Review Crew
> 80/20: **[Cursor]** infra/contracts/UI; **[Claude]** agent flows/prompts/heuristics.

## Phase 0 — Repo, Rules, CI/CD ✅
- [x] [Cursor] Monorepo: `apps/{frontend,gateway,orchestrator,workers}`, `packages/{sdk-web,sdk-node}`; base ESLint/Prettier/TS configs.
- [x] [Cursor] `docker-compose.dev.yml`: Postgres+pgvector, Redis, NATS, MinIO; healthchecks; seed script.
- [x] [Cursor] `env.example`: DB/REDIS/NATS/S3/JWT/OAuth; CMS creds (optional); FX rates source key.
- [x] [Cursor] `.gitignore`: Comprehensive ignore patterns for all languages and tools.

## Phase 1 — DB & API Contracts ✅
- [x] [Cursor] SQL migrations (tables in ARCH).
- [x] [Cursor] NestJS modules:
  - Auth (JWT) + RBAC guards + org‑scope injection.
  - Reviews/Briefs/Products.
  - Sources/Citations (placeholder).
  - Claims/Pricing (placeholder).
  - Criteria/Scoring/Rankings/Sensitivity (placeholder).
  - Editorial (writeups/sections) (placeholder).
  - SEO/Affiliate (placeholder).
  - Exports (placeholder).
  - Health checks.
- [x] [Cursor] Generate typed SDKs (`packages/sdk-*`) for FE/workers.

## Phase 2 — Source Ingest & Citations ✅
- [x] [Cursor] Worker `source-ingest`: safe HTML fetchers, PDF/DOCX/CSV parsers, snapshot to S3; create `sources` & `citations`.
- [x] [Cursor] NestJS Sources module: full CRUD with citations, ingest triggers.
- [x] [Cursor] NestJS Claims module: full CRUD with extraction triggers.
- [x] [Claude] Adapters/prompting for citation extraction; confidence rubric (A/B/C).

## Phase 3 — Claims & Pricing ✅
- [x] [Cursor] `claim-extractor`: map {product, key, value, unit, numeric_value}; contradictions table; HNSW index for claim search.
- [x] [Cursor] `pricing-normalizer`: USD/mo, per‑seat/per‑render flags, FX via daily rates, caveats.
- [Cursor] FE **ClaimGrid** with filters (feature/limit/price) + “jump to citation”.
- [Claude] Pattern library for pricing/limits/features; contradiction detection prompts.

## Phase 4 — Criteria, Scoring, Sensitivity ✅
- [x] [Cursor] `criteria-planner` (templates per category); `scoring-engine`:
  - Normalizers: min‑max, z‑score; directionality.
  - MCDA weighted sum; TOPSIS option.
  - Sensitivity: recompute ranks for ±10/20/50% weight deltas.
- [x] [Cursor] FE **CriteriaEditor**, **WeightSliderGroup**, **MatrixTable**, **SensitivityChart**.
- [Claude] Category presets (e.g., AI video) & audience weight heuristics.

## Phase 5 — Pros/Cons, Use‑Cases, Red‑Flags ✅
- [x] [Cursor] `pros-cons-synthesizer`, `usecase-recommender`; persist `writeups`.
- [x] [Cursor] FE **ProsConsEditor** + **UseCasePicker**; **RedFlag** surfacing (severity, resolution).
- [Claude] Evidence‑anchored summarization with citation ids; hidden‑costs prompts.

## Phase 6 — Narrative, SEO, Compliance ✅
- [x] [Cursor] `narrative-writer`, `seo-packager`; FE **SectionEditor** & **SEOEditor** with JSON‑LD schema validation.
- [Cursor] Compliance checks: disclosure present, plagiarism score, citation coverage gate.
- [Claude] Style/voice enforcement, disclosure phrasing; internal links suggestions.

## Phase 7 — Affiliate
- [Cursor] Affiliate link CRUD + auto‑insert; link health pings; disclosure blocks.
- [Cursor] FE **AffiliateManager**.
- [Claude] Template expansion rules (UTM/partner params); brand‑safe insertion logic.

## Phase 8 — Exports & CMS Push
- [Cursor] `exporter`: Markdown/HTML/MDX/CSV/ZIP; image prompt JSON; signed URLs; Notion/WordPress/Webflow adapters (optional).
- [Cursor] FE **ExportHub** with WS job status & “diff since last export”.
- [Claude] MDX block composition & alt text/image prompt packs.

## Phase 9 — Analytics & Hardening
- [Cursor] Draft health metrics (claim coverage %, confidence mix, rank volatility); segment events (optional).
- [Cursor] OTel traces, Grafana dashboards (ingest/score/draft/export); Sentry alerts.
- [Cursor] Cost guardrails: per‑org token buckets; concurrency caps.
- [Cursor] Retention & snapshot lifecycle; PII‑safe logs; plagiarism threshold config.

## Phase 10 — Testing
- Unit: claim parsing, pricing normalize, scoring, TOPSIS, sensitivity math.
- Contract: OpenAPI schema & Zod parity.
- E2E (Playwright): brief→ingest→claims→criteria→score→draft→export.
- Load (k6): many products/sources; parallel scoring.
- Chaos: flaky sources, FX unavailability, LLM latency spikes.
- Security: ZAP, dependency scans, secret scanning; signed URL scope tests.
