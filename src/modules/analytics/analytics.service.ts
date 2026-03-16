import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tecnico } from '../tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';
import { QuarterlyNote } from '../quarterly-notes/entities/quarterly-note.entity';
import { Evaluation } from '../avaliacoes/entities/evaluation.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
    @InjectRepository(TecnicoSkill)
    private tecnicoSkillsRepository: Repository<TecnicoSkill>,
    @InjectRepository(QuarterlyNote)
    private quarterlyNotesRepository: Repository<QuarterlyNote>,
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
  ) {}

  async getDashboard(teamId?: string) {
    const tecnicosQuery = this.tecnicosRepository
      .createQueryBuilder('tecnico')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      tecnicosQuery.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const totalTecnicos = await tecnicosQuery.getCount();

    const tecnicosByShift = await tecnicosQuery
      .select('tecnico.shift', 'shift')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tecnico.shift')
      .getRawMany();

    const tecnicosBySenioridade = await tecnicosQuery
      .select('tecnico.senioridade', 'senioridade')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tecnico.senioridade')
      .getRawMany();

    const avgQuarterlyScore = await this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .select('AVG(note.score)', 'avg')
      .where('note.status = :status', { status: true })
      .getRawOne();

    const totalEvaluations = await this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .getCount();

    return {
      totalTecnicos,
      tecnicosByShift: tecnicosByShift.map((item) => ({
        shift: item.shift,
        count: parseInt(item.count),
      })),
      tecnicosBySenioridade: tecnicosBySenioridade.map((item) => ({
        senioridade: item.senioridade,
        count: parseInt(item.count),
      })),
      avgQuarterlyScore: parseFloat(avgQuarterlyScore?.avg || 0).toFixed(2),
      totalEvaluations,
    };
  }

  async getPerformanceTrends(tecnicoId?: string, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const query = this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .select('note.quarter', 'quarter')
      .addSelect('AVG(note.score)', 'avgScore')
      .addSelect('COUNT(*)', 'count')
      .where('note.year = :year', { year: currentYear })
      .andWhere('note.status = :status', { status: true })
      .groupBy('note.quarter')
      .orderBy('note.quarter', 'ASC');

    if (tecnicoId) {
      query.andWhere('note.tecnicoId = :tecnicoId', { tecnicoId });
    }

    const trends = await query.getRawMany();

    return {
      year: currentYear,
      data: trends.map((item) => ({
        quarter: item.quarter,
        avgScore: parseFloat(item.avgScore).toFixed(2),
        evaluationCount: parseInt(item.count),
      })),
    };
  }

  async getSkillsMatrix(teamId?: string) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const tecnicoSkills = await query.getMany();

    const skillsMap = new Map();

    tecnicoSkills.forEach((ts) => {
      const skillId = ts.skillId;
      const skillName = ts.skill?.name || 'Unknown';

      if (!skillsMap.has(skillId)) {
        skillsMap.set(skillId, {
          skillId,
          skillName,
          tecnicoCount: 0,
          avgScore: 0,
          totalScore: 0,
        });
      }

      const skill = skillsMap.get(skillId);
      skill.tecnicoCount++;
      skill.totalScore += ts.score;
    });

    const skillsMatrix = Array.from(skillsMap.values()).map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      tecnicoCount: skill.tecnicoCount,
      avgScore: (skill.totalScore / skill.tecnicoCount).toFixed(2),
    }));

    return skillsMatrix.sort((a, b) => b.tecnicoCount - a.tecnicoCount);
  }

  async getTopPerformers(limit: number = 10, quarter?: number, year?: number) {
    const currentYear = year || new Date().getFullYear();
    const currentQuarter = quarter || Math.ceil(new Date().getMonth() / 3);

    const query = this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.tecnico', 'tecnico')
      .select('tecnico.id', 'tecnicoId')
      .addSelect('tecnico.name', 'tecnicoName')
      .addSelect('AVG(note.score)', 'avgScore')
      .where('note.status = :status', { status: true })
      .andWhere('tecnico.status = :tecnicoStatus', { tecnicoStatus: true })
      .groupBy('tecnico.id')
      .addGroupBy('tecnico.name')
      .orderBy('avgScore', 'DESC')
      .limit(limit);

    if (quarter) {
      query.andWhere('note.quarter = :quarter', { quarter });
    }

    if (year) {
      query.andWhere('note.year = :year', { year });
    }

    const topPerformers = await query.getRawMany();

    return {
      period: { quarter: currentQuarter, year: currentYear },
      data: topPerformers.map((item, index) => ({
        rank: index + 1,
        tecnicoId: item.tecnicoId,
        tecnicoName: item.tecnicoName,
        avgScore: parseFloat(item.avgScore).toFixed(2),
      })),
    };
  }

  async getSkillsCoverage(teamId?: string) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const tecnicoSkills = await query.getMany();

    const skillLevelMap = new Map();

    tecnicoSkills.forEach((ts) => {
      const level = ts.skill?.level || 'Desconhecido';

      if (!skillLevelMap.has(level)) {
        skillLevelMap.set(level, { level, count: 0, avgScore: 0, totalScore: 0 });
      }

      const levelData = skillLevelMap.get(level);
      levelData.count++;
      levelData.totalScore += ts.score;
    });

    const coverage = Array.from(skillLevelMap.values()).map((item) => ({
      level: item.level,
      count: item.count,
      avgScore: (item.totalScore / item.count).toFixed(2),
    }));

    return coverage;
  }

  async getTeamComparison() {
    const teams = await this.tecnicosRepository
      .createQueryBuilder('tecnico')
      .leftJoinAndSelect('tecnico.team', 'team')
      .select('team.id', 'teamId')
      .addSelect('team.name', 'teamName')
      .addSelect('COUNT(DISTINCT tecnico.id)', 'tecnicoCount')
      .where('tecnico.status = :status', { status: true })
      .andWhere('team.status = :teamStatus', { teamStatus: true })
      .groupBy('team.id')
      .addGroupBy('team.name')
      .getRawMany();

    const teamIds = teams.map((t) => t.teamId);

    const avgScores = await this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .leftJoin('note.tecnico', 'tecnico')
      .select('tecnico.teamId', 'teamId')
      .addSelect('AVG(note.score)', 'avgScore')
      .where('note.status = :status', { status: true })
      .andWhere('tecnico.teamId IN (:...teamIds)', { teamIds })
      .groupBy('tecnico.teamId')
      .getRawMany();

    const scoreMap = new Map(
      avgScores.map((item) => [item.teamId, parseFloat(item.avgScore)]),
    );

    return teams.map((team) => ({
      teamId: team.teamId,
      teamName: team.teamName,
      tecnicoCount: parseInt(team.tecnicoCount),
      avgQuarterlyScore: (scoreMap.get(team.teamId) || 0).toFixed(2),
    }));
  }

  async getQuarterlyReport(quarter: number, year: number) {
    const notes = await this.quarterlyNotesRepository.find({
      where: { quarter, year, status: true },
      relations: ['tecnico', 'evaluator'],
      order: { score: 'DESC' },
    });

    const totalEvaluations = notes.length;
    const avgScore =
      notes.reduce((sum, note) => sum + parseFloat(note.score.toString()), 0) /
      (totalEvaluations || 1);

    const maxScore = notes.length > 0 ? notes[0].score : 0;
    const minScore = notes.length > 0 ? notes[notes.length - 1].score : 0;

    return {
      period: { quarter, year },
      summary: {
        totalEvaluations,
        avgScore: avgScore.toFixed(2),
        maxScore: parseFloat(maxScore.toString()).toFixed(2),
        minScore: parseFloat(minScore.toString()).toFixed(2),
      },
      evaluations: notes.map((note) => ({
        tecnicoId: note.tecnicoId,
        tecnicoName: note.tecnico?.name,
        score: parseFloat(note.score.toString()).toFixed(2),
        evaluatorName: note.evaluator?.name,
        date: note.date,
      })),
    };
  }

  async getSkillGaps(teamId?: string) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico')
      .where('tecnico.status = :status', { status: true })
      .andWhere('ts.score < :threshold', { threshold: 70 });

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const lowScoreSkills = await query
      .orderBy('ts.score', 'ASC')
      .limit(50)
      .getMany();

    const gaps = lowScoreSkills.map((ts) => ({
      tecnicoId: ts.tecnicoId,
      tecnicoName: ts.tecnico?.name,
      skillId: ts.skillId,
      skillName: ts.skill?.name,
      currentScore: parseFloat(ts.score.toString()).toFixed(2),
      gap: (100 - parseFloat(ts.score.toString())).toFixed(2),
      notes: ts.notes,
    }));

    return gaps;
  }
}
