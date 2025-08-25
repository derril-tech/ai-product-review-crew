import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { Criteria } from '../criteria/criteria.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  criterionId: string;

  @Column('decimal', { precision: 10, scale: 6 })
  rawScore: number;

  @Column('decimal', { precision: 10, scale: 6 })
  normalizedScore: number;

  @Column('decimal', { precision: 10, scale: 6 })
  weightedScore: number;

  @Column('text', { nullable: true })
  justification: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Product, product => product.scores, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => Criteria, criterion => criterion.scores, { onDelete: 'CASCADE' })
  criterion: Criteria;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
