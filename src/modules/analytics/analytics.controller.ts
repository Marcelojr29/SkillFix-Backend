import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Dashboard geral com estatísticas principais' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dados do dashboard' })
  getDashboard(@Query('teamId') teamId?: string) {
    return this.analyticsService.getDashboard(teamId);
  }

  @Get('performance-trends')
  @ApiOperation({ summary: 'Tendências de performance ao longo dos trimestres' })
  @ApiQuery({ name: 'tecnicoId', required: false, type: String })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Tendências de performance' })
  getPerformanceTrends(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('year') year?: number,
  ) {
    return this.analyticsService.getPerformanceTrends(tecnicoId, year);
  }

  @Get('skills-matrix')
  @ApiOperation({ summary: 'Matriz de skills com cobertura por técnico' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Matriz de skills' })
  getSkillsMatrix(@Query('teamId') teamId?: string) {
    return this.analyticsService.getSkillsMatrix(teamId);
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Top técnicos com melhor performance' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({
    name: 'senioridade',
    required: false,
    enum: ['AUXILIAR', 'JUNIOR', 'PLENO', 'SENIOR', 'ESPECIALISTA'],
    description: 'Filtrar por senioridade',
  })
  @ApiResponse({ status: 200, description: 'Top performers' })
  getTopPerformers(
    @Query('limit') limit?: number,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
    @Query('senioridade') senioridade?: string,
  ) {
    return this.analyticsService.getTopPerformers(
      limit,
      quarter,
      year,
      senioridade,
    );
  }

  @Get('skills-coverage')
  @ApiOperation({ summary: 'Cobertura de skills por nível' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Cobertura de skills' })
  getSkillsCoverage(@Query('teamId') teamId?: string) {
    return this.analyticsService.getSkillsCoverage(teamId);
  }

  @Get('team-comparison')
  @ApiOperation({ summary: 'Comparação entre times' })
  @ApiResponse({ status: 200, description: 'Comparação de times' })
  getTeamComparison() {
    return this.analyticsService.getTeamComparison();
  }

  @Get('quarterly-report')
  @ApiOperation({ summary: 'Relatório detalhado de um trimestre' })
  @ApiQuery({ name: 'quarter', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiResponse({ status: 200, description: 'Relatório trimestral' })
  getQuarterlyReport(
    @Query('quarter') quarter: number,
    @Query('year') year: number,
  ) {
    return this.analyticsService.getQuarterlyReport(quarter, year);
  }

  @Get('skill-gaps')
  @ApiOperation({ summary: 'Identificar gaps de skills (scores baixos)' })
  @ApiQuery({ name: 'teamId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Skills com necessidade de melhoria' })
  getSkillGaps(@Query('teamId') teamId?: string) {
    return this.analyticsService.getSkillGaps(teamId);
  }

  @Get('skills-by-shift')
  @ApiOperation({ summary: 'Comparação de skills por turno' })
  @ApiQuery({
    name: 'teamId',
    required: false,
    type: String,
    description: 'Filtrar por time específico',
  })
  @ApiQuery({
    name: 'quarter',
    required: false,
    type: Number,
    description: 'Trimestre (1-4)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Ano',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparação de skills por turno',
  })
  getSkillsByShift(
    @Query('teamId') teamId?: string,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
  ) {
    return this.analyticsService.getSkillsByShift(teamId, quarter, year);
  }

  @Get('machines-by-shift')
  @ApiOperation({ summary: 'Comparação de máquinas por turno' })
  @ApiQuery({
    name: 'teamId',
    required: false,
    type: String,
    description: 'Filtrar por time específico',
  })
  @ApiQuery({
    name: 'quarter',
    required: false,
    type: Number,
    description: 'Trimestre (1-4)',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Ano',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparação de máquinas por turno',
  })
  getMachinesByShift(
    @Query('teamId') teamId?: string,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
  ) {
    return this.analyticsService.getMachinesByShift(teamId, quarter, year);
  }

  @Get('shift-performance')
  @ApiOperation({ 
    summary: 'Desempenho por turno ao longo do ano',
    description: 'Retorna a evolução mensal da pontuação média de técnicos agrupados por turno'
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: Number,
    description: 'Ano para filtrar as avaliações (default: ano atual)',
  })
  @ApiQuery({
    name: 'quarter',
    required: false,
    type: Number,
    description: 'Trimestre específico (1-4). Se não informado, retorna ano completo',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de desempenho mensal por turno',
  })
  getShiftPerformance(
    @Query('year') year?: number,
    @Query('quarter') quarter?: number,
  ) {
    return this.analyticsService.getShiftPerformance(year, quarter);
  }
}
