// Created automatically by Cursor AI (2024-12-19)

import { z } from 'zod';

export const ReviewStatusSchema = z.enum([
  'created',
  'researching',
  'scoring',
  'drafting',
  'reviewing',
  'approved',
  'exported',
  'archived'
]);

export const SourceKindSchema = z.enum(['api', 'feed', 'html', 'doc', 'csv', 'manual']);

export const ClaimKindSchema = z.enum(['feature', 'limit', 'price', 'platform', 'policy']);

export const ConfidenceSchema = z.enum(['A', 'B', 'C']);

export const DirectionSchema = z.enum(['higher_better', 'lower_better']);

export const NormalizationSchema = z.enum(['minmax', 'zscore', 'none']);

export const MethodSchema = z.enum(['weighted', 'topsis']);

export const ReviewSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  category: z.string().min(1),
  audience: z.string().min(1),
  status: ReviewStatusSchema,
  budget_low: z.number().optional(),
  budget_high: z.number().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  name: z.string().min(1),
  vendor: z.string().min(1),
  website: z.string().url(),
  category: z.string().min(1),
  logo_key: z.string().optional(),
  active: z.boolean(),
});

export const SourceSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  product_id: z.string().uuid().optional(),
  kind: SourceKindSchema,
  uri: z.string().url().optional(),
  title: z.string().min(1),
  snapshot_key: z.string().optional(),
  fetched_at: z.string().datetime().optional(),
  meta: z.record(z.any()).optional(),
});

export const CitationSchema = z.object({
  id: z.string().uuid(),
  source_id: z.string().uuid(),
  anchor: z.string().min(1),
  quote: z.string().min(1),
  url: z.string().url().optional(),
  confidence: ConfidenceSchema,
  created_at: z.string().datetime(),
});

export const ClaimSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  kind: ClaimKindSchema,
  key: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
  numeric_value: z.number().optional(),
  citation_id: z.string().uuid(),
  confidence: z.number().min(0).max(1),
});

export const CriteriaSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  direction: DirectionSchema,
  normalization: NormalizationSchema,
  weight: z.number().min(0).max(1),
});

export const ScoreSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  product_id: z.string().uuid(),
  criteria_id: z.string().uuid(),
  raw: z.number(),
  normalized: z.number(),
  weighted: z.number(),
});

export const RankingSchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  product_id: z.string().uuid(),
  total_score: z.number(),
  rank: z.number().int().min(1),
  method: MethodSchema,
});

export const SensitivitySchema = z.object({
  id: z.string().uuid(),
  review_id: z.string().uuid(),
  product_id: z.string().uuid(),
  delta_10: z.number(),
  delta_20: z.number(),
  delta_50: z.number(),
});
