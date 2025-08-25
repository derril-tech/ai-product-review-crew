import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('citations')
export class Citation {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  source_id: string;

  @ApiProperty()
  @Column()
  anchor: string;

  @ApiProperty()
  @Column()
  quote: string;

  @ApiProperty()
  @Column({ nullable: true })
  url: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['A', 'B', 'C'],
    default: 'B',
  })
  confidence: string;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
