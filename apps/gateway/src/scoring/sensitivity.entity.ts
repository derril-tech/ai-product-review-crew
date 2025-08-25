import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Criteria } from '../criteria/criteria.entity';

@Entity('sensitivity')
export class Sensitivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  criterionId: string;

  @Column('uuid')
  reviewId: string;

  @Column('decimal', { precision: 5, scale: 4 })
  weightVariation: number;

  @Column('jsonb')
  rankings: {
    productId: string;
    rank: number;
    score: number;
  }[];

  @Column('decimal', { precision: 10, scale: 6 })
  stabilityIndex: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Criteria, { onDelete: 'CASCADE' })
  criterion: Criteria;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
