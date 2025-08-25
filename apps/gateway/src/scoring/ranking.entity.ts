import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from '../products/product.entity';

export enum RankingMethod {
  WEIGHTED_SUM = 'weighted_sum',
  TOPSIS = 'topsis',
  ELECTRE = 'electre',
}

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column('uuid')
  reviewId: string;

  @Column('decimal', { precision: 10, scale: 6 })
  overallScore: number;

  @Column('int')
  rank: number;

  @Column({
    type: 'enum',
    enum: RankingMethod,
    default: RankingMethod.WEIGHTED_SUM,
  })
  method: RankingMethod;

  @Column('jsonb', { nullable: true })
  methodSpecificData: Record<string, any>;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => Product, product => product.rankings, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
