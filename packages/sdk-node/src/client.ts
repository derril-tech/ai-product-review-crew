// Created automatically by Cursor AI (2024-12-19)

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Review, Product, Source, Citation, Claim, Criteria, Score, Ranking, Sensitivity } from './types';

export class ProductReviewCrewClient {
  private client: AxiosInstance;
  private apiKey?: string;

  constructor(baseUrl: string = 'http://localhost:3001/v1', apiKey?: string) {
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use((config) => {
      if (this.apiKey) {
        config.headers.Authorization = `Bearer ${this.apiKey}`;
      }
      return config;
    });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  // Reviews
  async createReview(data: Partial<Review>): Promise<Review> {
    return this.request<Review>({
      method: 'POST',
      url: '/reviews',
      data,
    });
  }

  async getReview(id: string): Promise<Review> {
    return this.request<Review>({
      method: 'GET',
      url: `/reviews/${id}`,
    });
  }

  async listReviews(): Promise<Review[]> {
    return this.request<Review[]>({
      method: 'GET',
      url: '/reviews',
    });
  }

  // Products
  async createProduct(reviewId: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>({
      method: 'POST',
      url: `/reviews/${reviewId}/products`,
      data,
    });
  }

  async getProducts(reviewId: string): Promise<Product[]> {
    return this.request<Product[]>({
      method: 'GET',
      url: `/reviews/${reviewId}/products`,
    });
  }

  // Sources
  async createSource(reviewId: string, data: Partial<Source>): Promise<Source> {
    return this.request<Source>({
      method: 'POST',
      url: `/reviews/${reviewId}/sources`,
      data,
    });
  }

  async getSources(reviewId: string): Promise<Source[]> {
    return this.request<Source[]>({
      method: 'GET',
      url: `/reviews/${reviewId}/sources`,
    });
  }

  async ingestSource(sourceId: string): Promise<any> {
    return this.request({
      method: 'POST',
      url: `/sources/${sourceId}/ingest`,
    });
  }

  // Claims
  async extractClaims(reviewId: string, sourceId: string): Promise<any> {
    return this.request({
      method: 'POST',
      url: `/reviews/${reviewId}/claims/extract`,
      data: { source_id: sourceId },
    });
  }

  async getClaims(reviewId: string): Promise<Claim[]> {
    return this.request<Claim[]>({
      method: 'GET',
      url: `/reviews/${reviewId}/claims`,
    });
  }

  // Criteria
  async planCriteria(reviewId: string, category: string, audience: string): Promise<Criteria[]> {
    return this.request<Criteria[]>({
      method: 'POST',
      url: `/reviews/${reviewId}/criteria/plan`,
      data: { category, audience },
    });
  }

  async updateCriteria(criteriaId: string, data: Partial<Criteria>): Promise<Criteria> {
    return this.request<Criteria>({
      method: 'PATCH',
      url: `/criteria/${criteriaId}`,
      data,
    });
  }

  // Scoring
  async scoreReview(reviewId: string, method: 'weighted' | 'topsis' = 'weighted'): Promise<any> {
    return this.request({
      method: 'POST',
      url: `/reviews/${reviewId}/score`,
      data: { method },
    });
  }

  async getRankings(reviewId: string): Promise<Ranking[]> {
    return this.request<Ranking[]>({
      method: 'GET',
      url: `/reviews/${reviewId}/rankings`,
    });
  }

  async getSensitivity(reviewId: string): Promise<Sensitivity[]> {
    return this.request<Sensitivity[]>({
      method: 'GET',
      url: `/reviews/${reviewId}/sensitivity`,
    });
  }
}
