import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvaliacoesController } from './avaliacoes.controller';
import { AvaliacoesService } from './avaliacoes.service';
import { Evaluation } from './entities/evaluation.entity';
import { EvaluationCriterion } from './entities/evaluation-criterion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evaluation, EvaluationCriterion])],
  controllers: [AvaliacoesController],
  providers: [AvaliacoesService],
  exports: [AvaliacoesService, TypeOrmModule],
})
export class AvaliacoesModule {}
