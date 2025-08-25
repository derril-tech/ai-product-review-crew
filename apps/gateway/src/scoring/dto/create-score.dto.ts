import { IsString, IsNumber, IsOptional, IsUUID, Min, Max } from 'class-validator';

export class CreateScoreDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  criterionId: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  rawScore: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  normalizedScore: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  weightedScore: number;

  @IsOptional()
  @IsString()
  justification?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
