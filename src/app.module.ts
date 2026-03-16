import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { SubTimesModule } from './modules/subtimes/subtimes.module';
import { MachinesModule } from './modules/machines/machines.module';
import { SkillsModule } from './modules/skills/skills.module';
import { TecnicosModule } from './modules/tecnicos/tecnicos.module';
import { QuarterlyNotesModule } from './modules/quarterly-notes/quarterly-notes.module';
import { AvaliacoesModule } from './modules/avaliacoes/avaliacoes.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

// Guards
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => databaseConfig(),
    }),

    // Application Modules
    AuthModule,
    UsersModule,
    TeamsModule,
    SubTimesModule,
    MachinesModule,
    SkillsModule,
    TecnicosModule,
    QuarterlyNotesModule,
    AvaliacoesModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
