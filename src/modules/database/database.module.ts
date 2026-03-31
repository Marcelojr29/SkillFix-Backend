import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { SubTeam } from '../subtimes/entities/subteam.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Tecnico } from '../tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Team,
      SubTeam,
      Machine,
      Skill,
      Tecnico,
      TecnicoSkill,
    ]),
  ],
  controllers: [DatabaseController],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}