import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Review } from '../reviews/review.entity';
import { Score } from '../scoring/score.entity';

export enum CriterionDirection {
  HIGHER_BETTER = 'higher_better',
  LOWER_BETTER = 'lower_better',
}

export enum CriterionNormalization {
  MINMAX = 'minmax',
  ZSCORE = 'zscore',
  NONE = 'none',
}

@Entity('criteria')
export class Criteria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CriterionDirection,
    default: CriterionDirection.HIGHER_BETTER,
  })
  direction: CriterionDirection;

  @Column({
    type: 'enum',
    enum: CriterionNormalization,
    default: CriterionNormalization.MINMAX,
  })
  normalization: CriterionNormalization;

  @Column('decimal', { precision: 5, scale: 4, default: 0.1 })
  weight: number;

  @Column('uuid')
  reviewId: string;

  @ManyToOne(() => Review, review => review.criteria, { onDelete: 'CASCADE' })
  review: Review;

  @OneToMany(() => Score, score => score.criterion)
  scores: Score[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
