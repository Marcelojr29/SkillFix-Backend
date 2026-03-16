# SkillFix Backend

Backend completo desenvolvido em NestJS para o sistema de gestão de técnicos, avaliações e competências.

## 🚀 Stack Tecnológica

- **NestJS** 11.0.1 - Framework Node.js
- **TypeORM** 0.3.19 - ORM para PostgreSQL
- **PostgreSQL** 15+ - Banco de dados
- **Redis** 7 - Cache e sessões
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Docker** - Containerização

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- npm ou yarn

### Setup

1. Clone o repositório:
```bash
git clone <repository-url>
cd skill-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

4. Inicie os containers Docker:
```bash
docker-compose up -d
```

5. Execute as migrations:
```bash
npm run migration:run
```

6. (Opcional) Execute o seed para popular o banco com dados de teste:
```bash
npm run seed
```

**Credenciais padrão após seed:**
- **Admin:** admin@skillfix.com / Admin@123
- **Supervisor:** supervisor@skillfix.com / Supervisor@123

## 🏃 Executando a aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

Documentação Swagger em `http://localhost:3000/api/docs`

## 📚 Módulos

### Autenticação (`/api/v1/auth`)
- Login/Logout
- Refresh tokens
- Validação JWT
- Perfil do usuário (`/profile` e `/me`)
- RBAC (Master/Supervisor)

### Usuários (`/api/v1/users`)
- Gerenciamento de usuários
- Criação com senha automática ou manual
- Sistema de senhas temporárias (12 caracteres seguros)
- Alteração de senha
- Reset de senha por administrador
- Ver [PASSWORD_MANAGEMENT.md](./docs/PASSWORD_MANAGEMENT.md) para detalhes

### Times (`/api/v1/teams`)
- Gerenciamento de times
- Supervisores e gerentes
- Relacionamento com subtimes

### SubTimes (`/api/v1/subtimes`)
- Gerenciamento de subtimes
- Funções em JSONB
- Critérios de avaliação

### Máquinas (`/api/v1/machines`)
- Cadastro de equipamentos
- Código único
- Vinculação com skills

### Skills (`/api/v1/skills`)
- Competências técnicas
- Níveis: Básico, Intermediário, Avançado, Especialista
- Requisitos em JSONB

### Técnicos (`/api/v1/tecnicos`)
- Cadastro de técnicos
- Upload de foto
- Gerenciamento de skills com scores
- Turnos, áreas, senioridade

### Notas Trimestrais (`/api/v1/quarterly-notes`)
- Avaliações trimestrais
- Breakdown por categoria
- Histórico de performance

### Avaliações (`/api/v1/avaliacoes`)
- Avaliações detalhadas
- Workflow: Draft → Submitted → Approved/Rejected
- Critérios com pesos
- Cálculo automático de score

### Analytics (`/api/v1/analytics`)
- Dashboard geral
- Tendências de performance
- Matriz de skills
- Top performers
- Comparação entre times
- Relatórios trimestrais
- Identificação de gaps

## 🗄️ Migrations

### Gerar nova migration
```bash
npm run migration:generate -- src/migrations/MigrationName
```

### Executar migrations
```bash
npm run migration:run
```


## 🌱 Seed

O seed popula o banco com dados de teste incluindo:
- 2 usuários (Admin Master + Supervisor)
- 3 times (Produção, Manutenção, Qualidade)
- 3 subtimes
- 3 máquinas
- 4 skills
- 4 técnicos
- 5 relacionamentos técnico-skill

```bash
npm run seed
```

## 🔐 Segurança

### CORS
Configurado para aceitar requisições de:
- `http://localhost:3001`
- `http://localhost:4200` (frontend Angular/React)

Para adicionar mais origens, edite `CORS_ORIGIN` no `.env`:
```env
CORS_ORIGIN=http://localhost:3001,http://localhost:4200,https://seu-dominio.com
```

### Senhas
- Bcrypt com salt automático
- Senhas temporárias geradas automaticamente (12 caracteres)
- Mínimo de 8 caracteres para senhas manuais
- Senha temporária retornada apenas uma vez na criação

### JWT
- Access Token: 7 dias (padrão)
- Refresh Token: 30 dias (padrão)
- Configurável via `.env`

## 📖 Documentação Completa

