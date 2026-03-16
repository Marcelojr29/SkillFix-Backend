import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubTimesService } from './subtimes.service';
import { CreateSubTeamDto } from './dto/create-subteam.dto';
import { UpdateSubTeamDto } from './dto/update-subteam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('SubTimes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subtimes')
export class SubTimesController {
  constructor(private readonly subTimesService: SubTimesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo sub-time' })
  @ApiResponse({ status: 201, description: 'Sub-time criado' })
  create(@Body() createSubTeamDto: CreateSubTeamDto) {
    return this.subTimesService.create(createSubTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os sub-times' })
  @ApiResponse({ status: 200, description: 'Lista de sub-times' })
  findAll() {
    return this.subTimesService.findAll();
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Listar sub-times de um time específico' })
  @ApiResponse({ status: 200, description: 'Lista de sub-times do time' })
  findByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.subTimesService.findByTeam(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sub-time por ID' })
  @ApiResponse({ status: 200, description: 'Sub-time encontrado' })
  @ApiResponse({ status: 404, description: 'Sub-time não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.findOne(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do sub-time' })
  @ApiResponse({ status: 200, description: 'Lista de membros' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.getMembers(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar sub-time' })
  @ApiResponse({ status: 200, description: 'Sub-time atualizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubTeamDto: UpdateSubTeamDto,
  ) {
    return this.subTimesService.update(id, updateSubTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar sub-time' })
  @ApiResponse({ status: 200, description: 'Sub-time desativado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.remove(id);
  }
}
