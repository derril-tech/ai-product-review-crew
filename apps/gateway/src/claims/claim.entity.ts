import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('claims')
export class Claim {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  product_id: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['feature', 'limit', 'price', 'platform', 'policy'],
  })
  kind: string;

  @ApiProperty()
  @Column()
  key: string;

  @ApiProperty()
  @Column()
  value: string;

  @ApiProperty()
  @Column({ nullable: true })
  unit: string;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  numeric_value: number;

  @ApiProperty()
  @Column({ type: 'uuid' })
  citation_id: string;

  @ApiProperty()
  @Column({ type: 'numeric' })
  confidence: number;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
