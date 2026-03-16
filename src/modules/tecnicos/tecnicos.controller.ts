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
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TecnicosService } from './tecnicos.service';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tecnicos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tecnicos')
export class TecnicosController {
  constructor(private readonly tecnicosService: TecnicosService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo técnico' })
  @ApiResponse({ status: 201, description: 'Técnico criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTecnicoDto: CreateTecnicoDto) {
    return this.tecnicosService.create(createTecnicoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar técnicos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de técnicos' })
  findAll(@Query() query: QueryTecnicoDto) {
    return this.tecnicosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar técnico por ID' })
  @ApiResponse({ status: 200, description: 'Técnico encontrado' })
  @ApiResponse({ status: 404, description: 'Técnico não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar técnico' })
  @ApiResponse({ status: 200, description: 'Técnico atualizado' })
  @ApiResponse({ status: 404, description: 'Técnico não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTecnicoDto: UpdateTecnicoDto,
  ) {
    return this.tecnicosService.update(id, updateTecnicoDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar técnico (soft delete)' })
  @ApiResponse({ status: 200, description: 'Técnico desativado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.remove(id);
  }

  @Post(':id/photo')
  @Roles(UserRole.MASTER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de foto do técnico' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: any,
  ) {
    return this.tecnicosService.uploadPhoto(id, file);
  }

  @Get(':id/skills')
  @ApiOperation({ summary: 'Listar skills do técnico' })
  @ApiResponse({ status: 200, description: 'Skills do técnico' })
  getSkills(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.getSkills(id);
  }

  @Patch(':id/skills/:skillId')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar score de uma skill' })
  updateSkillScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() body: { score: number; notes?: string },
  ) {
    return this.tecnicosService.updateSkillScore(
      id,
      skillId,
      body.score,
      body.notes,
    );
  }
}
