import { PartialType } from '@nestjs/swagger';
import { CreateQuarterlyNoteDto } from './create-quarterly-note.dto';

export class UpdateQuarterlyNoteDto extends PartialType(CreateQuarterlyNoteDto) {}
