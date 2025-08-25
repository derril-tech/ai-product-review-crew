import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Criteria } from './criteria.entity';
import { CriteriaService } from './criteria.service';
import { CriteriaController } from './criteria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Criteria])],
  providers: [CriteriaService],
  controllers: [CriteriaController],
  exports: [CriteriaService],
})
export class CriteriaModule {}
