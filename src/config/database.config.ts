import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => {
    //Se DATABASE_URL estiver definida (Render, Heroku, etc), use ela
    if (process.env.DATABASE_URL) {
      return {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: process.env.AUTO_SCHEMA_SYNC === 'true', // Sincronização automática controlada
        logging: process.env.NODE_ENV === 'development',
        autoLoadEntities: true,
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        migrationsRun: false,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }

    // Caso contrário, use variáveis individuais (desenvolvimento local)
    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'skill_user',
      password: process.env.DATABASE_PASSWORD || 'skill_password',
      database: process.env.DATABASE_NAME || 'skill_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      autoLoadEntities: true,
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: false,
    };
  },
);
