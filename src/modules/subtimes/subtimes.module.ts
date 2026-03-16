import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTimesController } from './subtimes.controller';
import { SubTimesService } from './subtimes.service';
import { SubTeam } from './entities/subteam.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubTeam])],
  controllers: [SubTimesController],
  providers: [SubTimesService],
  exports: [SubTimesService, TypeOrmModule],
})
export class SubTimesModule {}
