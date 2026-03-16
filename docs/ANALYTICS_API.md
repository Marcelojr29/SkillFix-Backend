# 📊 ANALYTICS API - Dashboards e Relatórios

## 📋 Visão Geral

Módulo de analytics fornecendo dados agregados, métricas e insights para dashboards e relatórios gerenciais.

---

## 🎮 Controller

```typescript
// src/modules/analytics/analytics.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Métricas principais do dashboard' })
  @ApiQuery({ name: 'teamId', required: false })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'quarter', 'year'] })
  getDashboard(
    @Query('teamId') teamId?: string,
    @Query('period') period: string = 'month',
  ) {
    return this.analyticsService.getDashboard(teamId, period);
  }

  @Get('performance-trends')
  @ApiOperation({ summary: 'Tendências de desempenho ao longo do tempo' })
  @ApiQuery({ name: 'tecnicoId', required: false })
  @ApiQuery({ name: 'teamId', required: false })
  @ApiQuery({ name: 'quarters', required: false, type: Number })
  getPerformanceTrends(
    @Query('tecnicoId') tecnicoId?: string,
    @Query('teamId') teamId?: string,
    @Query('quarters') quarters: number = 4,
  ) {
    return this.analyticsService.getPerformanceTrends(tecnicoId, teamId, quarters);
  }

  @Get('skills-matrix')
  @ApiOperation({ summary: 'Matriz de competências por time/subtime' })
  @ApiQuery({ name: 'teamId', required: false })
  @ApiQuery({ name: 'subtimeId', required: false })
  getSkillsMatrix(
    @Query('teamId') teamId?: string,
    @Query('subtimeId') subtimeId?: string,
  ) {
    return this.analyticsService.getSkillsMatrix(teamId, subtimeId);
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Top performers do período' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'quarter', required: false, type: Number })
  @ApiQuery({ name: 'year', required: false, type: Number })
  getTopPerformers(
    @Query('limit') limit: number = 10,
    @Query('quarter') quarter?: number,
    @Query('year') year?: number,
  ) {
    return this.analyticsService.getTopPerformers(limit, quarter, year);
  }

  @Get('skills-coverage')
  @ApiOperation({ summary: 'Cobertura de skills por área/time' })
  @ApiQuery({ name: 'teamId', required: false })
  getSkillsCoverage(@Query('teamId') teamId?: string) {
    return this.analyticsService.getSkillsCoverage(teamId);
  }

  @Get('team-comparison')
  @ApiOperation({ summary: 'Comparação entre times' })
  @ApiQuery({ name: 'metric', required: false, enum: ['score', 'skills', 'productivity'] })
  getTeamComparison(@Query('metric') metric: string = 'score') {
    return this.analyticsService.getTeamComparison(metric);
  }

  @Get('quarterly-report')
  @ApiOperation({ summary: 'Relatório completo trimestral' })
  @ApiQuery({ name: 'quarter', required: true, type: Number })
  @ApiQuery({ name: 'year', required: true, type: Number })
  getQuarterlyReport(
    @Query('quarter') quarter: number,
    @Query('year') year: number,
  ) {
    return this.analyticsService.getQuarterlyReport(quarter, year);
  }

  @Get('skill-gaps')
  @ApiOperation({ summary: 'Análise de gaps de competências' })
  @ApiQuery({ name: 'teamId', required: false })
  getSkillGaps(@Query('teamId') teamId?: string) {
    return this.analyticsService.getSkillGaps(teamId);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tecnico } from '../tecnicos/entities/tecnico.entity';
import { QuarterlyNote } from '../quarterly-notes/entities/quarterly-note.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
    @InjectRepository(QuarterlyNote)
    private quarterlyNotesRepository: Repository<QuarterlyNote>,
    @InjectRepository(TecnicoSkill)
    private tecnicoSkillsRepository: Repository<TecnicoSkill>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async getDashboard(teamId?: string, period: string = 'month') {
    const tecnicosQuery = this.tecnicosRepository
      .createQueryBuilder('t')
      .where('t.status = :status', { status: true });

    if (teamId) {
      tecnicosQuery.andWhere('t.teamId = :teamId', { teamId });
    }

    const totalTecnicos = await tecnicosQuery.getCount();

    // Notas do último trimestre
    const currentYear = new Date().getFullYear();
    const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3);

    const avgScoreResult = await this.quarterlyNotesRepository
      .createQueryBuilder('qn')
      .select('AVG(qn.score)', 'avgScore')
      .where('qn.year = :year AND qn.quarter = :quarter', {
        year: currentYear,
        quarter: currentQuarter,
      })
      .getRawOne();

    // Skills médio
    const avgSkillResult = await this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .select('AVG(ts.score)', 'avgSkill')
      .getRawOne();

    return {
      totalTecnicos,
      averageScore: parseFloat(avgScoreResult?.avgScore || 0).toFixed(2),
      averageSkillLevel: parseFloat(avgSkillResult?.avgSkill || 0).toFixed(2),
      period,
    };
  }

  async getPerformanceTrends(
    tecnicoId?: string,
    teamId?: string,
    quarters: number = 4,
  ) {
    const query = this.quarterlyNotesRepository
      .createQueryBuilder('qn')
      .leftJoinAndSelect('qn.tecnico', 'tecnico')
      .orderBy('qn.year', 'DESC')
      .addOrderBy('qn.quarter', 'DESC')
      .take(quarters);

    if (tecnicoId) {
      query.where('qn.tecnicoId = :tecnicoId', { tecnicoId });
    }

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const notes = await query.getMany();

    return notes.map((note) => ({
      quarter: `Q${note.quarter}/${note.year}`,
      score: note.score,
      tecnicoName: note.tecnico.name,
      evaluatedDate: note.evaluatedDate,
    }));
  }

  async getSkillsMatrix(teamId?: string, subtimeId?: string) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.tecnico', 'tecnico')
      .leftJoinAndSelect('ts.skill', 'skill')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    if (subtimeId) {
      query.andWhere('tecnico.subtimeId = :subtimeId', { subtimeId });
    }

    const skills = await query.getMany();

    // Agrupar por técnico
    const matrix = skills.reduce((acc, ts) => {
      if (!acc[ts.tecnico.name]) {
        acc[ts.tecnico.name] = {};
      }
      acc[ts.tecnico.name][ts.skill.name] = ts.score;
      return acc;
    }, {});

    return matrix;
  }

  async getTopPerformers(limit: number = 10, quarter?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentQuarter = quarter || Math.ceil((new Date().getMonth() + 1) / 3);

    const topPerformers = await this.quarterlyNotesRepository
      .createQueryBuilder('qn')
      .leftJoinAndSelect('qn.tecnico', 'tecnico')
      .where('qn.year = :year AND qn.quarter = :quarter', {
        year: currentYear,
        quarter: currentQuarter,
      })
      .orderBy('qn.score', 'DESC')
      .take(limit)
      .getMany();

    return topPerformers.map((note, index) => ({
      rank: index + 1,
      name: note.tecnico.name,
      score: note.score,
      area: note.tecnico.area,
      team: note.tecnico.teamId,
    }));
  }

  async getSkillsCoverage(teamId?: string) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico');

    if (teamId) {
      query.where('tecnico.teamId = :teamId', { teamId });
    }

    const skills = await query.getMany();

    // Calcular cobertura por skill
    const coverage = skills.reduce((acc, ts) => {
      const skillName = ts.skill.name;
      if (!acc[skillName]) {
        acc[skillName] = {
          totalTecnicos: 0,
          avgScore: 0,
          scores: [],
        };
      }
      acc[skillName].totalTecnicos++;
      acc[skillName].scores.push(ts.score);
      return acc;
    }, {});

    // Calcular média
    Object.keys(coverage).forEach((skillName) => {
      const scores = coverage[skillName].scores;
      coverage[skillName].avgScore =
        scores.reduce((sum, score) => sum + score, 0) / scores.length;
      delete coverage[skillName].scores;
    });

    return coverage;
  }

  async getTeamComparison(metric: string = 'score') {
    const teams = await this.teamsRepository.find({
      where: { status: true },
      relations: ['tecnicos'],
    });

    const comparison = await Promise.all(
      teams.map(async (team) => {
        const dashboard = await this.getDashboard(team.id, 'quarter');
        return {
          teamName: team.name,
          totalTecnicos: dashboard.totalTecnicos,
          averageScore: dashboard.averageScore,
          averageSkillLevel: dashboard.averageSkillLevel,
        };
      }),
    );

    return comparison;
  }

  async getQuarterlyReport(quarter: number, year: number) {
    const notes = await this.quarterlyNotesRepository.find({
      where: { quarter, year },
      relations: ['tecnico', 'evaluator'],
    });

    const totalEvaluations = notes.length;
    const averageScore =
      notes.reduce((sum, note) => sum + Number(note.score), 0) / totalEvaluations;

    const byArea = notes.reduce((acc, note) => {
      const area = note.tecnico.area;
      if (!acc[area]) {
        acc[area] = { count: 0, avgScore: 0, scores: [] };
      }
      acc[area].count++;
      acc[area].scores.push(Number(note.score));
      return acc;
    }, {});

    Object.keys(byArea).forEach((area) => {
      const scores = byArea[area].scores;
      byArea[area].avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      delete byArea[area].scores;
    });

    return {
      quarter,
      year,
      totalEvaluations,
      averageScore: averageScore.toFixed(2),
      byArea,
      topPerformers: notes
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, 10)
        .map((note) => ({
          name: note.tecnico.name,
          score: note.score,
          area: note.tecnico.area,
        })),
    };
  }

  async getSkillGaps(teamId?: string) {
    // Buscar todas as skills necessárias
    const allSkillsQuery = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico');

    if (teamId) {
      allSkillsQuery.where('tecnico.teamId = :teamId', { teamId });
    }

    const skillScores = await allSkillsQuery.getMany();

    // Identificar gaps (skills com pontuação < 70)
    const gaps = skillScores
      .filter((ts) => Number(ts.score) < 70)
      .map((ts) => ({
        tecnicoName: ts.tecnico.name,
        skillName: ts.skill.name,
        currentScore: ts.score,
        gap: 70 - Number(ts.score),
        priority: Number(ts.score) < 50 ? 'Alta' : 'Média',
      }));

    return {
      totalGaps: gaps.length,
      gaps: gaps.sort((a, b) => b.gap - a.gap),
    };
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/analytics/dashboard` | Métricas principais | Todos |
| GET | `/analytics/performance-trends` | Tendências de desempenho | Todos |
| GET | `/analytics/skills-matrix` | Matriz de competências | Todos |
| GET | `/analytics/top-performers` | Top performers | Todos |
| GET | `/analytics/skills-coverage` | Cobertura de skills | Todos |
| GET | `/analytics/team-comparison` | Comparação entre times | Todos |
| GET | `/analytics/quarterly-report` | Relatório trimestral | Todos |
| GET | `/analytics/skill-gaps` | Gaps de competências | Todos |

---

## 📊 Exemplos de Response

### Dashboard
```json
{
  "totalTecnicos": 45,
  "averageScore": "82.50",
  "averageSkillLevel": "75.30",
  "period": "month"
}
```

### Top Performers
```json
[
  {
    "rank": 1,
    "name": "João Silva",
    "score": 95.5,
    "area": "Manutenção",
    "team": "team-uuid-123"
  }
]
```

### Skills Matrix
```json
{
  "João Silva": {
    "Torno CNC": 85,
    "Fresadora": 90
  },
  "Maria Santos": {
    "Torno CNC": 75,
    "Solda": 88
  }
}
```
