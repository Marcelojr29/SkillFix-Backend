import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuarterlyNotesController } from './quarterly-notes.controller';
import { QuarterlyNotesService } from './quarterly-notes.service';
import { QuarterlyNote } from './entities/quarterly-note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuarterlyNote])],
  controllers: [QuarterlyNotesController],
  providers: [QuarterlyNotesService],
  exports: [QuarterlyNotesService, TypeOrmModule],
})
export class QuarterlyNotesModule {}
