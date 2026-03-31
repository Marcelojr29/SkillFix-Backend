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
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tecnicos')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tecnicos')
export class TecnicosController {
  constructor(private readonly tecnicosService: TecnicosService) {}

  @Post('with-photo')
  @Roles(UserRole.MASTER)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Criar novo técnico com foto' })
  @ApiResponse({ status: 201, description: 'Técnico criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Foto do técnico (opcional)',
        },
        name: { type: 'string', example: 'João Silva' },
        workday: { type: 'string', example: 'WDC00001' },
        cargo: { type: 'string', example: 'Técnico de Manutenção Elétrica' },
        senioridade: { type: 'string', enum: ['Auxiliar', 'Junior', 'Pleno', 'Sênior', 'Especialista', 'Coordenador', 'Supervisor'] },
        area: { type: 'string', enum: ['Produção', 'Manutenção', 'Qualidade', 'Engenharia', 'Logística', 'Administrativa', 'Outro'] },
        shift: { type: 'string', enum: ['1T', '2T', '3T', 'ADM'] },
        department: { type: 'string', example: 'Manutenção Elétrica' },
        gender: { type: 'string', enum: ['M', 'F', 'O'] },
        joinDate: { type: 'string', format: 'date', example: '2020-01-15' },
        teamId: { type: 'string', format: 'uuid' },
        subtimeId: { type: 'string', format: 'uuid' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        skills: { 
          type: 'string', 
          description: 'JSON string array de skills: [{"skillId": "uuid", "score": 85.5, "notes": "opcional"}]',
        },
      },
      required: ['name', 'workday', 'cargo', 'senioridade', 'area', 'shift', 'department', 'gender', 'joinDate'],
    },
  })
  createWithPhoto(
    @Body() body: any,
    @UploadedFile() file?: any,
  ) {
    return this.tecnicosService.createWithPhoto(body, file);
  }

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo técnico' })
  @ApiResponse({ status: 201, description: 'Técnico criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(
    @Body() createTecnicoDto: CreateTecnicoDto,
    @GetUser('id') userId: string,
  ) {
    return this.tecnicosService.create(createTecnicoDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar técnicos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de técnicos' })
  findAll(
    @Query() query: QueryTecnicoDto, 
    @GetUser('id') userId: string
  ) {
    return this.tecnicosService.findAll(query, userId);
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
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este técnico' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTecnicoDto: UpdateTecnicoDto,
    @GetUser('id') userId: string,
  ) {
    return this.tecnicosService.update(id, updateTecnicoDto, userId);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar técnico (soft delete)' })
  @ApiResponse({ status: 200, description: 'Técnico desativado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para deletar este técnico' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ) {
    return this.tecnicosService.remove(id, userId);
  }

  @Post(':id/photo')
  @Roles(UserRole.MASTER)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de foto do técnico' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: any,
  ) {
    console.log('Arquivo recebido:', file?.originalname);
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
