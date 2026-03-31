/**
 * Script para resetar o banco de dados via terminal
 * Uso: npm run db:reset
 */

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

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
    synchronize: false,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado ao banco de dados\n');

    // Desabilitar foreign keys
    await dataSource.query('SET session_replication_role = replica;');

    // Lista de tabelas
    const tables = [
      'tecnico_skills',
      'quarterly_notes',
      'evaluation_criteria',
      'evaluations',
      'tecnicos',
      'skills',
      'machines',
      'subtimes',
      'teams',
      'users',
    ];

    // Limpar tabelas
    console.log('🗑️  Removendo todos os dados...');
    for (const table of tables) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`   ✅ ${table} limpa`);
      } catch (err) {
        console.log(`   ⚠️  ${table} não encontrada ou já limpa`);
      }
    }

    // Reabilitar foreign keys
    await dataSource.query('SET session_replication_role = DEFAULT;');

    console.log('\n✅ Banco de dados resetado com sucesso!\n');
    console.log('💡 Agora execute o seed: npm run seed\n');

    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao resetar banco:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

resetDatabase();