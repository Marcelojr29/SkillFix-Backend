import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';
import { Tecnico } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tecnico, TecnicoSkill, User])],
  controllers: [TecnicosController],
  providers: [TecnicosService],
  exports: [TecnicosService, TypeOrmModule],
})
export class TecnicosModule {}
