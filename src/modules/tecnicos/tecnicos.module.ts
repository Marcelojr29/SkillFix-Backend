import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TecnicosController } from './tecnicos.controller';
import { TecnicosService } from './tecnicos.service';
import { Tecnico } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tecnico, TecnicoSkill])],
  controllers: [TecnicosController],
  providers: [TecnicosService],
  exports: [TecnicosService, TypeOrmModule],
})
export class TecnicosModule {}
