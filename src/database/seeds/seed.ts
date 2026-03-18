import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User, UserRole } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { SubTeam } from '../../modules/subtimes/entities/subteam.entity';
import { Machine } from '../../modules/machines/entities/machine.entity';
import { Skill } from '../../modules/skills/entities/skill.entity';
import { Tecnico, Shift, Gender, Area, Senioridade } from '../../modules/tecnicos/entities/tecnico.entity';
import { TecnicoSkill } from '../../modules/tecnicos/entities/tecnico-skill.entity';
import { QuarterlyNote } from '../../modules/quarterly-notes/entities/quarterly-note.entity';
import { Evaluation } from '../../modules/avaliacoes/entities/evaluation.entity';
import { EvaluationCriterion } from '../../modules/avaliacoes/entities/evaluation-criterion.entity';

config();

async function runSeed() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'skill_user',
    password: process.env.DATABASE_PASSWORD || 'skill_password',
    database: process.env.DATABASE_NAME || 'skill_db',
    entities: [
      User, 
      Team, 
      SubTeam, 
      Machine, 
      Skill, 
      Tecnico, 
      TecnicoSkill,
      QuarterlyNote,
      Evaluation,
      EvaluationCriterion
    ],
    synchronize: false,
    logging: false,
  });
  
  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const teamRepository = dataSource.getRepository(Team);
  const subtimeRepository = dataSource.getRepository(SubTeam);
  const machineRepository = dataSource.getRepository(Machine);
  const skillRepository = dataSource.getRepository(Skill);
  const tecnicoRepository = dataSource.getRepository(Tecnico);
  const tecnicoSkillRepository = dataSource.getRepository(TecnicoSkill);

  try {
    // Limpar dados existentes usando TRUNCATE CASCADE para evitar problemas com FK
    console.log('🧹 Limpando tabelas...');
    await dataSource.query('TRUNCATE TABLE tecnico_skills CASCADE');
    await dataSource.query('TRUNCATE TABLE tecnicos CASCADE');
    await dataSource.query('TRUNCATE TABLE skills CASCADE');
    await dataSource.query('TRUNCATE TABLE machines CASCADE');
    await dataSource.query('TRUNCATE TABLE subtimes CASCADE');
    await dataSource.query('TRUNCATE TABLE teams CASCADE');
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    await dataSource.query('TRUNCATE TABLE quarterly_notes CASCADE');
    await dataSource.query('TRUNCATE TABLE evaluations CASCADE');
    await dataSource.query('TRUNCATE TABLE evaluation_criteria CASCADE');
    console.log('✅ Tabelas limpas\n');

    // 1. Criar Usuário Admin
    console.log('👤 Criando usuário admin...');
    const adminUser = userRepository.create({
      email: 'admin@skillfix.com',
      password: 'Admin@123',
      name: 'Administrador Master',
      role: UserRole.MASTER,
      isActive: true,
    });
    await userRepository.save(adminUser);
    console.log(`✅ Admin criado: ${adminUser.email} / Admin@123\n`);

    // 2. Criar Supervisor
    console.log('👤 Criando usuário supervisor...');
    const supervisorUser = userRepository.create({
      email: 'supervisor@skillfix.com',
      password: 'Supervisor@123',
      name: 'João Supervisor',
      role: UserRole.SUPERVISOR,
      isActive: true,
    });
    await userRepository.save(supervisorUser);
    console.log(`✅ Supervisor criado: ${supervisorUser.email} / Supervisor@123\n`);

    // 3. Criar Times
    console.log('🏢 Criando times...');
    const timeProducao = teamRepository.create({
      name: 'Time de Produção',
      department: 'Produção',
      description: 'Responsável pela produção de peças plásticas',
      supervisorId: supervisorUser.id,
      status: true,
    });
    await teamRepository.save(timeProducao);

    const timeManutencao = teamRepository.create({
      name: 'Time de Manutenção',
      department: 'Manutenção',
      description: 'Responsável pela manutenção preventiva e corretiva',
      supervisorId: supervisorUser.id,
      status: true,
    });
    await teamRepository.save(timeManutencao);

    const timeQualidade = teamRepository.create({
      name: 'Time de Qualidade',
      department: 'Qualidade',
      description: 'Responsável pelo controle de qualidade',
      supervisorId: supervisorUser.id,
      status: true,
    });
    await teamRepository.save(timeQualidade);
    console.log(`✅ 3 times criados\n`);

    // 4. Criar SubTimes
    console.log('👨‍👩‍👧‍👦 Criando subtimes...');
    const subtimeInjecao = subtimeRepository.create({
      name: 'Subtime Injeção',
      description: 'Operadores de máquinas de injeção',
      parentTeamId: timeProducao.id,
      functions: [
        { 
          id: '1', 
          name: 'Operação de Injetora', 
          description: 'Operar máquinas de injeção', 
          responsibilities: ['Ligar máquina', 'Monitorar processo'] 
        }
      ],
      evaluationCriteria: [
        { 
          id: '1', 
          name: 'Técnica', 
          description: 'Habilidade técnica', 
          weight: 9, 
          maxScore: 10 
        }
      ],
      status: true,
    });
    await subtimeRepository.save(subtimeInjecao);

    const subtimeExtrusao = subtimeRepository.create({
      name: 'Subtime Extrusão',
      description: 'Operadores de extrusoras',
      parentTeamId: timeProducao.id,
      functions: [
        { 
          id: '1', 
          name: 'Operação de Extrusora', 
          description: 'Operar extrusoras', 
          responsibilities: ['Ajustar perfil', 'Controlar temperatura'] 
        }
      ],
      evaluationCriteria: [
        { 
          id: '1', 
          name: 'Produtividade', 
          description: 'Capacidade produtiva', 
          weight: 9, 
          maxScore: 10 
        }
      ],
      status: true,
    });
    await subtimeRepository.save(subtimeExtrusao);

    const subtimeManutencaoPreventiva = subtimeRepository.create({
      name: 'Subtime Manutenção Preventiva',
      description: 'Técnicos de manutenção preventiva',
      parentTeamId: timeManutencao.id,
      functions: [
        { 
          id: '1', 
          name: 'Manutenção', 
          description: 'Executar manutenção preventiva', 
          responsibilities: ['Lubrificar', 'Inspecionar'] 
        }
      ],
      evaluationCriteria: [
        { 
          id: '1', 
          name: 'Segurança', 
          description: 'Práticas de segurança', 
          weight: 10, 
          maxScore: 10 
        }
      ],
      status: true,
    });
    await subtimeRepository.save(subtimeManutencaoPreventiva);
    console.log(`✅ 3 subtimes criados\n`);

    // 5. Criar Máquinas
    console.log('🏭 Criando máquinas...');
    const maq001 = machineRepository.create({
      code: 'MAQ-001',
      name: 'Injetora 001',
      description: 'Injetora para produção de peças pequenas',
      teamId: timeProducao.id,
      manufacturer: 'Engel',
      model: 'E-Mac 50',
      installationDate: new Date('2020-01-15'),
      status: true,
    });
    await machineRepository.save(maq001);

    const maq002 = machineRepository.create({
      code: 'MAQ-002',
      name: 'Injetora 002',
      description: 'Injetora para produção de peças médias',
      teamId: timeProducao.id,
      manufacturer: 'Haitian',
      model: 'Mars 3',
      installationDate: new Date('2021-03-20'),
      status: true,
    });
    await machineRepository.save(maq002);

    const maq003 = machineRepository.create({
      code: 'MAQ-003',
      name: 'Extrusora 001',
      description: 'Extrusora de perfis plásticos',
      teamId: timeProducao.id,
      manufacturer: 'Romi',
      model: 'EX-200',
      installationDate: new Date('2019-06-10'),
      status: true,
    });
    await machineRepository.save(maq003);
    console.log(`✅ 3 máquinas criadas\n`);

    // 6. Criar Skills
    console.log('🔧 Criando skills...');
    const skill1 = skillRepository.create({
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
    await skillRepository.save(skill1);

    const skill2 = skillRepository.create({
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
    await skillRepository.save(skill2);

    const skill3 = skillRepository.create({
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
    await skillRepository.save(skill3);

    const skill4 = skillRepository.create({
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
    await skillRepository.save(skill4);
    console.log(`✅ 4 skills criadas\n`);

    // 7. Criar Técnicos
    console.log('👷 Criando técnicos...');
    const tecnico1 = tecnicoRepository.create({
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
    await tecnicoRepository.save(tecnico1);

    const tecnico2 = tecnicoRepository.create({
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
    await tecnicoRepository.save(tecnico2);

    const tecnico3 = tecnicoRepository.create({
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
    await tecnicoRepository.save(tecnico3);

    const tecnico4 = tecnicoRepository.create({
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
    await tecnicoRepository.save(tecnico4);
    console.log(`✅ 4 técnicos criados\n`);

    // 8. Criar TecnicoSkills (relacionamento)
    console.log('🔗 Criando relacionamentos técnico-skill...');
    const ts1 = tecnicoSkillRepository.create({
      tecnicoId: tecnico1.id,
      skillId: skill1.id,
      score: 95.00,
      notes: 'Domínio completo da operação básica',
    });
    await tecnicoSkillRepository.save(ts1);

    const ts2 = tecnicoSkillRepository.create({
      tecnicoId: tecnico1.id,
      skillId: skill2.id,
      score: 88.50,
      notes: 'Certificado em setup avançado',
    });
    await tecnicoSkillRepository.save(ts2);

    const ts3 = tecnicoSkillRepository.create({
      tecnicoId: tecnico2.id,
      skillId: skill1.id,
      score: 82.00,
      notes: 'Operação com autonomia',
    });
    await tecnicoSkillRepository.save(ts3);

    const ts4 = tecnicoSkillRepository.create({
      tecnicoId: tecnico3.id,
      skillId: skill3.id,
      score: 90.00,
      notes: 'Especialista em extrusão',
    });
    await tecnicoSkillRepository.save(ts4);

    const ts5 = tecnicoSkillRepository.create({
      tecnicoId: tecnico4.id,
      skillId: skill4.id,
      score: 92.00,
      notes: 'Certificada em manutenção industrial',
    });
    await tecnicoSkillRepository.save(ts5);
    console.log(`✅ 5 relacionamentos técnico-skill criados\n`);

    console.log('='.repeat(60));
    console.log('✅ SEED CONCLUÍDO COM SUCESSO!\n');
    console.log('📊 Resumo dos dados criados:');
    console.log('   • 2 usuários (admin + supervisor)');
    console.log('   • 3 times');
    console.log('   • 3 subtimes');
    console.log('   • 3 máquinas');
    console.log('   • 4 skills');
    console.log('   • 4 técnicos');
    console.log('   • 5 relacionamentos técnico-skill\n');
    console.log('🔑 Credenciais de acesso:');
    console.log('   Admin: admin@skillfix.com / Admin@123');
    console.log('   Supervisor: supervisor@skillfix.com / Supervisor@123\n');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

runSeed()
  .then(() => {
    console.log('\n🎉 Processo finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });
