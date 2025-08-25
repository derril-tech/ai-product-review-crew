import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCitationDto {
  @ApiProperty()
  @IsString()
  anchor: string;

  @ApiProperty()
  @IsString()
  quote: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(['A', 'B', 'C'])
  confidence?: string;
}
