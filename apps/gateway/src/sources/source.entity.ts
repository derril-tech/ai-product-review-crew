import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('sources')
export class Source {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column({ type: 'uuid' })
  review_id: string;

  @ApiProperty()
  @Column({ type: 'uuid', nullable: true })
  product_id: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: ['api', 'feed', 'html', 'doc', 'csv', 'manual'],
  })
  kind: string;

  @ApiProperty()
  @Column({ nullable: true })
  uri: string;

  @ApiProperty()
  @Column()
  title: string;

  @ApiProperty()
  @Column({ nullable: true })
  snapshot_key: string;

  @ApiProperty()
  @Column({ type: 'timestamp', nullable: true })
  fetched_at: Date;

  @ApiProperty()
  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;
}
