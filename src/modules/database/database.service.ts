import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { SubTeam } from '../subtimes/entities/subteam.entity';
import { Machine } from '../machines/entities/machine.entity';
import { Skill } from '../skills/entities/skill.entity';
import { Tecnico, Shift, Gender, Area, Senioridade } from '../tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../tecnicos/entities/tecnico-skill.entity';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Reseta completamente o banco de dados
   */
  async resetDatabase(): Promise<{ message: string }> {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Esta operação não é permitida em produção');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      this.logger.log('🔄 Iniciando reset do banco de dados...');

      await queryRunner.query('SET session_replication_role = replica;');

      // Dropar todas as tabelas (igual ao seu reset-db.ts)
      this.logger.log('🗑️  Removendo todas as tabelas...');
      await queryRunner.query(`
        DROP TABLE IF EXISTS tecnico_skills CASCADE;
        DROP TABLE IF EXISTS tecnicos CASCADE;
        DROP TABLE IF EXISTS skills CASCADE;
        DROP TABLE IF EXISTS machines CASCADE;
        DROP TABLE IF EXISTS subtimes CASCADE;
        DROP TABLE IF EXISTS teams CASCADE;
        DROP TABLE IF EXISTS users CASCADE;
        DROP TABLE IF EXISTS quarterly_notes CASCADE;
        DROP TABLE IF EXISTS evaluation_criteria CASCADE;
        DROP TABLE IF EXISTS evaluations CASCADE;
      `);

      // Dropar todos os tipos enum
      this.logger.log('🗑️  Removendo tipos enum...');
      await queryRunner.query(`
        DROP TYPE IF EXISTS users_workday_enum CASCADE;
        DROP TYPE IF EXISTS users_role_enum CASCADE;
        DROP TYPE IF EXISTS evaluations_type_enum CASCADE;
        DROP TYPE IF EXISTS evaluations_status_enum CASCADE;
        DROP TYPE IF EXISTS tecnicos_workday_enum CASCADE;
        DROP TYPE IF EXISTS tecnicos_senioridade_enum CASCADE;
        DROP TYPE IF EXISTS tecnicos_area_enum CASCADE;
        DROP TYPE IF EXISTS tecnicos_shift_enum CASCADE;
        DROP TYPE IF EXISTS tecnicos_gender_enum CASCADE;
      `);

      await queryRunner.query('SET session_replication_role = DEFAULT;');

      // Sincronizar para recriar as tabelas
      this.logger.log('🔄 Sincronizando esquema...');
      await this.dataSource.synchronize(true);
      this.logger.log('✅ Esquema recriado com sucesso!');

      return {
        message: 'Banco de dados resetado com sucesso! Agora execute o seed para popular os dados.',
      };
    } catch (error) {
      this.logger.error('❌ Erro ao resetar banco:', error);
      throw new BadRequestException(`Erro ao resetar banco: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Limpa todos os dados (mantém estrutura)
   */
  async clearAllData(): Promise<{ message: string }> {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Esta operação não é permitida em produção');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      this.logger.log('🗑️  Removendo todos os dados...');

      await queryRunner.query('SET session_replication_role = replica;');

      // Usar TRUNCATE igual ao seu seed
      await queryRunner.query('TRUNCATE TABLE tecnico_skills CASCADE');
      await queryRunner.query('TRUNCATE TABLE tecnicos CASCADE');
      await queryRunner.query('TRUNCATE TABLE skills CASCADE');
      await queryRunner.query('TRUNCATE TABLE machines CASCADE');
      await queryRunner.query('TRUNCATE TABLE subtimes CASCADE');
      await queryRunner.query('TRUNCATE TABLE teams CASCADE');
      await queryRunner.query('TRUNCATE TABLE users CASCADE');
      await queryRunner.query('TRUNCATE TABLE quarterly_notes CASCADE');
      await queryRunner.query('TRUNCATE TABLE evaluations CASCADE');
      await queryRunner.query('TRUNCATE TABLE evaluation_criteria CASCADE');

      await queryRunner.query('SET session_replication_role = DEFAULT;');

      return {
        message: 'Todos os dados foram removidos com sucesso!',
      };
    } catch (error) {
      this.logger.error('❌ Erro ao limpar dados:', error);
      throw new BadRequestException(`Erro ao limpar dados: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Executa o seed (mesma lógica do seu seed.ts)
   */
  async runSeed(): Promise<{ message: string; summary: any }> {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Esta operação não é permitida em produção');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log('🌱 Iniciando seed do banco de dados...');

      // Usar os repositórios do queryRunner para transação
      const userRepo = queryRunner.manager.getRepository(User);
      const teamRepo = queryRunner.manager.getRepository(Team);
      const subtimeRepo = queryRunner.manager.getRepository(SubTeam);
      const machineRepo = queryRunner.manager.getRepository(Machine);
      const skillRepo = queryRunner.manager.getRepository(Skill);
      const tecnicoRepo = queryRunner.manager.getRepository(Tecnico);
      const tecnicoSkillRepo = queryRunner.manager.getRepository(TecnicoSkill);

      // 1. Criar Usuário Admin
      this.logger.log('👤 Criando usuário admin...');
      const adminUser = userRepo.create({
        email: 'admin@skillfix.com',
        password: 'Admin@123',
        name: 'Administrador Master',
        role: UserRole.MASTER,
        isActive: true,
      });
      await userRepo.save(adminUser);
      this.logger.log(`✅ Admin criado: ${adminUser.email} / Admin@123`);

      // 2. Criar Supervisor
      this.logger.log('👤 Criando usuário supervisor...');
      const supervisorUser = userRepo.create({
        email: 'supervisor@skillfix.com',
        password: 'Supervisor@123',
        name: 'João Supervisor',
        role: UserRole.MASTER,
        isActive: true,
      });
      await userRepo.save(supervisorUser);
      this.logger.log(`✅ Supervisor criado: ${supervisorUser.email} / Supervisor@123`);

      // 3. Criar Times
      this.logger.log('🏢 Criando times...');
      const timeProducao = teamRepo.create({
        name: 'Time de Produção',
        department: 'Produção',
        description: 'Responsável pela produção de peças plásticas',
        supervisorId: supervisorUser.id,
        status: true,
      });
      await teamRepo.save(timeProducao);

      const timeManutencao = teamRepo.create({
        name: 'Time de Manutenção',
        department: 'Manutenção',
        description: 'Responsável pela manutenção preventiva e corretiva',
        supervisorId: supervisorUser.id,
        status: true,
      });
      await teamRepo.save(timeManutencao);

      const timeQualidade = teamRepo.create({
        name: 'Time de Qualidade',
        department: 'Qualidade',
        description: 'Responsável pelo controle de qualidade',
        supervisorId: supervisorUser.id,
        status: true,
      });
      await teamRepo.save(timeQualidade);
      this.logger.log(`✅ 3 times criados`);

      // 4. Criar SubTimes
      this.logger.log('👨‍👩‍👧‍👦 Criando subtimes...');
      const subtimeInjecao = subtimeRepo.create({
        name: 'Subtime Injeção',
        description: 'Operadores de máquinas de injeção',
        parentTeamId: timeProducao.id,
        functions: [
          {
            id: '1',
            name: 'Operação de Injetora',
            description: 'Operar máquinas de injeção',
            responsibilities: ['Ligar máquina', 'Monitorar processo'],
          },
        ],
        evaluationCriteria: [
          {
            id: '1',
            name: 'Técnica',
            description: 'Habilidade técnica',
            weight: 9,
            maxScore: 10,
          },
        ],
        status: true,
      });
      await subtimeRepo.save(subtimeInjecao);

      const subtimeExtrusao = subtimeRepo.create({
        name: 'Subtime Extrusão',
        description: 'Operadores de extrusoras',
        parentTeamId: timeProducao.id,
        functions: [
          {
            id: '1',
            name: 'Operação de Extrusora',
            description: 'Operar extrusoras',
            responsibilities: ['Ajustar perfil', 'Controlar temperatura'],
          },
        ],
        evaluationCriteria: [
          {
            id: '1',
            name: 'Produtividade',
            description: 'Capacidade produtiva',
            weight: 9,
            maxScore: 10,
          },
        ],
        status: true,
      });
      await subtimeRepo.save(subtimeExtrusao);

      const subtimeManutencaoPreventiva = subtimeRepo.create({
        name: 'Subtime Manutenção Preventiva',
        description: 'Técnicos de manutenção preventiva',
        parentTeamId: timeManutencao.id,
        functions: [
          {
            id: '1',
            name: 'Manutenção',
            description: 'Executar manutenção preventiva',
            responsibilities: ['Lubrificar', 'Inspecionar'],
          },
        ],
        evaluationCriteria: [
          {
            id: '1',
            name: 'Segurança',
            description: 'Práticas de segurança',
            weight: 10,
            maxScore: 10,
          },
        ],
        status: true,
      });
      await subtimeRepo.save(subtimeManutencaoPreventiva);
      this.logger.log(`✅ 3 subtimes criados`);

      // 5. Criar Máquinas
      this.logger.log('🏭 Criando máquinas...');
      const maq001 = machineRepo.create({
        code: 'MAQ-001',
        name: 'Injetora 001',
        description: 'Injetora para produção de peças pequenas',
        teamId: timeProducao.id,
        manufacturer: 'Engel',
        model: 'E-Mac 50',
        installationDate: new Date('2020-01-15'),
        status: true,
      });
      await machineRepo.save(maq001);

      const maq002 = machineRepo.create({
        code: 'MAQ-002',
        name: 'Injetora 002',
        description: 'Injetora para produção de peças médias',
        teamId: timeProducao.id,
        manufacturer: 'Haitian',
        model: 'Mars 3',
        installationDate: new Date('2021-03-20'),
        status: true,
      });
      await machineRepo.save(maq002);

      const maq003 = machineRepo.create({
        code: 'MAQ-003',
        name: 'Extrusora 001',
        description: 'Extrusora de perfis plásticos',
        teamId: timeProducao.id,
        manufacturer: 'Romi',
        model: 'EX-200',
        installationDate: new Date('2019-06-10'),
        status: true,
      });
      await machineRepo.save(maq003);
      this.logger.log(`✅ 3 máquinas criadas`);

      // 6. Criar Skills
      this.logger.log('🔧 Criando skills...');
      const skill1 = skillRepo.create({
        name: 'Operação de Injetora Básica',
        description: 'Habilidade para operar injetoras em modo automático',
        category: 'Operação',
        machineId: maq001.id,
        teamId: timeProducao.id,
        subtimeId: subtimeInjecao.id,
        level: 'basic',
        requirements: ['Treinamento de 20 horas', 'Acompanhamento prático supervisionado'],
        status: true,
      });
      await skillRepo.save(skill1);

      const skill2 = skillRepo.create({
        name: 'Setup de Molde Avançado',
        description: 'Habilidade para realizar setup completo de moldes',
        category: 'Setup',
        machineId: maq001.id,
        teamId: timeProducao.id,
        subtimeId: subtimeInjecao.id,
        level: 'advanced',
        requirements: ['Experiência de 2 anos na função', 'Certificação interna de setup'],
        status: true,
      });
      await skillRepo.save(skill2);

      const skill3 = skillRepo.create({
        name: 'Operação de Extrusora',
        description: 'Habilidade para operar extrusoras e controlar perfis',
        category: 'Operação',
        machineId: maq003.id,
        teamId: timeProducao.id,
        subtimeId: subtimeExtrusao.id,
        level: 'intermediary',
        requirements: ['Treinamento de 40 horas', 'Prática supervisionada', 'Conhecimento de polímeros'],
        status: true,
      });
      await skillRepo.save(skill3);

      const skill4 = skillRepo.create({
        name: 'Manutenção Preventiva Geral',
        description: 'Habilidade para executar manutenção preventiva de equipamentos',
        category: 'Manutenção',
        machineId: maq001.id,
        teamId: timeManutencao.id,
        subtimeId: subtimeManutencaoPreventiva.id,
        level: 'intermediary',
        requirements: ['Curso técnico em mecânica/elétrica', 'Experiência mínima de 1 ano'],
        status: true,
      });
      await skillRepo.save(skill4);
      this.logger.log(`✅ 4 skills criadas`);

      // 7. Criar Técnicos
      this.logger.log('👷 Criando técnicos...');
      const tecnico1 = tecnicoRepo.create({
        name: 'João Silva Santos',
        workday: 'WDC00001',
        cargo: 'Operador de Produção',
        senioridade: Senioridade.SENIOR,
        area: Area.PRODUCAO,
        shift: Shift.PRIMEIRO,
        department: 'Produção',
        gender: Gender.MASCULINO,
        joinDate: new Date('2020-01-15'),
        status: true,
        teamId: timeProducao.id,
        subtimeId: subtimeInjecao.id,
      });
      await tecnicoRepo.save(tecnico1);

      const tecnico2 = tecnicoRepo.create({
        name: 'Maria Oliveira Costa',
        workday: 'WDC00002',
        cargo: 'Operador de Produção',
        senioridade: Senioridade.PLENO,
        area: Area.PRODUCAO,
        shift: Shift.PRIMEIRO,
        department: 'Produção',
        gender: Gender.FEMININO,
        joinDate: new Date('2021-03-10'),
        status: true,
        teamId: timeProducao.id,
        subtimeId: subtimeInjecao.id,
      });
      await tecnicoRepo.save(tecnico2);

      const tecnico3 = tecnicoRepo.create({
        name: 'Carlos Eduardo Pereira',
        workday: 'WDC00003',
        cargo: 'Operador de Produção',
        senioridade: Senioridade.PLENO,
        area: Area.PRODUCAO,
        shift: Shift.SEGUNDO,
        department: 'Produção',
        gender: Gender.MASCULINO,
        joinDate: new Date('2019-08-25'),
        status: true,
        teamId: timeProducao.id,
        subtimeId: subtimeExtrusao.id,
      });
      await tecnicoRepo.save(tecnico3);

      const tecnico4 = tecnicoRepo.create({
        name: 'Ana Paula Rodrigues',
        workday: 'WDC00004',
        cargo: 'Técnico de Manutenção',
        senioridade: Senioridade.ESPECIALISTA,
        area: Area.MANUTENCAO,
        shift: Shift.ADMINISTRATIVO,
        department: 'Manutenção',
        gender: Gender.FEMININO,
        joinDate: new Date('2018-05-15'),
        status: true,
        teamId: timeManutencao.id,
        subtimeId: subtimeManutencaoPreventiva.id,
      });
      await tecnicoRepo.save(tecnico4);
      this.logger.log(`✅ 4 técnicos criados`);

      // 8. Criar TecnicoSkills
      this.logger.log('🔗 Criando relacionamentos técnico-skill...');
      const ts1 = tecnicoSkillRepo.create({
        tecnicoId: tecnico1.id,
        skillId: skill1.id,
        score: 95.0,
        notes: 'Domínio completo da operação básica',
      });
      await tecnicoSkillRepo.save(ts1);

      const ts2 = tecnicoSkillRepo.create({
        tecnicoId: tecnico1.id,
        skillId: skill2.id,
        score: 88.5,
        notes: 'Certificado em setup avançado',
      });
      await tecnicoSkillRepo.save(ts2);

      const ts3 = tecnicoSkillRepo.create({
        tecnicoId: tecnico2.id,
        skillId: skill1.id,
        score: 82.0,
        notes: 'Operação com autonomia',
      });
      await tecnicoSkillRepo.save(ts3);

      const ts4 = tecnicoSkillRepo.create({
        tecnicoId: tecnico3.id,
        skillId: skill3.id,
        score: 90.0,
        notes: 'Especialista em extrusão',
      });
      await tecnicoSkillRepo.save(ts4);

      const ts5 = tecnicoSkillRepo.create({
        tecnicoId: tecnico4.id,
        skillId: skill4.id,
        score: 92.0,
        notes: 'Certificada em manutenção industrial',
      });
      await tecnicoSkillRepo.save(ts5);
      this.logger.log(`✅ 5 relacionamentos técnico-skill criados`);

      await queryRunner.commitTransaction();

      this.logger.log('='.repeat(60));
      this.logger.log('✅ SEED CONCLUÍDO COM SUCESSO!');

      return {
        message: 'Seed executado com sucesso!',
        summary: {
          users: 2,
          teams: 3,
          subtimes: 3,
          machines: 3,
          skills: 4,
          tecnicos: 4,
          tecnicoSkills: 5,
          credentials: {
            admin: { email: 'admin@skillfix.com', password: 'Admin@123' },
            supervisor: { email: 'supervisor@skillfix.com', password: 'Supervisor@123' },
          },
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('❌ Erro ao executar seed:', error);
      throw new BadRequestException(`Erro ao executar seed: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reset completo + Seed
   */
  async fullReset(): Promise<{ message: string; summary: any }> {
    await this.resetDatabase();
    const seedResult = await this.runSeed();
    return {
      message: 'Reset completo e seed executados com sucesso!',
      summary: seedResult.summary,
    };
  }

  /**
   * Informações do banco
   */
  async getDatabaseInfo(): Promise<{
    environment: string;
    tables: string[];
    hasData: Record<string, boolean>;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const tables = [
        'users',
        'teams',
        'subtimes',
        'tecnicos',
        'skills',
        'machines',
        'evaluations',
        'quarterly_notes',
      ];

      const hasData: Record<string, boolean> = {};

      for (const table of tables) {
        try {
          const result = await queryRunner.query(
            `SELECT COUNT(*) as count FROM "${table}"`,
          );
          hasData[table] = parseInt(result[0]?.count || '0') > 0;
        } catch {
          hasData[table] = false;
        }
      }

      return {
        environment: process.env.NODE_ENV || 'development',
        tables,
        hasData,
      };
    } finally {
      await queryRunner.release();
    }
  }
}
