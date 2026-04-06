import { Controller, Post, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DatabaseService } from './database.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Database')
@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('reset')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Resetar banco de dados (APENAS DESENVOLVIMENTO)',
    description: 'Remove todos os dados e recria as tabelas com dados iniciais (seed)'
  })
  @ApiResponse({ status: 200, description: 'Banco de dados resetado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado - Apenas Master' })
  async resetDatabase() {
    return this.databaseService.resetDatabase();
  }

  @Delete('clear')
  @Roles(UserRole.MASTER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Limpar todos os dados (APENAS DESENVOLVIMENTO)',
    description: 'Remove todos os dados das tabelas, mantendo a estrutura'
  })
  @ApiResponse({ status: 200, description: 'Dados removidos com sucesso' })
  async clearAllData() {
    return this.databaseService.clearAllData();
  }

  @Post('seed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Executar seed (TEMPORÁRIO - SEM AUTENTICAÇÃO)',
    description: 'Popula o banco com dados de teste - REMOVER PROTEÇÃO APÓS PRIMEIRO USO'
  })
  @ApiResponse({ status: 200, description: 'Seed executado com sucesso' })
  async runSeed() {
    return this.databaseService.runSeed();
  }
}