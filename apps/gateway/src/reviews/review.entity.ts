import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('reviews')
export class Review {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  org_id: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column()
  category: string;

  @ApiProperty()
  @Column()
  audience: string;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  budget_low: number;

  @ApiProperty()
  @Column({ type: 'numeric', nullable: true })
  budget_high: number;

  @ApiProperty()
  @Column({ nullable: true })
  region: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['created', 'researching', 'scoring', 'drafting', 'reviewing', 'approved', 'exported', 'archived'],
    default: 'created'
  })
  status: string;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  style_guide: any;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  disclosure_policy: any;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
