import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { CreateScoreDto } from './dto/create-score.dto';
import { UpdateScoreDto } from './dto/update-score.dto';
import { Score } from './score.entity';
import { Ranking, RankingMethod } from './ranking.entity';
import { Sensitivity } from './sensitivity.entity';

@ApiTags('scoring')
@Controller('reviews/:reviewId/scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  // Score endpoints
  @Post('scores')
  @ApiOperation({ summary: 'Create a new score' })
  @ApiResponse({ status: 201, description: 'Score created successfully', type: Score })
  createScore(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() createScoreDto: CreateScoreDto,
  ): Promise<Score> {
    return this.scoringService.createScore(reviewId, createScoreDto);
  }

  @Get('scores')
  @ApiOperation({ summary: 'Get all scores for a review' })
  @ApiResponse({ status: 200, description: 'List of scores', type: [Score] })
  findAllScores(@Param('reviewId', ParseUUIDPipe) reviewId: string): Promise<Score[]> {
    return this.scoringService.findAllScores(reviewId);
  }

  @Get('scores/:id')
  @ApiOperation({ summary: 'Get a specific score' })
  @ApiResponse({ status: 200, description: 'Score found', type: Score })
  findOneScore(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Score> {
    return this.scoringService.findOneScore(reviewId, id);
  }

  @Patch('scores/:id')
  @ApiOperation({ summary: 'Update a score' })
  @ApiResponse({ status: 200, description: 'Score updated successfully', type: Score })
  updateScore(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScoreDto: UpdateScoreDto,
  ): Promise<Score> {
    return this.scoringService.updateScore(reviewId, id, updateScoreDto);
  }

  @Delete('scores/:id')
  @ApiOperation({ summary: 'Delete a score' })
  @ApiResponse({ status: 200, description: 'Score deleted successfully' })
  removeScore(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.scoringService.removeScore(reviewId, id);
  }

  // Ranking endpoints
  @Post('rankings')
  @ApiOperation({ summary: 'Compute rankings for a review' })
  @ApiResponse({ status: 201, description: 'Rankings computed successfully', type: [Ranking] })
  computeRankings(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Query('method') method: RankingMethod = RankingMethod.WEIGHTED_SUM,
  ): Promise<Ranking[]> {
    return this.scoringService.computeRankings(reviewId, method);
  }

  @Get('rankings')
  @ApiOperation({ summary: 'Get rankings for a review' })
  @ApiResponse({ status: 200, description: 'List of rankings', type: [Ranking] })
  getRankings(@Param('reviewId', ParseUUIDPipe) reviewId: string): Promise<Ranking[]> {
    return this.scoringService.getRankings(reviewId);
  }

  // Sensitivity analysis endpoints
  @Post('sensitivity/:criterionId')
  @ApiOperation({ summary: 'Compute sensitivity analysis for a criterion' })
  @ApiResponse({ status: 201, description: 'Sensitivity analysis computed successfully', type: [Sensitivity] })
  computeSensitivity(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('criterionId', ParseUUIDPipe) criterionId: string,
    @Query('variations') variations?: string,
  ): Promise<Sensitivity[]> {
    const variationsArray = variations ? variations.split(',').map(v => parseFloat(v)) : undefined;
    return this.scoringService.computeSensitivity(reviewId, criterionId, variationsArray);
  }

  @Get('sensitivity')
  @ApiOperation({ summary: 'Get sensitivity analysis results' })
  @ApiResponse({ status: 200, description: 'List of sensitivity results', type: [Sensitivity] })
  getSensitivity(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Query('criterionId') criterionId?: string,
  ): Promise<Sensitivity[]> {
    return this.scoringService.getSensitivity(reviewId, criterionId);
  }

  // Utility endpoints
  @Post('normalize')
  @ApiOperation({ summary: 'Normalize all scores for a review' })
  @ApiResponse({ status: 200, description: 'Scores normalized successfully', type: [Score] })
  normalizeScores(@Param('reviewId', ParseUUIDPipe) reviewId: string): Promise<Score[]> {
    return this.scoringService.normalizeScores(reviewId);
  }
}
