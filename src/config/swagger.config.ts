import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'SkillFix API')
    .setDescription(
      process.env.SWAGGER_DESCRIPTION ||
        'Sistema de gestão de colaboradores, avaliações e competências técnicas',
    )
    .setVersion(process.env.SWAGGER_VERSION || '1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Teams', 'Gestão de times')
    .addTag('SubTimes', 'Gestão de sub-times')
    .addTag('Machines', 'Cadastro de máquinas')
    .addTag('Skills', 'Competências técnicas')
    .addTag('Tecnicos', 'Gestão de colaboradores técnicos')
    .addTag('QuarterlyNotes', 'Notas trimestrais')
    .addTag('Evaluations', 'Sistema de avaliações')
    .addTag('Analytics', 'Dashboards e relatórios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.SWAGGER_PATH || 'api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
