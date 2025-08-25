import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CriteriaService } from './criteria.service';
import { CreateCriteriaDto } from './dto/create-criteria.dto';
import { UpdateCriteriaDto } from './dto/update-criteria.dto';
import { Criteria } from './criteria.entity';

@ApiTags('criteria')
@Controller('reviews/:reviewId/criteria')
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new criterion' })
  @ApiResponse({ status: 201, description: 'Criterion created successfully', type: Criteria })
  create(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Body() createCriteriaDto: CreateCriteriaDto,
  ): Promise<Criteria> {
    return this.criteriaService.create(reviewId, createCriteriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all criteria for a review' })
  @ApiResponse({ status: 200, description: 'List of criteria', type: [Criteria] })
  findAll(@Param('reviewId', ParseUUIDPipe) reviewId: string): Promise<Criteria[]> {
    return this.criteriaService.findAll(reviewId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific criterion' })
  @ApiResponse({ status: 200, description: 'Criterion found', type: Criteria })
  findOne(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Criteria> {
    return this.criteriaService.findOne(reviewId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a criterion' })
  @ApiResponse({ status: 200, description: 'Criterion updated successfully', type: Criteria })
  update(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCriteriaDto: UpdateCriteriaDto,
  ): Promise<Criteria> {
    return this.criteriaService.update(reviewId, id, updateCriteriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a criterion' })
  @ApiResponse({ status: 200, description: 'Criterion deleted successfully' })
  remove(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.criteriaService.remove(reviewId, id);
  }

  @Post('normalize')
  @ApiOperation({ summary: 'Normalize criteria weights to sum to 1' })
  @ApiResponse({ status: 200, description: 'Weights normalized successfully', type: [Criteria] })
  normalizeWeights(@Param('reviewId', ParseUUIDPipe) reviewId: string): Promise<Criteria[]> {
    return this.criteriaService.normalizeWeights(reviewId);
  }

  @Post('template/:category')
  @ApiOperation({ summary: 'Create criteria from template' })
  @ApiResponse({ status: 201, description: 'Criteria created from template', type: [Criteria] })
  createFromTemplate(
    @Param('reviewId', ParseUUIDPipe) reviewId: string,
    @Param('category') category: string,
  ): Promise<Criteria[]> {
    return this.criteriaService.duplicateFromTemplate(reviewId, category);
  }
}
