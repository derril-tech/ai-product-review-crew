# Architecture — Product Review Crew

## Topology
- **Frontend**: Next.js 14 (Vercel), TS, shadcn/Tailwind, TanStack Query + Zustand, TipTap (sections), Monaco (JSON‑LD), virtualized tables, Recharts (tornado/rank deltas), WS/SSE.
- **API Gateway**: NestJS (REST, OpenAPI 3.1, RBAC, Idempotency‑Key, Problem+JSON, rate limits, signed URLs).
- **Auth**: Auth.js + JWT (short‑lived) + rotating refresh; SAML/OIDC; SCIM.
- **Orchestrator**: FastAPI + CrewAI; FSM `created→researching→scoring→drafting→reviewing→approved→exported→archived`.
- **Workers (Python)**: `source-ingest`, `claim-extractor`, `pricing-normalizer`, `criteria-planner`, `scoring-engine`, `pros-cons-synthesizer`, `usecase-recommender`, `narrative-writer`, `seo-packager`, `exporter`.
- **Infra**: NATS bus; Celery (Redis/NATS); Postgres + pgvector; S3/R2; Redis (Upstash); OTel + Prometheus/Grafana + Sentry; Vault/KMS.

## Data Model (Postgres + pgvector)
- Tenancy: `orgs`, `users`, `memberships`.
- Review core: `reviews`, `briefs`, `products`.
- Sources: `sources`, `citations` (quote, anchor, confidence).
- Facts: `claims` (kind/key/value/unit/numeric_value, citation_id, confidence, embedding).
- Criteria & scoring: `criteria`, `scores`, `rankings`, `sensitivity`.
- Editorial: `writeups`, `document_sections`.
- SEO & affiliate: `seo_meta`, `affiliate_links`.
- Collaboration & audit: `comments`, `red_flags`, `versions`, `audit_log`.
- Exports: `exports`.

## API Surface (v1)
- **Auth/Orgs**: login/token/refresh; `GET /v1/me`.
- **Reviews**: create/list/get/patch status; `POST /:id/brief`.
- **Products**: CRUD under review.
- **Sources**: add/list; `POST /sources/:id/ingest`; `GET /sources/:id/citations`.
- **Claims**: `POST /reviews/:id/claims/extract {source_id}`; list/filter; pricing normalize.
- **Criteria/Scoring**: plan; update weights; `POST /:id/score {method}`; rankings; sensitivity.
- **Editorial**: pros/cons synth; use‑case picks; narrative compose; patch sections.
- **SEO**: generate pack; update.
- **Affiliate/Compliance**: link CRUD; disclosure/plagiarism checks; red‑flags.
- **Exports**: bundle to Markdown/HTML/MDX/CSV/ZIP; signed URL fetch.
Conventions: Idempotency‑Key on writes; Problem+JSON errors; cursor pagination; strict RLS by org/review.

## Agents & Tooling
Agents: **Reviewer (lead), Skeptic, Comparison Analyst, Consumer Advocate, Fact‑Checker, Pricing Verifier, Copy Chief, SEO Strategist, Image Prompt Designer, Compliance Officer**.  
Tools: **Sources.fetch**, **Claims.extract/verify**, **Pricing.normalize**, **Criteria.plan**, **Score.compute/sensitivity**, **ProsCons.summarize**, **UseCases.recommend**, **Copy.edit**, **SEO.generate**, **Export.bundle**.

## Realtime Channels
- `review:{id}:ingest` (source progress)
- `review:{id}:claims` (extraction ticks)
- `review:{id}:score` (matrix/ranks/sensitivity)
- `review:{id}:draft` (section partials)
- `review:{id}:export` (artifact status)
Presence & suggestion‑mode streams; SSE fallback.

## Security & Safety
RBAC (Owner/Admin/Editor/Researcher/Legal/Affiliate/Viewer); Postgres RLS; secrets vaulted; token envelope encryption; snapshot all sources; PII redaction in logs; plagiarism & disclosure checks; immutable audit of weights/edits/exports.

## Deployment
FE: Vercel. APIs/Workers: Render/Fly → GKE as scale grows. DB: Neon/Cloud SQL + pgvector. Cache: Upstash Redis. Storage: S3/R2. Bus: NATS. CI/CD: GitHub Actions; Terraform; SBOM + cosign; migrations.

## SLOs
- First ranking < **3s** P95 (≤10 products × ≤12 criteria)
- Full draft (6–10 products) < **90s** P95
- Export bundle < **15s** P95
- 5xx < **0.5%/1k** requests
