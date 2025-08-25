import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';

@ApiTags('Claims')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reviews/:reviewId/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new claim' })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  create(
    @Param('reviewId') reviewId: string,
    @Body() createClaimDto: CreateClaimDto,
    @Request() req,
  ) {
    return this.claimsService.create(createClaimDto, reviewId, req.user.org_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all claims for a review' })
  @ApiResponse({ status: 200, description: 'List of claims' })
  findAll(@Param('reviewId') reviewId: string, @Request() req) {
    return this.claimsService.findAll(reviewId, req.user.org_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific claim' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  findOne(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.claimsService.findOne(id, reviewId, req.user.org_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a claim' })
  @ApiResponse({ status: 200, description: 'Claim updated successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  update(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateClaimDto,
    @Request() req,
  ) {
    return this.claimsService.update(id, updateClaimDto, reviewId, req.user.org_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a claim' })
  @ApiResponse({ status: 200, description: 'Claim deleted successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  remove(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.claimsService.remove(id, reviewId, req.user.org_id);
  }

  @Post('extract/:sourceId')
  @ApiOperation({ summary: 'Extract claims from a source' })
  @ApiResponse({ status: 200, description: 'Claim extraction started' })
  extractFromSource(
    @Param('reviewId') reviewId: string,
    @Param('sourceId') sourceId: string,
    @Request() req,
  ) {
    return this.claimsService.extractFromSource(sourceId, reviewId, req.user.org_id);
  }
}
