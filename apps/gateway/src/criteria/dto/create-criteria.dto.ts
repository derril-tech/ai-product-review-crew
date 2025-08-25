import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { CriterionDirection, CriterionNormalization } from '../criteria.entity';

export class CreateCriteriaDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(CriterionDirection)
  direction: CriterionDirection;

  @IsEnum(CriterionNormalization)
  normalization: CriterionNormalization;

  @IsNumber()
  @Min(0)
  @Max(1)
  weight: number;
}
