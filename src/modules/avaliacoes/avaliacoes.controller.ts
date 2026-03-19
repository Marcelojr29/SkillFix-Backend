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
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { QueryAvaliacaoDto } from './dto/query-avaliacao.dto';
import {
  SubmitAvaliacaoDto,
  ReviewAvaliacaoDto,
} from './dto/action-avaliacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Evaluations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluations')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({ status: 201, description: 'Avaliação criada' })
  create(@Body() createAvaliacaoDto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(createAvaliacaoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar avaliações com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações' })
  findAll(@Query() query: QueryAvaliacaoDto) {
    return this.avaliacoesService.findAll(query);
  }

  @Get('tecnico/:tecnicoId')
  @ApiOperation({ summary: 'Listar avaliações de um técnico' })
  @ApiResponse({ status: 200, description: 'Avaliações do técnico' })
  findByTecnico(@Param('tecnicoId', ParseUUIDPipe) tecnicoId: string) {
    return this.avaliacoesService.findByTecnico(tecnicoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.avaliacoesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar avaliação (somente rascunhos)' })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAvaliacaoDto: UpdateAvaliacaoDto,
  ) {
    return this.avaliacoesService.update(id, updateAvaliacaoDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar avaliação (somente rascunhos)' })
  @ApiResponse({ status: 200, description: 'Avaliação removida' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.avaliacoesService.remove(id);
  }

  @Post(':id/submit')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Submeter avaliação para revisão' })
  @ApiResponse({ status: 200, description: 'Avaliação submetida' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitDto: SubmitAvaliacaoDto,
  ) {
    return this.avaliacoesService.submit(id, submitDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Aprovar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação aprovada' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: ReviewAvaliacaoDto,
    @GetUser('id') reviewerId: string,
  ) {
    return this.avaliacoesService.approve(id, reviewDto, reviewerId);
  }

  @Post(':id/reject')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Rejeitar avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação rejeitada' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() reviewDto: ReviewAvaliacaoDto,
    @GetUser('id') reviewerId: string,
  ) {
    return this.avaliacoesService.reject(id, reviewDto, reviewerId);
  }
}
