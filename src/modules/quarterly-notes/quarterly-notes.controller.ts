import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { QuarterlyNotesService } from './quarterly-notes.service';
import { CreateQuarterlyNoteDto } from './dto/create-quarterly-note.dto';
import { UpdateQuarterlyNoteDto } from './dto/update-quarterly-note.dto';
import { QueryQuarterlyNoteDto } from './dto/query-quarterly-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Quarterly Notes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quarterly-notes')
export class QuarterlyNotesController {
  constructor(private readonly quarterlyNotesService: QuarterlyNotesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar nova nota trimestral' })
  @ApiResponse({ status: 201, description: 'Nota criada com sucesso' })
  create(@Body() createQuarterlyNoteDto: CreateQuarterlyNoteDto) {
    return this.quarterlyNotesService.create(createQuarterlyNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas trimestrais com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de notas' })
  findAll(@Query() query: QueryQuarterlyNoteDto) {
    return this.quarterlyNotesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar nota trimestral por ID' })
  @ApiResponse({ status: 200, description: 'Nota encontrada' })
  @ApiResponse({ status: 404, description: 'Nota não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quarterlyNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar nota trimestral' })
  @ApiResponse({ status: 200, description: 'Nota atualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuarterlyNoteDto: UpdateQuarterlyNoteDto,
  ) {
    return this.quarterlyNotesService.update(id, updateQuarterlyNoteDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar nota trimestral' })
  @ApiResponse({ status: 200, description: 'Nota removida' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quarterlyNotesService.remove(id);
  }
}