Toda a documentação da API está disponível na pasta [docs/](./docs/):
- [README.md](./docs/README.md) - Visão geral e guia de início rápido
- [AUTH_API.md](./docs/AUTH_API.md) - Endpoints de autenticação
- [USERS_API.md](./docs/USERS_API.md) - Gestão de usuários
- [PASSWORD_MANAGEMENT.md](./docs/PASSWORD_MANAGEMENT.md) - Sistema de senhas
- [TEAMS_API.md](./docs/TEAMS_API.md) - Gestão de times
- [SUBTIMES_API.md](./docs/SUBTIMES_API.md) - Gestão de subtimes
- [MACHINES_API.md](./docs/MACHINES_API.md) - Gestão de máquinas
- [SKILLS_API.md](./docs/SKILLS_API.md) - Competências técnicas
- [TECNICOS_API.md](./docs/TECNICOS_API.md) - Gestão de técnicos
- [QUARTERLY_NOTES_API.md](./docs/QUARTERLY_NOTES_API.md) - Notas trimestrais
- [AVALIACOES_API.md](./docs/AVALIACOES_API.md) - Sistema de avaliações
- [ANALYTICS_API.md](./docs/ANALYTICS_API.md) - Analytics e relatórios

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Scripts Disponíveis

```bash
npm run start:dev      # Desenvolvimento com hot-reload
npm run start:prod     # Produção
npm run build          # Compilar TypeScript
npm run lint           # ESLint
npm run format         # Prettier
npm run seed           # Popular banco com dados de teste
npm run migration:run  # Executar migrations
```

## 🐳 Docker

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
docker build -t skillfix-backend .
docker run -p 3000:3000 skillfix-backend
```

## 🛠️ Tecnologias e Bibliotecas

- **@nestjs/core** - Framework base
- **@nestjs/typeorm** - Integração TypeORM
- **@nestjs/passport** - Autenticação
- **@nestjs/jwt** - JWT tokens
- **@nestjs/swagger** - Documentação OpenAPI
- **typeorm** - ORM
- **pg** - Driver PostgreSQL
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos
- **helmet** - Segurança HTTP headers
- **cors** - Cross-Origin Resource Sharing

## 📄 Licença

Este projeto está sob licença privada.

## 👨‍💻 Desenvolvimento

Desenvolvido para a gestão de competências técnicas em ambientes industriais.
### Reverter última migration
```bash
npm run migration:revert
```

## 🧪 Testes

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- JWT tokens com expiração
- Helmet para headers de segurança
- Validação de inputs com class-validator
- CORS configurável
- Role-based access control

## 📝 Documentação da API

Toda a documentação está disponível via Swagger UI após iniciar a aplicação:

```
http://localhost:3000/api/docs
```

Documentação detalhada de cada módulo está disponível em `/docs`:
- [Autenticação](./docs/AUTH_API.md)
- [Usuários](./docs/USERS_API.md)
- [Técnicos](./docs/TECNICOS_API.md)
- [Times](./docs/TEAMS_API.md)
- [SubTimes](./docs/SUBTIMES_API.md)
- [Máquinas](./docs/MACHINES_API.md)
- [Skills](./docs/SKILLS_API.md)
- [Avaliações](./docs/AVALIACOES_API.md)
- [Notas Trimestrais](./docs/QUARTERLY_NOTES_API.md)
- [Analytics](./docs/ANALYTICS_API.md)

## 🐳 Docker

### Build da imagem
```bash
docker build -t skillfix-backend .
```

### Executar com Docker Compose
```bash
docker-compose up
```

### Parar containers
```bash
docker-compose down
```

### Logs
```bash
docker-compose logs -f app
```

## 🛠️ Estrutura do Projeto

```
src/
├── config/              # Configurações (DB, JWT, Swagger)
├── modules/             # Módulos da aplicação
│   ├── auth/           # Autenticação e autorização
│   ├── users/          # Gerenciamento de usuários
│   ├── teams/          # Times
│   ├── subtimes/       # SubTimes
│   ├── machines/       # Máquinas
│   ├── skills/         # Competências
│   ├── tecnicos/       # Técnicos
│   ├── quarterly-notes/ # Notas Trimestrais
│   ├── avaliacoes/     # Avaliações
│   └── analytics/      # Analytics
├── migrations/         # Migrations TypeORM
├── app.module.ts      # Módulo principal
└── main.ts            # Bootstrap da aplicação
```

## 📧 Suporte

Para questões e suporte, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto é proprietário e confidencial.
