import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tecnico } from '../tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';
import { QuarterlyNote } from '../quarterly-notes/entities/quarterly-note.entity';
import { Evaluation } from '../avaliacoes/entities/evaluation.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Team } from '../teams/entities/team.entity';

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
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private dataSource: DataSource,
  ) {}

  async getDashboard(teamId?: string) {
    const tecnicosQuery = this.tecnicosRepository
      .createQueryBuilder('tecnico')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      tecnicosQuery.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const totalTecnicos = await tecnicosQuery.getCount();
    const activeTecnicos = totalTecnicos;

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

    const tecnicosByGender = await tecnicosQuery
      .select('tecnico.gender', 'gender')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tecnico.gender')
      .getRawMany();

    const tecnicosByArea = await tecnicosQuery
      .select('tecnico.area', 'area')
      .addSelect('COUNT(*)', 'count')
      .groupBy('tecnico.area')
      .getRawMany();

    const avgQuarterlyScore = await this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .select('AVG(note.score)', 'avg')
      .where('note.status = :status', { status: true })
      .getRawOne();

    const totalEvaluations = await this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .getCount();
    
    const totalTeams = await this.teamsRepository
      .createQueryBuilder('team')
      .where('team.status = :status', { status: true })
      .getCount();

    const totalMachines = await this.machinesRepository
      .createQueryBuilder('machine')
      .where('machine.status = :status', { status: true })
      .getCount();

    return {
      totalTecnicos,
      activeTecnicos,
      tecnicosByShift: tecnicosByShift.map((item) => ({
        shift: item.shift,
        count: parseInt(item.count),
      })),
      tecnicosBySenioridade: tecnicosBySenioridade.map((item) => ({
        senioridade: item.senioridade,
        count: parseInt(item.count),
      })),
      tecnicosByGender: tecnicosByGender.map((item) => ({
        gender: item.gender,
        count: parseInt(item.count),
      })),
      tecnicosByArea: tecnicosByArea.map((item) => ({
        area: item.area,
        count: parseInt(item.count),
      })),
      avgQuarterlyScore: parseFloat(avgQuarterlyScore?.avg || 0).toFixed(2),
      totalEvaluations,
      totalTeams,
      totalMachines,
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

  async getTopPerformers(
    limit: number = 10,
    quarter?: number,
    year?: number,
    senioridade?: string,
  ) {
    const currentYear = year || new Date().getFullYear();
    const currentQuarter = quarter || Math.ceil(new Date().getMonth() / 3);

    // Mapeamento de senioridade uppercase para o formato do enum
    const senioridadeMap: Record<string, string> = {
      'AUXILIAR': 'Auxiliar',
      'JUNIOR': 'Junior',
      'PLENO': 'Pleno',
      'SENIOR': 'Sênior',
      'ESPECIALISTA': 'Especialista',
      'COORDENADOR': 'Coordenador',
      'SUPERVISOR': 'Supervisor',
    };

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
      .orderBy('"avgScore"', 'DESC')
      .limit(limit);

    if (quarter) {
      query.andWhere('note.quarter = :quarter', { quarter });
    }

    if (year) {
      query.andWhere('note.year = :year', { year });
    }

    if (senioridade) {
      const mappedSenioridade = senioridadeMap[senioridade] || senioridade;
      query.andWhere('tecnico.senioridade = :senioridade', { senioridade: mappedSenioridade });
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

  async getSkillsByShift(teamId?: string, quarter?: number, year?: number) {
    const query = this.tecnicoSkillsRepository
      .createQueryBuilder('ts')
      .leftJoinAndSelect('ts.skill', 'skill')
      .leftJoinAndSelect('ts.tecnico', 'tecnico')
      .where('tecnico.status = :status', { status: true });

    if (teamId) {
      query.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    const tecnicoSkills = await query.getMany();

    // Agrupar por skill e calcular médias por turno
    const skillsMap = new Map();

    tecnicoSkills.forEach((ts) => {
      const skillKey = ts.skill?.id;
      if (!skillKey) return;

      if (!skillsMap.has(skillKey)) {
        skillsMap.set(skillKey, {
          skillId: ts.skill.id,
          skillName: ts.skill.name,
          skillCategory: ts.skill.category,
          shifts: { '1T': [], '2T': [], '3T': [], 'ADM': [] },
          totalTecnicos: new Set(),
        });
      }

      const skillData = skillsMap.get(skillKey);
      const shift = ts.tecnico?.shift;

      if (shift && skillData.shifts[shift]) {
        skillData.shifts[shift].push(ts.score);
      }
      skillData.totalTecnicos.add(ts.tecnico?.id);
    });

    // Calcular médias
    const result = Array.from(skillsMap.values()).map((skill) => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillCategory: skill.skillCategory,
      shifts: {
        '1T': this.calculateAverage(skill.shifts['1T']),
        '2T': this.calculateAverage(skill.shifts['2T']),
        '3T': this.calculateAverage(skill.shifts['3T']),
        'ADM': this.calculateAverage(skill.shifts['ADM']),
      },
      overallAverage: this.calculateOverallAverage(skill.shifts),
      totalTecnicos: skill.totalTecnicos.size,
    }));

    return result;
  }

  async getMachinesByShift(teamId?: string, quarter?: number, year?: number) {
    const query = this.machinesRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.skills', 'skill')
      .where('m.status = :status', { status: true });

    if (teamId) {
      query.andWhere('m.teamId = :teamId', { teamId });
    }

    const machines = await query.getMany();

    const result = [];

    for (const machine of machines) {
      const shifts = { '1T': [], '2T': [], '3T': [], 'ADM': [] };
      const tecnicosSet = new Set();
      const skillsCount = machine.skills?.length || 0;

      if (machine.skills && machine.skills.length > 0) {
        for (const skill of machine.skills) {
          const tecnicoSkills = await this.tecnicoSkillsRepository.find({
            where: { skillId: skill.id },
            relations: ['tecnico'],
          });

          tecnicoSkills.forEach((ts) => {
            if (ts.tecnico?.status) {
              const shift = ts.tecnico.shift;
              if (shifts[shift]) {
                shifts[shift].push(ts.score);
              }
              tecnicosSet.add(ts.tecnico.id);
            }
          });
        }
      }

      const shiftAverages = {
        '1T': this.calculateAverage(shifts['1T']),
        '2T': this.calculateAverage(shifts['2T']),
        '3T': this.calculateAverage(shifts['3T']),
        'ADM': this.calculateAverage(shifts['ADM']),
      };

      const bestShift = Object.entries(shiftAverages).reduce((a, b) =>
        b[1] > a[1] ? b : a,
      )[0];

      result.push({
        machineId: machine.id,
        machineCode: machine.code,
        machineName: machine.name,
        shifts: shiftAverages,
        overallAverage: this.calculateOverallAverage(shifts),
        totalSkills: skillsCount,
        totalTecnicos: tecnicosSet.size,
        bestShift,
      });
    }

    return result;
  }

  async getShiftPerformance(year?: number, quarter?: number) {
    // Define o ano alvo (default: ano atual)
    const targetYear = year || new Date().getFullYear();

    // Cria query base para buscar avaliações
    const query = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.tecnico', 'tecnico')
      .where('evaluation.year = :year', { year: targetYear })
      .andWhere('tecnico.status = :status', { status: true });

    // Filtra por trimestre se informado
    if (quarter) {
      query.andWhere('evaluation.quarter = :quarter', { quarter });
    }

    const evaluations = await query.getMany();

    // Estrutura para armazenar dados agrupados por mês e turno
    const monthlyData: {
      [month: number]: {
        [shift: string]: { total: number; count: number };
      };
    } = {};

    // Agrupa avaliações por mês e turno
    evaluations.forEach((evaluation) => {
      const evaluationDate = new Date(evaluation.evaluationDate);
      const month = evaluationDate.getMonth() + 1; // 1-12
      const shift = evaluation.tecnico?.shift || 'ADM';
      const score = Number(evaluation.totalScore) || 0;

      // ---------------------------------------------------------
      // Inicializa estrutura do mês se não existir
      if (!monthlyData[month]) {
        monthlyData[month] = {};
      }

      // Inicializa estrutura do turno se não existir
      if (!monthlyData[month][shift]) {
        monthlyData[month][shift] = { total: 0, count: 0 };
      }

      // Acumula scores
      monthlyData[month][shift].total += score;
      monthlyData[month][shift].count += 1;
    });

    // Nomes dos meses
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ];

    // Define range de meses baseado no trimestre
    let startMonth = 1;
    let endMonth = 12;

    if (quarter) {
      startMonth = (quarter - 1) * 3 + 1;
      endMonth = quarter * 3;
    }

    // Monta resposta formatada
    const result = [];
    for (let month = startMonth; month <= endMonth; month++) {
      const shifts = monthlyData[month] || {};

      const calculateShiftAverage = (shift: string): number => {
        if (!shifts[shift] || shifts[shift].count === 0) return 0;
        return Math.round((shifts[shift].total / shifts[shift].count) * 10) / 10;
      };

      const monthData: any = {
        month: monthNames[month - 1],
        monthNumber: month,
        '1T': calculateShiftAverage('1T'),
        '2T': calculateShiftAverage('2T'),
        '3T': calculateShiftAverage('3T'),
        'ADM': calculateShiftAverage('ADM'),
      };

      // Adiciona turno especial se houver dados
      if (shifts['Especial']) {
        monthData['Especial'] = calculateShiftAverage('Especial');
      }

      result.push(monthData);
    }

    return result;
  }

  private calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }

  private calculateOverallAverage(shifts: any): number {
    const allScores = [
      ...shifts['1T'],
      ...shifts['2T'],
      ...shifts['3T'],
      ...shifts['ADM'],
    ];
    return this.calculateAverage(allScores);
  }
}
