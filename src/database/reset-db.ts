import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

async function resetDatabase() {
  console.log('🔄 Iniciando reset do banco de dados...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'skill_user',
    password: process.env.DATABASE_PASSWORD || 'skill_password',
    database: process.env.DATABASE_NAME || 'skill_db',
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    // Desabilitar verificação de foreign keys temporariamente
    await dataSource.query('SET session_replication_role = replica;');

    // Dropar todas as tabelas
    console.log('🗑️  Removendo todas as tabelas...');
    await dataSource.query(`
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
    console.log('🗑️  Removendo tipos enum...');
    await dataSource.query(`
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

    // Reabilitar verificação de foreign keys
    await dataSource.query('SET session_replication_role = DEFAULT;');

    console.log('✅ Banco de dados resetado com sucesso!\n');
    console.log('💡 Agora você pode reiniciar o servidor para recriar as tabelas.');
    console.log('💡 Depois, execute: npm run seed\n');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

resetDatabase();
