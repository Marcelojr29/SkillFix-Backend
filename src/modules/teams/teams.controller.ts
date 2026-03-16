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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Teams')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo time' })
  @ApiResponse({ status: 201, description: 'Time criado com sucesso' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os times' })
  @ApiResponse({ status: 200, description: 'Lista de times' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar time por ID' })
  @ApiResponse({ status: 200, description: 'Time encontrado' })
  @ApiResponse({ status: 404, description: 'Time não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Get(':id/subtimes')
  @ApiOperation({ summary: 'Listar sub-times de um time' })
  @ApiResponse({ status: 200, description: 'Lista de sub-times' })
  getSubTimes(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getSubTimes(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do time' })
  @ApiResponse({ status: 200, description: 'Lista de membros' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getMembers(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar time' })
  @ApiResponse({ status: 200, description: 'Time atualizado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar time' })
  @ApiResponse({ status: 200, description: 'Time desativado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }
}
