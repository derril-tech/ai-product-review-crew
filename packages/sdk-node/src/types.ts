// Created automatically by Cursor AI (2024-12-19)

export interface Review {
  id: string;
  title: string;
  category: string;
  audience: string;
  status: ReviewStatus;
  budget_low?: number;
  budget_high?: number;
  created_at: string;
  updated_at: string;
}

export type ReviewStatus = 
  | 'created'
  | 'researching'
  | 'scoring'
  | 'drafting'
  | 'reviewing'
  | 'approved'
  | 'exported'
  | 'archived';

export interface Product {
  id: string;
  review_id: string;
  name: string;
  vendor: string;
  website: string;
  category: string;
  logo_key?: string;
  active: boolean;
}

export interface Source {
  id: string;
  review_id: string;
  product_id?: string;
  kind: SourceKind;
  uri?: string;
  title: string;
  snapshot_key?: string;
  fetched_at?: string;
  meta?: Record<string, any>;
}

export type SourceKind = 'api' | 'feed' | 'html' | 'doc' | 'csv' | 'manual';

export interface Citation {
  id: string;
  source_id: string;
  anchor: string;
  quote: string;
  url?: string;
  confidence: 'A' | 'B' | 'C';
  created_at: string;
}

export interface Claim {
  id: string;
  product_id: string;
  kind: ClaimKind;
  key: string;
  value: string;
  unit?: string;
  numeric_value?: number;
  citation_id: string;
  confidence: number;
}

export type ClaimKind = 'feature' | 'limit' | 'price' | 'platform' | 'policy';

export interface Criteria {
  id: string;
  review_id: string;
  name: string;
  description: string;
  direction: 'higher_better' | 'lower_better';
  normalization: 'minmax' | 'zscore' | 'none';
  weight: number;
}

export interface Score {
  id: string;
  review_id: string;
  product_id: string;
  criteria_id: string;
  raw: number;
  normalized: number;
  weighted: number;
}

export interface Ranking {
  id: string;
  review_id: string;
  product_id: string;
  total_score: number;
  rank: number;
  method: 'weighted' | 'topsis';
}

export interface Sensitivity {
  id: string;
  review_id: string;
  product_id: string;
  delta_10: number;
  delta_20: number;
  delta_50: number;
}
