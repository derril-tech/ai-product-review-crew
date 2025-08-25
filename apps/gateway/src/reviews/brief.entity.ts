import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('briefs')
export class Brief {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  review_id: string;

  @ApiProperty()
  @Column({ nullable: true })
  problem: string;

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  must_haves: string[];

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  exclusions: string[];

  @ApiProperty()
  @Column({ type: 'text', array: true, nullable: true })
  include_products: string[];

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  criteria_override: any;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  weights_override: any;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
