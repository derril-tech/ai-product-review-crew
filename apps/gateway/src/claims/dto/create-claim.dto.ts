import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, Min, Max } from 'class-validator';

export class CreateClaimDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsEnum(['feature', 'limit', 'price', 'platform', 'policy'])
  kind: string;

  @ApiProperty()
  @IsString()
  key: string;

  @ApiProperty()
  @IsString()
  value: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  numeric_value?: number;

  @ApiProperty()
  @IsUUID()
  citation_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(1)
  confidence: number;
}
