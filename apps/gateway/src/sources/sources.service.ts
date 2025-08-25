import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Source } from './source.entity';
import { Citation } from './citation.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { CreateCitationDto } from './dto/create-citation.dto';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Source)
    private sourcesRepository: Repository<Source>,
    @InjectRepository(Citation)
    private citationsRepository: Repository<Citation>,
  ) {}

  async create(createSourceDto: CreateSourceDto, reviewId: string, orgId: string): Promise<Source> {
    const source = this.sourcesRepository.create({
      ...createSourceDto,
      review_id: reviewId,
    });
    return this.sourcesRepository.save(source);
  }

  async findAll(reviewId: string, orgId: string): Promise<Source[]> {
    return this.sourcesRepository.find({
      where: { review_id: reviewId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, reviewId: string, orgId: string): Promise<Source> {
    const source = await this.sourcesRepository.findOne({
      where: { id, review_id: reviewId },
    });
    if (!source) {
      throw new NotFoundException(`Source with ID ${id} not found`);
    }
    return source;
  }

  async update(id: string, updateSourceDto: UpdateSourceDto, reviewId: string, orgId: string): Promise<Source> {
    const source = await this.findOne(id, reviewId, orgId);
    Object.assign(source, updateSourceDto);
    return this.sourcesRepository.save(source);
  }

  async remove(id: string, reviewId: string, orgId: string): Promise<void> {
    const source = await this.findOne(id, reviewId, orgId);
    await this.sourcesRepository.remove(source);
  }

  async ingest(id: string, reviewId: string, orgId: string): Promise<any> {
    const source = await this.findOne(id, reviewId, orgId);
    
    // TODO: Trigger worker to ingest source
    // This would typically send a message to NATS or Celery
    
    return {
      source_id: id,
      status: 'ingesting',
      message: 'Source ingestion started',
    };
  }

  async getCitations(sourceId: string, reviewId: string, orgId: string): Promise<Citation[]> {
    await this.findOne(sourceId, reviewId, orgId); // Verify source exists and belongs to review
    
    return this.citationsRepository.find({
      where: { source_id: sourceId },
      order: { created_at: 'DESC' },
    });
  }

  async createCitation(sourceId: string, createCitationDto: CreateCitationDto, reviewId: string, orgId: string): Promise<Citation> {
    await this.findOne(sourceId, reviewId, orgId); // Verify source exists and belongs to review
    
    const citation = this.citationsRepository.create({
      ...createCitationDto,
      source_id: sourceId,
    });
    return this.citationsRepository.save(citation);
  }
}
