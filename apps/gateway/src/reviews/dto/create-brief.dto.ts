import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateBriefDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  problem?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  must_haves?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  include_products?: string[];

  @ApiProperty()
  @IsOptional()
  criteria_override?: any;

  @ApiProperty()
  @IsOptional()
  weights_override?: any;
}
