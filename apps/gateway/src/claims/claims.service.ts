import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Claim } from './claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@Injectable()
export class ClaimsService {
  constructor(
    @InjectRepository(Claim)
    private claimsRepository: Repository<Claim>,
  ) {}

  async create(createClaimDto: CreateClaimDto, reviewId: string, orgId: string): Promise<Claim> {
    const claim = this.claimsRepository.create(createClaimDto);
    return this.claimsRepository.save(claim);
  }

  async findAll(reviewId: string, orgId: string): Promise<Claim[]> {
    return this.claimsRepository.find({
      where: { product_id: reviewId }, // This should be filtered by review_id through products
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, reviewId: string, orgId: string): Promise<Claim> {
    const claim = await this.claimsRepository.findOne({
      where: { id },
    });
    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }
    return claim;
  }

  async update(id: string, updateClaimDto: UpdateClaimDto, reviewId: string, orgId: string): Promise<Claim> {
    const claim = await this.findOne(id, reviewId, orgId);
    Object.assign(claim, updateClaimDto);
    return this.claimsRepository.save(claim);
  }

  async remove(id: string, reviewId: string, orgId: string): Promise<void> {
    const claim = await this.findOne(id, reviewId, orgId);
    await this.claimsRepository.remove(claim);
  }

  async extractFromSource(sourceId: string, reviewId: string, orgId: string): Promise<any> {
    // TODO: Trigger worker to extract claims from source
    // This would typically send a message to NATS or Celery
    
    return {
      source_id: sourceId,
      status: 'extracting',
      message: 'Claim extraction started',
    };
  }
}
