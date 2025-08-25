// Created automatically by Cursor AI (2024-12-19)

import { Review, Product, Source, Citation, Claim, Criteria, Score, Ranking, Sensitivity } from './types';

export class ProductReviewCrewClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:3001/v1', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Reviews
  async createReview(data: Partial<Review>): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReview(id: string): Promise<Review> {
    return this.request<Review>(`/reviews/${id}`);
  }

  async listReviews(): Promise<Review[]> {
    return this.request<Review[]>('/reviews');
  }

  // Products
  async createProduct(reviewId: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/reviews/${reviewId}/products`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProducts(reviewId: string): Promise<Product[]> {
    return this.request<Product[]>(`/reviews/${reviewId}/products`);
  }

  // Sources
  async createSource(reviewId: string, data: Partial<Source>): Promise<Source> {
    return this.request<Source>(`/reviews/${reviewId}/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSources(reviewId: string): Promise<Source[]> {
    return this.request<Source[]>(`/reviews/${reviewId}/sources`);
  }

  async ingestSource(sourceId: string): Promise<any> {
    return this.request(`/sources/${sourceId}/ingest`, {
      method: 'POST',
    });
  }

  // Claims
  async extractClaims(reviewId: string, sourceId: string): Promise<any> {
    return this.request(`/reviews/${reviewId}/claims/extract`, {
      method: 'POST',
      body: JSON.stringify({ source_id: sourceId }),
    });
  }

  async getClaims(reviewId: string): Promise<Claim[]> {
    return this.request<Claim[]>(`/reviews/${reviewId}/claims`);
  }

  // Criteria
  async planCriteria(reviewId: string, category: string, audience: string): Promise<Criteria[]> {
    return this.request<Criteria[]>(`/reviews/${reviewId}/criteria/plan`, {
      method: 'POST',
      body: JSON.stringify({ category, audience }),
    });
  }

  async updateCriteria(criteriaId: string, data: Partial<Criteria>): Promise<Criteria> {
    return this.request<Criteria>(`/criteria/${criteriaId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Scoring
  async scoreReview(reviewId: string, method: 'weighted' | 'topsis' = 'weighted'): Promise<any> {
    return this.request(`/reviews/${reviewId}/score`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  async getRankings(reviewId: string): Promise<Ranking[]> {
    return this.request<Ranking[]>(`/reviews/${reviewId}/rankings`);
  }

  async getSensitivity(reviewId: string): Promise<Sensitivity[]> {
    return this.request<Sensitivity[]>(`/reviews/${reviewId}/sensitivity`);
  }
}
