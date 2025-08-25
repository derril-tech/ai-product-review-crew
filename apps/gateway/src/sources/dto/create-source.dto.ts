import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateSourceDto {
  @ApiProperty()
  @IsOptional()
  @IsUUID()
  product_id?: string;

  @ApiProperty()
  @IsEnum(['api', 'feed', 'html', 'doc', 'csv', 'manual'])
  kind: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  uri?: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  meta?: any;
}
