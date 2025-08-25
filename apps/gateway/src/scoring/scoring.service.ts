import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './score.entity';
import { Ranking, RankingMethod } from './ranking.entity';
import { Sensitivity } from './sensitivity.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';

@Injectable()
export class ScoringService {
  constructor(
    @InjectRepository(Score)
    private scoreRepository: Repository<Score>,
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
    @InjectRepository(Sensitivity)
    private sensitivityRepository: Repository<Sensitivity>,
  ) {}

  async createScore(reviewId: string, createScoreDto: CreateScoreDto): Promise<Score> {
    const score = this.scoreRepository.create({
      ...createScoreDto,
      reviewId,
    });
    return this.scoreRepository.save(score);
  }

  async findAllScores(reviewId: string): Promise<Score[]> {
    return this.scoreRepository.find({
      where: { reviewId },
      relations: ['product', 'criterion'],
    });
  }

  async findOneScore(reviewId: string, id: string): Promise<Score> {
    const score = await this.scoreRepository.findOne({
      where: { id, reviewId },
      relations: ['product', 'criterion'],
    });

    if (!score) {
      throw new NotFoundException(`Score with ID ${id} not found`);
    }

    return score;
  }

  async updateScore(reviewId: string, id: string, updateScoreDto: UpdateScoreDto): Promise<Score> {
    const score = await this.findOneScore(reviewId, id);
    
    Object.assign(score, updateScoreDto);
    return this.scoreRepository.save(score);
  }

  async removeScore(reviewId: string, id: string): Promise<void> {
    const score = await this.findOneScore(reviewId, id);
    await this.scoreRepository.remove(score);
  }

  async computeRankings(reviewId: string, method: RankingMethod = RankingMethod.WEIGHTED_SUM): Promise<Ranking[]> {
    // Get all scores for the review
    const scores = await this.findAllScores(reviewId);
    
    // Group scores by product
    const productScores = new Map<string, { productId: string; scores: Score[]; totalScore: number }>();
    
    scores.forEach(score => {
      if (!productScores.has(score.productId)) {
        productScores.set(score.productId, { productId: score.productId, scores: [], totalScore: 0 });
      }
      const product = productScores.get(score.productId)!;
      product.scores.push(score);
      product.totalScore += Number(score.weightedScore);
    });

    // Create rankings
    const rankings = Array.from(productScores.values())
      .map(product => ({
        productId: product.productId,
        overallScore: product.totalScore,
        methodSpecificData: method === RankingMethod.WEIGHTED_SUM ? { weightedSum: product.totalScore } : {},
      }))
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((product, index) => ({
        ...product,
        rank: index + 1,
        reviewId,
        method,
      }));

    // Save rankings
    const rankingEntities = rankings.map(ranking => this.rankingRepository.create(ranking));
    return this.rankingRepository.save(rankingEntities);
  }

  async getRankings(reviewId: string): Promise<Ranking[]> {
    return this.rankingRepository.find({
      where: { reviewId },
      relations: ['product'],
      order: { rank: 'ASC' },
    });
  }

  async computeSensitivity(reviewId: string, criterionId: string, variations: number[] = [-0.5, -0.25, 0, 0.25, 0.5]): Promise<Sensitivity[]> {
    const baseScores = await this.findAllScores(reviewId);
    const baseRankings = await this.getRankings(reviewId);
    
    const sensitivityResults: Sensitivity[] = [];

    for (const variation of variations) {
      // Simulate weight change by adjusting weighted scores
      const adjustedScores = baseScores.map(score => {
        if (score.criterionId === criterionId) {
          const adjustedWeightedScore = Number(score.weightedScore) * (1 + variation);
          return { ...score, weightedScore: adjustedWeightedScore };
        }
        return score;
      });

      // Recompute rankings with adjusted scores
      const productScores = new Map<string, number>();
      adjustedScores.forEach(score => {
        const current = productScores.get(score.productId) || 0;
        productScores.set(score.productId, current + Number(score.weightedScore));
      });

      const newRankings = Array.from(productScores.entries())
        .map(([productId, score]) => ({ productId, score }))
        .sort((a, b) => b.score - a.score)
        .map((product, index) => ({
          productId: product.productId,
          rank: index + 1,
          score: product.score,
        }));

      // Calculate stability index (inverse of rank variance)
      const rankChanges = newRankings.map(newRank => {
        const baseRank = baseRankings.find(r => r.productId === newRank.productId);
        return baseRank ? Math.abs(newRank.rank - baseRank.rank) : 0;
      });
      
      const stabilityIndex = 1 / (1 + rankChanges.reduce((sum, change) => sum + change, 0) / rankChanges.length);

      const sensitivity = this.sensitivityRepository.create({
        criterionId,
        reviewId,
        weightVariation: variation,
        rankings: newRankings,
        stabilityIndex,
        metadata: { baseRankings: baseRankings.map(r => ({ productId: r.productId, rank: r.rank })) },
      });

      sensitivityResults.push(sensitivity);
    }

    return this.sensitivityRepository.save(sensitivityResults);
  }

  async getSensitivity(reviewId: string, criterionId?: string): Promise<Sensitivity[]> {
    const where: any = { reviewId };
    if (criterionId) {
      where.criterionId = criterionId;
    }

    return this.sensitivityRepository.find({
      where,
      relations: ['criterion'],
      order: { weightVariation: 'ASC' },
    });
  }

  async normalizeScores(reviewId: string): Promise<Score[]> {
    const scores = await this.findAllScores(reviewId);
    
    // Group by criterion for normalization
    const criterionGroups = new Map<string, Score[]>();
    scores.forEach(score => {
      if (!criterionGroups.has(score.criterionId)) {
        criterionGroups.set(score.criterionId, []);
      }
      criterionGroups.get(score.criterionId)!.push(score);
    });

    const updatedScores: Score[] = [];

    for (const [criterionId, criterionScores] of criterionGroups) {
      const rawScores = criterionScores.map(s => Number(s.rawScore));
      const min = Math.min(...rawScores);
      const max = Math.max(...rawScores);
      const mean = rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length;
      const variance = rawScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / rawScores.length;
      const stdDev = Math.sqrt(variance);

      criterionScores.forEach(score => {
        let normalizedScore: number;
        
        // Apply min-max normalization
        if (max > min) {
          normalizedScore = (Number(score.rawScore) - min) / (max - min);
        } else {
          normalizedScore = 0.5; // Default for single value
        }

        // Apply z-score normalization as well
        const zScore = stdDev > 0 ? (Number(score.rawScore) - mean) / stdDev : 0;

        updatedScores.push({
          ...score,
          normalizedScore,
          metadata: {
            ...score.metadata,
            minMaxNormalized: normalizedScore,
            zScore,
            min,
            max,
            mean,
            stdDev,
          },
        });
      });
    }

    return this.scoreRepository.save(updatedScores);
  }
}
