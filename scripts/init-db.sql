-- Created automatically by Cursor AI (2024-12-19)

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create database schema for Product Review Crew

-- Tenancy & Identity
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id),
    email CITEXT UNIQUE,
    name TEXT,
    role TEXT DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE memberships (
    user_id UUID REFERENCES users(id),
    org_id UUID REFERENCES orgs(id),
    role TEXT CHECK (role IN ('owner','admin','editor','researcher','legal','affiliate','viewer')) DEFAULT 'viewer',
    PRIMARY KEY (user_id, org_id)
);

-- Reviews & Briefs
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES orgs(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    audience TEXT NOT NULL,
    budget_low NUMERIC,
    budget_high NUMERIC,
    region TEXT,
    status TEXT CHECK (status IN ('created','researching','scoring','drafting','reviewing','approved','exported','archived')) DEFAULT 'created',
    style_guide JSONB,
    disclosure_policy JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    problem TEXT,
    must_haves TEXT[],
    exclusions TEXT[],
    include_products TEXT[],
    criteria_override JSONB,
    weights_override JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product Catalog (scoped to review)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    website TEXT,
    category TEXT,
    logo_key TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sources & Citations
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    kind TEXT CHECK (kind IN ('api','feed','html','doc','csv','manual')),
    uri TEXT,
    title TEXT NOT NULL,
    snapshot_key TEXT,
    fetched_at TIMESTAMPTZ,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE citations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES sources(id),
    anchor TEXT NOT NULL,
    quote TEXT NOT NULL,
    url TEXT,
    confidence TEXT CHECK (confidence IN ('A','B','C')) DEFAULT 'B',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Claims (normalized facts)
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    kind TEXT CHECK (kind IN ('feature','limit','price','platform','policy')),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    numeric_value NUMERIC,
    citation_id UUID REFERENCES citations(id),
    confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
    embedding VECTOR(1536),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Criteria & Scoring
CREATE TABLE criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    name TEXT NOT NULL,
    description TEXT,
    direction TEXT CHECK (direction IN ('higher_better','lower_better')) DEFAULT 'higher_better',
    normalization TEXT CHECK (normalization IN ('minmax','zscore','none')) DEFAULT 'minmax',
    weight NUMERIC CHECK (weight >= 0 AND weight <= 1) DEFAULT 0.1,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    criteria_id UUID REFERENCES criteria(id),
    raw NUMERIC NOT NULL,
    normalized NUMERIC NOT NULL,
    weighted NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    total_score NUMERIC NOT NULL,
    rank INT NOT NULL,
    method TEXT CHECK (method IN ('weighted','topsis')) DEFAULT 'weighted',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(review_id, product_id)
);

CREATE TABLE sensitivity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    delta_10 NUMERIC,
    delta_20 NUMERIC,
    delta_50 NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Editorial Content
CREATE TABLE writeups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    pros TEXT[],
    cons TEXT[],
    rationale TEXT,
    citation_ids UUID[],
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    kind TEXT CHECK (kind IN ('intro','methodology','buyers_guide','product_section','faq','conclusion')),
    order_idx INT NOT NULL,
    content JSONB NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- SEO & Affiliate
CREATE TABLE seo_meta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    title TEXT,
    description TEXT,
    slug TEXT,
    faq_jsonld JSONB,
    internal_links JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE affiliate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    url TEXT NOT NULL,
    params JSONB,
    disclosure TEXT,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Collaboration & Audit
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    review_id UUID REFERENCES reviews(id),
    section_id UUID REFERENCES document_sections(id),
    author_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    anchor JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE red_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    product_id UUID REFERENCES products(id),
    kind TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low','medium','high','critical')) DEFAULT 'medium',
    note TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    number INT NOT NULL,
    diff JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID REFERENCES orgs(id),
    user_id UUID REFERENCES users(id),
    review_id UUID REFERENCES reviews(id),
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Exports
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id),
    kind TEXT CHECK (kind IN ('markdown','html','mdx','csv','json','zip')),
    s3_key TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_claims_product_key ON claims (product_id, key);
CREATE INDEX idx_citations_source_id ON citations (source_id);
CREATE INDEX idx_sources_review_id ON sources (review_id);
CREATE INDEX idx_products_review_id ON products (review_id);
CREATE INDEX idx_criteria_review_id ON criteria (review_id);
CREATE INDEX idx_scores_review_id ON scores (review_id);
CREATE INDEX idx_rankings_review_id ON rankings (review_id);
CREATE INDEX idx_writeups_review_id ON writeups (review_id);
CREATE INDEX idx_sections_review_id ON document_sections (review_id);
CREATE INDEX idx_audit_log_org_id ON audit_log (org_id);
CREATE INDEX idx_audit_log_review_id ON audit_log (review_id);

-- Vector index for claims embeddings
CREATE INDEX idx_claims_embedding ON claims USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) setup
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE writeups ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- Sample data for development
INSERT INTO orgs (id, name, plan) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Demo Organization', 'pro');

INSERT INTO users (id, org_id, email, name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'admin@demo.com', 'Demo Admin', 'admin');

INSERT INTO memberships (user_id, org_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'owner');
