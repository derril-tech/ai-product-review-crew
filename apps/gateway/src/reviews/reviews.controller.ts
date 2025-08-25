import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { CreateBriefDto } from './dto/create-brief.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(createReviewDto, req.user.org_id, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews for organization' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  findAll(@Request() req) {
    return this.reviewsService.findAll(req.user.org_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review' })
  @ApiResponse({ status: 200, description: 'Review details' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.reviewsService.findOne(id, req.user.org_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @Request() req) {
    return this.reviewsService.update(id, updateReviewDto, req.user.org_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.user.org_id);
  }

  @Post(':id/brief')
  @ApiOperation({ summary: 'Create or update brief for a review' })
  @ApiResponse({ status: 201, description: 'Brief created successfully' })
  createBrief(@Param('id') id: string, @Body() createBriefDto: CreateBriefDto, @Request() req) {
    return this.reviewsService.createBrief(id, createBriefDto, req.user.org_id);
  }

  @Get(':id/brief')
  @ApiOperation({ summary: 'Get brief for a review' })
  @ApiResponse({ status: 200, description: 'Brief details' })
  @ApiResponse({ status: 404, description: 'Brief not found' })
  getBrief(@Param('id') id: string, @Request() req) {
    return this.reviewsService.getBrief(id, req.user.org_id);
  }
}
