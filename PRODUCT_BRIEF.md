PRODUCT REVIEW CREW — END‑TO‑END PRODUCT BLUEPRINT
(React 18 + Next.js 14 App Router; CrewAI multi‑agent orchestration; TypeScript‑first contracts.)
1) Product Description & Presentation
One‑liner:
A multi‑agent system that produces balanced, citation‑backed product reviews and ranked comparison guides from a user brief—complete with pros/cons, weighted scoring matrix, use‑case recommendations, affiliate mapping, and CMS‑ready exports.
Positioning:
•
For tech writers, analyst firms, affiliate publishers, B2B content teams, and procurement doing shortlist comparisons.
•
Outputs: review article, comparison matrix, scores & rankings, use‑case picks, SEO metadata, image prompt pack, and affiliate link mapping, all with traceable citations.
Demo narrative:
1.
Input: “Compare the best AI video tools for freelancers under $50/mo.”
2.
Agents collect sources, extract claims (features/prices/limits), verify with citations, plan criteria & weights, and compute transparent scores.
3.
You see a comparison table + pros/cons + use‑case picks.
4.
One click → export to Markdown/HTML/Notion/WordPress, plus affiliate link insertion.
2) Target User
•
Content/SEO teams at publishers & SaaS.
•
Analyst/consulting groups producing buyer’s guides.
•
Creators/freelancers/SMBs selecting tools.
•
Enterprise procurement doing early vendor narrowing.
3) Features & Functionalities (Extensive)
Brief → Research
•
Brief intake: audience, budget band, must‑haves, nice‑to‑haves, geos, product list (include/exclude), competitors, tone/style guide.
•
Source ingestion (connectors & uploads): vendor docs/price pages, release notes/changelogs, app stores, public CSVs, review corpora (policy‑allowed), uploaded PDFs/DOCX.
•
Claim extraction: feature specs, platform support, limits, pricing/tiers, SLAs, security notes; each anchored to a citation.
Evaluation & Ranking
•
Criteria library by category (e.g., “AI video”: model quality, speed, caption accuracy, templates, collaboration, integrations, price/TCO).
•
Weighting via audience/use‑case sliders; MCDA scoring (weighted sum by default; optional TOPSIS).
•
Normalization: min‑max, z‑score; directionality (↑ better / ↓ better).
•
Sensitivity analysis showing how rankings shift when weights move ±10/20/50%.
•
Tie‑breakers: roadmap velocity, support SLA, ecosystem, data‑ownership.
Editorial Output
•
Pros/Cons per product with citations.
•
Use‑case picks (“Best for…”) aligned to personas.
•
Narrative article: intro, methodology, per‑product sections, FAQ, conclusion.
•
Comparison matrix with badges and footnotes.
•
SEO pack: titles, meta description, H1/H2 outline, FAQ JSON‑LD, internal link recs.
•
Image prompts: hero, thumbnails, abstract comparisons.
Collaboration & Governance
•
Roles: Editor, Researcher, Reviewer, Legal/Compliance, Affiliate Ops.
•
Comments/mentions, suggestion mode, section lock, citations‑required gate, plagiarism scan, affiliate disclosure checker.
•
Versioning with rich diffs; rollback and changelog.
Export & Distribution
•
CMS exports: Markdown/MDX, HTML (with scoped CSS), Notion, WordPress, Webflow.
•
Data exports: matrix CSV/JSON; image prompts JSON; citations JSONL.
•
Affiliate mapping: product → link + params; consistent disclosure blocks.
Analytics (optional)
•
Draft health: claim coverage %, citation confidence distribution, open “red flags,” editorial completeness.
•
Post‑publish hooks: read/scroll depth, CTR on affiliate links, table interactions (if embedded).
4) Backend Architecture (Extremely Detailed & Deployment‑Ready)
4.1 High‑Level Topology
•
Frontend/BFF: Next.js 14 (Vercel) with server actions for light mutations & signed URLs.
•
API Gateway: Node/NestJS (REST, OpenAPI 3.1, RBAC, rate limits, idempotency, validation w/ Zod/AJV).
•
Auth: Auth.js (OAuth) + short‑lived JWT (rotating refresh); SAML/OIDC; SCIM for enterprise provisioning.
•
Orchestration: CrewAI Orchestrator (Python FastAPI) coordinating agents: Reviewer (lead), Skeptic, Comparison Analyst, Consumer Advocate, Fact‑Checker, Pricing Verifier, Copy Chief, SEO Strategist, Image Prompt Designer, Compliance Officer.
•
Workers (Python):
o
source-ingest (APIs/feeds, safe HTML parsing adapters, CSV/PDF/DOCX parsing)
o
claim-extractor (NER + pattern rules + units)
o
pricing-normalizer (tier mapping, currency FX, tax/seat caveats)
o
criteria-planner (category template + audience weight adjustments)
o
scoring-engine (normalizers, weighted sums, TOPSIS, sensitivity)
o
pros-cons-synthesizer (with per‑claim evidence)
o
usecase-recommender (persona mapping, pitfalls/hidden costs)
o
narrative-writer (section drafts, style constraints)
o
seo-packager (metadata + FAQ JSON‑LD)
o
exporter (Markdown/HTML/MDX/CSV/ZIP)
•
Event Bus: NATS (source.*, claim.*, score.*, draft.*, export.*).
•
Task Queue: Celery (NATS/Redis backend), with queues: interactive, batch, exports.
•
DB: Postgres (Neon/Cloud SQL) + pgvector (embeddings for claims/sources/prior content).
•
Object Storage: S3/R2 (uploads, snapshots, exports, logos).
•
Cache: Upstash Redis (hot review state, matrices, presence).
•
Realtime: WebSocket gateway (NestJS Gateway), channels per review; SSE fallback.
•
Observability: OpenTelemetry traces, Prometheus/Grafana metrics, Sentry; structured JSON logs.
•
Secrets: Cloud Secrets Manager/Vault; KMS for encrypting integration tokens; no plaintext secrets in DB.
4.2 CrewAI Agents & Tools
Agents
•
Reviewer (lead) — orchestrates structure & tone; ensures fairness.
•
Skeptic — hunts fluff; raises “red flags”; checks contradictions across sources.
•
Comparison Analyst — designs criteria & weights, runs scoring/sensitivity, explains trade‑offs.
•
Consumer Advocate — focuses on real‑world usage and hidden costs; crafts “Best for…” picks.
•
Fact‑Checker — validates claims; assigns confidence (A/B/C); highlights weak sources.
•
Pricing Verifier — maps tiers; handles FX; notes billing gotchas.
•
Copy Chief — rewrites for clarity; enforces style/voice & disclosure.
•
SEO Strategist — search intent fit; schema; internal links.
•
Image Prompt Designer — produces succinct prompts; aligns with brand kit.
•
Compliance Officer — affiliate, disclosure, and plagiarism checks.
Tool Surface
•
Sources.fetch(adapter, params) → normalized payload + snapshot.
•
Claims.extract(text/html) → {product, key, value, unit, citation_anchor}.
•
Claims.verify(claim) → {confidence, citation_ids[]}.
•
Pricing.normalize(plans, fx) → USD/month, per‑seat, per‑render, caveats.
•
Criteria.plan(category, audience) → [{name, direction, normalization, default_weight}].
•
Score.compute(matrix, weights, method='weighted'|'topsis') → normalized + weighted + ranking.
•
Score.sensitivity(matrix, weight_deltas) → rank deltas.
•
ProsCons.summarize(claims) → {pros[], cons[]} with citation ids.
•
UseCases.recommend(personas, matrix, claims) → picks + rationale.
•
Copy.edit(content, style); SEO.generate(doc); Export.bundle(reviewId, targets[]).
4.3 Data Model (Postgres + pgvector)
-- Tenancy & Identity CREATE TABLE orgs ( id UUID PRIMARY KEY, name TEXT NOT NULL, plan TEXT, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE users ( id UUID PRIMARY KEY, org_id UUID REFERENCES orgs(id), email CITEXT UNIQUE, name TEXT, role TEXT, created_at TIMESTAMPTZ DEFAULT now() );
CREATE TABLE memberships ( user_id UUID REFERENCES users(id), org_id UUID REFERENCES orgs(id), role TEXT CHECK (role IN ('owner','admin','editor','researcher','legal','affiliate','viewer')), PRIMARY KEY (user_id, org_id) ); -- Reviews & Briefs CREATE TABLE reviews ( id UUID PRIMARY KEY, org_id UUID, title TEXT, category TEXT, audience TEXT, budget_low NUMERIC, budget_high NUMERIC, region TEXT, status TEXT CHECK (status IN ('created','researching','scoring','drafting','reviewing','approved','exported','archived')) DEFAULT 'created', style_guide JSONB, disclosure_policy JSONB, created_by UUID, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE briefs ( id UUID PRIMARY KEY, review_id UUID REFERENCES reviews(id), problem TEXT, must_haves TEXT[], exclusions TEXT[], include_products TEXT[], criteria_override JSONB, weights_override JSONB, updated_at TIMESTAMPTZ DEFAULT now() ); -- Product Catalog (scoped to review) CREATE TABLE products ( id UUID PRIMARY KEY, review_id UUID REFERENCES reviews(id), name TEXT, vendor TEXT, website TEXT, category TEXT, logo_key TEXT, active BOOLEAN DEFAULT TRUE ); -- Sources & Citations CREATE TABLE sources ( id UUID PRIMARY KEY, review_id UUID, product_id UUID, kind TEXT, -- 'api','feed','html','doc','csv','manual' uri TEXT, title TEXT, snapshot_key TEXT, fetched_at TIMESTAMPTZ, meta JSONB
); CREATE TABLE citations ( id UUID PRIMARY KEY, source_id UUID REFERENCES sources(id), anchor TEXT, quote TEXT, url TEXT, confidence TEXT CHECK (confidence IN ('A','B','C')), created_at TIMESTAMPTZ DEFAULT now() ); -- Claims (normalized facts) CREATE TABLE claims ( id UUID PRIMARY KEY, product_id UUID REFERENCES products(id), kind TEXT, -- 'feature','limit','price','platform','policy' key TEXT, value TEXT, unit TEXT, numeric_value NUMERIC, citation_id UUID REFERENCES citations(id), confidence NUMERIC, embedding VECTOR(1536) ); -- Criteria & Scoring CREATE TABLE criteria ( id UUID PRIMARY KEY, review_id UUID REFERENCES reviews(id), name TEXT, description TEXT, direction TEXT CHECK (direction IN ('higher_better','lower_better')), normalization TEXT CHECK (normalization IN ('minmax','zscore','none')) DEFAULT 'minmax', weight NUMERIC CHECK (weight >= 0 AND weight <= 1) ); CREATE TABLE scores ( id UUID PRIMARY KEY, review_id UUID, product_id UUID, criteria_id UUID, raw NUMERIC, normalized NUMERIC, weighted NUMERIC ); CREATE TABLE rankings ( id UUID PRIMARY KEY, review_id UUID, product_id UUID, total_score NUMERIC, rank INT, method TEXT CHECK (method IN ('weighted','topsis')) DEFAULT 'weighted' ); CREATE TABLE sensitivity (
id UUID PRIMARY KEY, review_id UUID, product_id UUID, delta_10 NUMERIC, delta_20 NUMERIC, delta_50 NUMERIC ); -- Editorial Content CREATE TABLE writeups ( id UUID PRIMARY KEY, review_id UUID, product_id UUID, pros TEXT[], cons TEXT[], rationale TEXT, citation_ids UUID[] ); CREATE TABLE document_sections ( id UUID PRIMARY KEY, review_id UUID, kind TEXT, -- 'intro','methodology','buyers_guide','product_section','faq','conclusion' order_idx INT, content JSONB, updated_by UUID, updated_at TIMESTAMPTZ DEFAULT now() ); -- SEO & Affiliate CREATE TABLE seo_meta ( id UUID PRIMARY KEY, review_id UUID REFERENCES reviews(id), title TEXT, description TEXT, slug TEXT, faq_jsonld JSONB, internal_links JSONB ); CREATE TABLE affiliate_links ( id UUID PRIMARY KEY, review_id UUID, product_id UUID REFERENCES products(id), url TEXT, params JSONB, disclosure TEXT, enabled BOOLEAN DEFAULT TRUE ); -- Collaboration & Audit CREATE TABLE comments ( id UUID PRIMARY KEY, review_id UUID, section_id UUID, author_id UUID, body TEXT, anchor JSONB, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE red_flags ( id UUID PRIMARY KEY, review_id UUID, product_id UUID, kind TEXT, severity TEXT, note TEXT, resolved BOOLEAN DEFAULT FALSE
); CREATE TABLE versions ( id UUID PRIMARY KEY, review_id UUID, number INT, diff JSONB, created_by UUID, created_at TIMESTAMPTZ DEFAULT now() ); CREATE TABLE audit_log ( id BIGSERIAL PRIMARY KEY, org_id UUID, user_id UUID, review_id UUID, action TEXT, target TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now() ); -- Exports CREATE TABLE exports ( id UUID PRIMARY KEY, review_id UUID, kind TEXT, -- 'markdown','html','mdx','csv','json','zip' s3_key TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now() );
Indexes & Constraints (high‑signal):
•
CREATE INDEX ON claims (product_id, key);
•
CREATE INDEX ON citations (source_id);
•
CREATE UNIQUE INDEX ON rankings (review_id, product_id);
•
CHECK (sum of criteria.weight per review == 1) enforced in service layer (transactional validation).
•
Vector index (HNSW/ivfflat) on claims.embedding if supported.
4.4 API Surface (REST /v1, OpenAPI)
Auth & Orgs
•
POST /v1/auth/login / POST /v1/auth/token / POST /v1/auth/refresh
•
GET /v1/me / GET /v1/orgs/:id
Reviews & Briefs
•
POST /v1/reviews {title, category, audience, budget, style_guide?}
•
GET /v1/reviews/:id / list with filters
•
PATCH /v1/reviews/:id (status transitions)
•
POST /v1/reviews/:id/brief {must_haves, exclusions, include_products, criteria_override?, weights_override?}
Products & Sources
•
POST /v1/reviews/:id/products {name, vendor, website}
•
GET /v1/reviews/:id/products
•
POST /v1/reviews/:id/sources (multipart/JSON) {product_id?, kind, uri?, file?}
•
GET /v1/reviews/:id/sources
•
POST /v1/sources/:id/ingest → snapshot + parse
•
GET /v1/sources/:id/citations
Claims & Pricing
•
POST /v1/reviews/:id/claims/extract {source_id}
•
GET /v1/reviews/:id/claims?product_id=&key=
•
POST /v1/reviews/:id/pricing/normalize {product_id}
Criteria & Scoring
•
POST /v1/reviews/:id/criteria/plan {category, audience}
•
PATCH /v1/criteria/:id {weight, normalization, direction}
•
POST /v1/reviews/:id/score {method} → compute scores/rankings
•
GET /v1/reviews/:id/rankings
•
GET /v1/reviews/:id/sensitivity
Editorial & SEO
•
POST /v1/reviews/:id/proscons {product_id} → synthesize lists
•
POST /v1/reviews/:id/usecases {personas}
•
POST /v1/reviews/:id/narrative {sections?}
•
POST /v1/reviews/:id/seo → title/meta/FAQ JSON‑LD
•
PATCH /v1/sections/:id {content}
Affiliate & Compliance
•
POST /v1/reviews/:id/affiliate {product_id, url, params, disclosure}
•
GET /v1/reviews/:id/affiliate
•
POST /v1/reviews/:id/compliance/check → disclosure/plagiarism flags
•
POST /v1/redflags {review_id, product_id, kind, severity, note}
Exports
•
POST /v1/reviews/:id/export {targets:['markdown','html','mdx','csv','json','zip']}
•
GET /v1/exports/:id → signed URL
Conventions
•
All mutations require Idempotency‑Key header.
•
Errors: Problem+JSON (type, title, detail, status, code).
•
Cursor pagination; strict RLS by org/review.
4.5 Orchestration Logic (CrewAI)
State machine (per review):
created → researching → scoring → drafting → reviewing → approved → exported → archived
Turn sequence (typical run):
1.
source-ingest pulls allowed sources → snapshots & citations created.
2.
claim-extractor parses claims per product (features/limits/pricing).
3.
fact-checker assigns confidence (A/B/C) and flags contradictions.
4.
criteria-planner proposes criteria/weights; user can tweak.
5.
scoring-engine normalizes & scores; sensitivity computed.
6.
pros-cons-synthesizer + usecase-recommender draft content.
7.
narrative-writer composes intro/methodology/sections/FAQ; copy‑chief edits; SEO prepares metadata.
8.
compliance officer validates disclosures & plagiarism; affiliate links inserted.
9.
exporter bundles outputs.
4.6 Background Jobs
•
IngestSource(sourceId) → fetch/snapshot/parse.
•
ExtractClaims(sourceId) → claims with citation anchors.
•
NormalizePricing(productId) → USD/month with caveats.
•
PlanCriteria(reviewId) → default set + weights.
•
ScoreReview(reviewId, method) → scores/rankings/sensitivity.
•
SynthesizeProsCons(reviewId) → lists per product.
•
ComposeNarrative(reviewId) → section drafts.
•
BuildSEO(reviewId) → title/meta/FAQ.
•
ComplianceCheck(reviewId) → disclosures/plagiarism fences.
•
ExportBundle(reviewId, targets[]) → S3 links.
4.7 Realtime
•
WS channels:
o
review:{id}:ingest (source progress)
o
review:{id}:claims (extraction ticks)
o
review:{id}:score (matrix ready, rank deltas)
o
review:{id}:draft (section partials)
o
review:{id}:export (artifact status)
•
Presence: who’s editing which section; suggestion mode live updates.
•
SSE fallback for restrictive networks.
4.8 Caching & Performance
•
Redis caches: product lists, current matrix, recent citations, section drafts.
•
Concurrency cap per review for heavy extractions and scoring.
•
SLOs:
o
First matrix preview < 3s P95 after scoring job starts.
o
Full draft (6–10 products) < 90s P95.
o
Export bundle < 15s P95.
4.9 Observability
•
Traces across gateway → orchestrator → workers; span tags (model/provider, tokens, source count).
•
Metrics: claim coverage %, confidence distribution, time to first ranking, editorial completion %, export success.
•
Logs: structured JSON with correlation ids (review_id, product_id, source_id); citation text redacted to safe snippets.
5) Frontend Architecture (React 18 + Next.js 14)
5.1 Tech Choices
•
Next.js 14 App Router, TypeScript.
•
UI: shadcn/ui + Tailwind (accessible, enterprise‑clean).
•
State/data: TanStack Query (server cache) + Zustand for editor/matrix transient state.
•
Realtime: WebSocket client with auto‑reconnect/backoff; SSE fallback.
•
Editors: TipTap for narrative sections; Monaco for JSON/YAML when editing criteria or SEO JSON‑LD.
•
Tables: virtualized lists for products/claims/matrix.
•
Charts: Recharts (sensitivity tornado, rank deltas).
5.2 App Structure
/app /(marketing)/page.tsx /(app) dashboard/page.tsx reviews/ page.tsx new/page.tsx [reviewId]/ page.tsx // Overview brief/page.tsx products/page.tsx sources/page.tsx claims/page.tsx criteria/page.tsx matrix/page.tsx writeups/page.tsx seo/page.tsx affiliate/page.tsx exports/page.tsx admin/ integrations/page.tsx audit/page.tsx /components
ReviewWizard/* ProductTable/* SourceIngestor/* CitationPanel/* ClaimGrid/* CriteriaEditor/* WeightSliderGroup/* MatrixTable/* SensitivityChart/* ProsConsEditor/* UseCasePicker/* SectionEditor/* SEOEditor/* AffiliateManager/* ExportHub/* DiffViewer/* /lib api-client.ts ws-client.ts zod-schemas.ts rbac.ts /store useReviewStore.ts useMatrixStore.ts useEditorStore.ts useRealtimeStore.ts
5.3 Key Pages & UX Flows
Dashboard
•
Tiles: “Start Review”, “In Review”, “Exports”, “Red Flags”.
•
Quick links to drafts needing citations or compliance fixes.
Review Overview
•
Status stepper (Research → Scoring → Draft → Review → Export).
•
KPI chips: claim coverage %, citation confidence mix, rank volatility, disclosure status.
Brief
•
ReviewWizard: audience, budget, must‑haves; product include/exclude; tone presets.
•
Save instantly; triggers criteria planning.
Products
•
ProductTable: add/edit products; drag to reorder featured picks; upload logos.
Sources
•
SourceIngestor: add URLs/uploads; connection adapters; ingest progress.
•
CitationPanel per source with anchors and confidence.
Claims
•
ClaimGrid: product rows, claim keys/values; filter by kind (feature/price/limit); jump to citation; flag contradictions.
Criteria
•
CriteriaEditor + WeightSliderGroup; preset templates by category & audience.
•
Validation ensures weights sum to 1; preview normalization.
Matrix
•
MatrixTable (virtualized): raw, normalized, weighted columns; total & rank.
•
SensitivityChart (tornado or rank change plot) with +/- weight toggles.
Writeups
•
ProsConsEditor (linked to citations); UseCasePicker with persona cards.
•
SectionEditor (TipTap): intro, methodology, product sections, FAQ, conclusion.
•
Live “citations required” toggle (blocks export if missing).
SEO
•
SEOEditor: title/meta/slug; FAQ JSON‑LD editor (Monaco) with schema validation; internal link suggestions.
Affiliate
•
AffiliateManager: add link templates; auto‑insert disclosure blocks; link health checks.
Exports
•
ExportHub: choose artifacts; watch WS progress; download signed URLs.
•
“View diff since last export” (re-renders MDX/HTML diffs with DiffViewer).
5.4 Component Breakdown (Selected)
•
MatrixTable/Row.tsx
Props: { product, scores, normalization, showWeighted }; pinned first column; keyboard navigation; sticky rank column.
•
SensitivityChart/Tornado.tsx
Props: { ranksBaseline, ranksDelta10, ranksDelta20, ranksDelta50 }; renders bars per product; tooltip shows direction and magnitude.
•
CitationPanel/AnchorCard.tsx
Props: { citation }; displays source title/quote/confidence; “jump to usage” to highlight where used in pros/cons/narrative.
•
SectionEditor/Toolbar.tsx
Buttons: insert citation chips, callouts, disclosure block; style guard rails from style_guide.
•
AffiliateManager/LinkRow.tsx
Props: { product, link }; inline edit URL/params; preview UTM; health status icon.
5.5 Data Fetching & Caching
•
Server Components for lists (reviews, products, claims).
•
TanStack Query for mutations & live pages; cache keys per review/product.
•
WS pushes (ingest/score/draft/export) update caches via queryClient.setQueryData.
•
Prefetch adjacent routes (criteria ↔ matrix ↔ writeups) on hover.
5.6 Validation & Error Handling
•
Shared Zod schemas for briefs, criteria, claims, writeups, SEO JSON‑LD, affiliate links.
•
Idempotency‑Key on generate/score/export actions.
•
Inline Problem+JSON error renderer with remediation tips (e.g., “weights sum to 1.00”).
•
Citation guard: publishing blocked if any paragraph with a factual claim lacks a citation chip.
5.7 Accessibility & i18n
•
Keyboard navigation across tables/editors; ARIA roles; skip‑links.
•
High‑contrast & color‑blind safe palettes; focus-visible outlines.
•
next-intl scaffolding; all copy externalized; RTL ready.
6) Integrations
•
CMS: Notion, WordPress, Webflow; Markdown/MDX export (generic).
•
Storage: Google Drive/SharePoint (optional) for source uploads.
•
Affiliate: generic URL templates + partner parameters.
•
Comms: Slack/Email notifications (review ready, export done).
•
Identity: Auth.js; SAML/OIDC; SCIM.
•
Billing: Stripe (seats + metered generations).
•
Analytics (optional): Segment → GA4/Mixpanel for post‑publish events.
7) DevOps & Deployment
•
FE: Vercel (Next.js 14).
•
APIs/Workers: Render/Fly.io for simplicity; GKE for scale (separate pools for parsing vs. generation).
•
DB: Neon/Cloud SQL Postgres + pgvector; PITR backups.
•
Cache: Upstash Redis.
•
Object Store: S3/R2 with lifecycle rules (retain exports; purge temp snapshots).
•
Event Bus: NATS (managed/self‑hosted).
•
CI/CD: GitHub Actions (lint/typecheck/unit; Docker build; SBOM + cosign; deploy approvals; DB migrations).
•
IaC: Terraform modules (DB, Redis, NATS, buckets, secrets, DNS/CDN).
•
Testing:
o
Unit (claim parsing, normalization, scoring, TOPSIS, sensitivity).
o
Contract (OpenAPI + schema validators).
o
E2E (Playwright: brief→ingest→claims→criteria→score→draft→export).
o
Load (k6: many products/sources, parallel scoring).
o
Chaos (flaky sources; rate‑limit backoff).
o
Security (ZAP; container scans; secret scanning).
•
SLOs: First ranking < 3s P95; full draft (≤10 products) < 90s P95; export < 15s P95.
8) Success Criteria
Product KPIs
•
Claim coverage ≥ 85% (avg claims/product with A/B citations).
•
Editorial time reduced ≥ 40% vs. baseline.
•
Reader trust proxy: average citation confidence ≥ B across article.
•
Affiliate CTR uplift ≥ 15% vs. legacy pages (if enabled).
•
Revision churn post‑publish ≤ 10% within first 30 days.
Engineering SLOs
•
Score compute < 1.5s P95 for ≤10 products × ≤12 criteria.
•
Export success ≥ 99% (excl. CMS outages).
•
5xx rate < 0.5% / 1k.
9) Security & Compliance
•
RBAC: Owner/Admin/Editor/Researcher/Legal/Affiliate/Viewer; section locks and publish permissions.
•
Encryption: TLS 1.2+; AES‑256 at rest; KMS envelope for tokens.
•
Source hygiene: snapshotting; safe parsers; PII redaction in logs; plagiarism detector.
•
Tenant isolation: Postgres RLS; S3 prefix isolation; scoped signed URLs.
•
Auditability: immutable audit of edits, weight changes, ranking runs, exports.
•
Supply chain: SLSA provenance; image signing; pinned base images; Dependabot.
•
Compliance: SOC 2 Type II, ISO 27001 roadmap; GDPR (DSRs, data minimization).
10) Visual/Logical Flows
Brief → Plan
User sets brief → criteria-planner proposes criteria & weights → user tweaks → lock.
Research → Claims
Add sources → source-ingest snapshots → claim-extractor mines claims → fact-checker assigns confidence → contradictions surfaced.
Score → Sensitivity
scoring-engine normalizes & weights → rankings saved → sensitivity computes rank deltas vs. weight changes → UI shows tornado/rank shifts.
Draft → Review
Pros/cons + use‑case drafts → narrative sections → copy‑chief edits → SEO pack → compliance checks (disclosures/plagiarism).
Export
Choose targets → exporter builds Markdown/HTML/MDX/CSV/ZIP → S3 links → CMS push (if connected).