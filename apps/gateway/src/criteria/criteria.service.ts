import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Criteria, CriterionDirection, CriterionNormalization } from './criteria.entity';
import { CreateCriteriaDto } from './dto/create-criteria.dto';
import { UpdateCriteriaDto } from './dto/update-criteria.dto';

@Injectable()
export class CriteriaService {
  constructor(
    @InjectRepository(Criteria)
    private criteriaRepository: Repository<Criteria>,
  ) {}

  async create(reviewId: string, createCriteriaDto: CreateCriteriaDto): Promise<Criteria> {
    const criteria = this.criteriaRepository.create({
      ...createCriteriaDto,
      reviewId,
    });
    return this.criteriaRepository.save(criteria);
  }

  async findAll(reviewId: string): Promise<Criteria[]> {
    return this.criteriaRepository.find({
      where: { reviewId },
      order: { weight: 'DESC', name: 'ASC' },
    });
  }

  async findOne(reviewId: string, id: string): Promise<Criteria> {
    const criteria = await this.criteriaRepository.findOne({
      where: { id, reviewId },
    });

    if (!criteria) {
      throw new NotFoundException(`Criteria with ID ${id} not found`);
    }

    return criteria;
  }

  async update(reviewId: string, id: string, updateCriteriaDto: UpdateCriteriaDto): Promise<Criteria> {
    const criteria = await this.findOne(reviewId, id);
    
    Object.assign(criteria, updateCriteriaDto);
    return this.criteriaRepository.save(criteria);
  }

  async remove(reviewId: string, id: string): Promise<void> {
    const criteria = await this.findOne(reviewId, id);
    await this.criteriaRepository.remove(criteria);
  }

  async normalizeWeights(reviewId: string): Promise<Criteria[]> {
    const criteria = await this.findAll(reviewId);
    const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0);

    if (totalWeight > 0) {
      const normalizedCriteria = criteria.map(c => ({
        ...c,
        weight: Number(c.weight) / totalWeight,
      }));

      return this.criteriaRepository.save(normalizedCriteria);
    }

    return criteria;
  }

  async duplicateFromTemplate(reviewId: string, templateCategory: string): Promise<Criteria[]> {
    // This would typically load from a template database or configuration
    const templates = {
      'video-editing': [
        { name: 'Video Quality', description: 'Output video resolution and quality', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.3 },
        { name: 'Rendering Speed', description: 'Time to render videos', direction: CriterionDirection.LOWER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.25 },
        { name: 'Ease of Use', description: 'User interface and workflow simplicity', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.2 },
        { name: 'Feature Set', description: 'Available editing features and tools', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.15 },
        { name: 'Price', description: 'Cost per month or per project', direction: CriterionDirection.LOWER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.1 },
      ],
      'ai-tools': [
        { name: 'AI Accuracy', description: 'Quality and accuracy of AI-generated content', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.35 },
        { name: 'Processing Speed', description: 'Time to generate AI content', direction: CriterionDirection.LOWER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.25 },
        { name: 'Customization', description: 'Ability to customize AI outputs', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.2 },
        { name: 'Integration', description: 'Ease of integration with existing workflows', direction: CriterionDirection.HIGHER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.15 },
        { name: 'Cost per Use', description: 'Cost per generation or API call', direction: CriterionDirection.LOWER_BETTER, normalization: CriterionNormalization.MINMAX, weight: 0.05 },
      ],
    };

    const template = templates[templateCategory] || templates['ai-tools'];
    
    const criteria = template.map(t => this.criteriaRepository.create({
      ...t,
      reviewId,
    }));

    return this.criteriaRepository.save(criteria);
  }
}
