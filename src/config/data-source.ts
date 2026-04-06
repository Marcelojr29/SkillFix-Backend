import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Configuração para usar DATABASE_URL (Render, Heroku) ou variáveis individuais
const dataSourceConfig: any = {
  type: 'postgres',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// Se DATABASE_URL existir, use ela
if (process.env.DATABASE_URL) {
  dataSourceConfig.url = process.env.DATABASE_URL;
  dataSourceConfig.ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
} else {
  // Senão, use variáveis individuais
  dataSourceConfig.host = process.env.DATABASE_HOST || 'localhost';
  dataSourceConfig.port = parseInt(process.env.DATABASE_PORT || '5432', 10);
  dataSourceConfig.username = process.env.DATABASE_USER || 'skill_user';
  dataSourceConfig.password = process.env.DATABASE_PASSWORD || 'skill_password';
  dataSourceConfig.database = process.env.DATABASE_NAME || 'skill_db';
}

export const AppDataSource = new DataSource(dataSourceConfig);
