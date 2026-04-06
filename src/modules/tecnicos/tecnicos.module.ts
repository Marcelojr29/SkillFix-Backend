import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';
import { Tecnico } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { SubTeam } from '../subtimes/entities/subteam.entity';
import { Evaluation } from '../avaliacoes/entities/evaluation.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tecnico, TecnicoSkill, User, Team, SubTeam, Evaluation]),
    AuthModule,
  ],
  controllers: [TecnicosController],
  providers: [TecnicosService],
  exports: [TecnicosService, TypeOrmModule],
})
export class TecnicosModule {}
