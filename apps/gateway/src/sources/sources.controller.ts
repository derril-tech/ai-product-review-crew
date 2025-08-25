import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { SourcesService } from './sources.service';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { CreateCitationDto } from './dto/create-citation.dto';

@ApiTags('Sources')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reviews/:reviewId/sources')
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new source' })
  @ApiResponse({ status: 201, description: 'Source created successfully' })
  create(
    @Param('reviewId') reviewId: string,
    @Body() createSourceDto: CreateSourceDto,
    @Request() req,
  ) {
    return this.sourcesService.create(createSourceDto, reviewId, req.user.org_id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sources for a review' })
  @ApiResponse({ status: 200, description: 'List of sources' })
  findAll(@Param('reviewId') reviewId: string, @Request() req) {
    return this.sourcesService.findAll(reviewId, req.user.org_id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific source' })
  @ApiResponse({ status: 200, description: 'Source details' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  findOne(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.sourcesService.findOne(id, reviewId, req.user.org_id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a source' })
  @ApiResponse({ status: 200, description: 'Source updated successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  update(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Body() updateSourceDto: UpdateSourceDto,
    @Request() req,
  ) {
    return this.sourcesService.update(id, updateSourceDto, reviewId, req.user.org_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a source' })
  @ApiResponse({ status: 200, description: 'Source deleted successfully' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  remove(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.sourcesService.remove(id, reviewId, req.user.org_id);
  }

  @Post(':id/ingest')
  @ApiOperation({ summary: 'Trigger source ingestion' })
  @ApiResponse({ status: 200, description: 'Source ingestion started' })
  ingest(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.sourcesService.ingest(id, reviewId, req.user.org_id);
  }

  @Get(':id/citations')
  @ApiOperation({ summary: 'Get citations for a source' })
  @ApiResponse({ status: 200, description: 'List of citations' })
  getCitations(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.sourcesService.getCitations(id, reviewId, req.user.org_id);
  }

  @Post(':id/citations')
  @ApiOperation({ summary: 'Create a citation for a source' })
  @ApiResponse({ status: 201, description: 'Citation created successfully' })
  createCitation(
    @Param('reviewId') reviewId: string,
    @Param('id') id: string,
    @Body() createCitationDto: CreateCitationDto,
    @Request() req,
  ) {
    return this.sourcesService.createCitation(id, createCitationDto, reviewId, req.user.org_id);
  }
}
