import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Tecnico } from '../tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';
import { QuarterlyNote } from '../quarterly-notes/entities/quarterly-note.entity';
import { Evaluation } from '../avaliacoes/entities/evaluation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tecnico, TecnicoSkill, QuarterlyNote, Evaluation]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
