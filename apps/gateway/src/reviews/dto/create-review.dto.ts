import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsString()
  audience: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  budget_low?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  budget_high?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty()
  @IsOptional()
  style_guide?: any;

  @ApiProperty()
  @IsOptional()
  disclosure_policy?: any;
}
