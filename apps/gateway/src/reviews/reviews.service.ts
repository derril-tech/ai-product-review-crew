import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './review.entity';
import { Brief } from './brief.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateBriefDto } from './dto/create-brief.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Brief)
    private briefsRepository: Repository<Brief>,
  ) {}

  async create(createReviewDto: CreateReviewDto, orgId: string, userId: string): Promise<Review> {
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      org_id: orgId,
      created_by: userId,
    });
    return this.reviewsRepository.save(review);
  }

  async findAll(orgId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, orgId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id, org_id: orgId },
    });
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, orgId: string): Promise<Review> {
    const review = await this.findOne(id, orgId);
    Object.assign(review, updateReviewDto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: string, orgId: string): Promise<void> {
    const review = await this.findOne(id, orgId);
    await this.reviewsRepository.remove(review);
  }

  async createBrief(reviewId: string, createBriefDto: CreateBriefDto, orgId: string): Promise<Brief> {
    await this.findOne(reviewId, orgId); // Verify review exists and belongs to org
    
    const brief = this.briefsRepository.create({
      ...createBriefDto,
      review_id: reviewId,
    });
    return this.briefsRepository.save(brief);
  }

  async getBrief(reviewId: string, orgId: string): Promise<Brief> {
    await this.findOne(reviewId, orgId); // Verify review exists and belongs to org
    
    const brief = await this.briefsRepository.findOne({
      where: { review_id: reviewId },
    });
    if (!brief) {
      throw new NotFoundException(`Brief for review ${reviewId} not found`);
    }
    return brief;
  }
}
