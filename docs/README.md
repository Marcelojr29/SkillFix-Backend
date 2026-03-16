# 📚 Documentação da API - SkillFix Backend

## 🎯 Visão Geral

Sistema de gestão de colaboradores, avaliações e competências técnicas para ambientes industriais.

**Stack Tecnológica:**
- **Framework:** NestJS 10.x
- **ORM:** TypeORM 0.3.x
- **Banco de Dados:** PostgreSQL 15+
- **Autenticação:** JWT (jsonwebtoken + passport-jwt)
- **Validação:** class-validator + class-transformer
- **Documentação:** Swagger/OpenAPI 3.0
- **Containerização:** Docker + Docker Compose
- **Segurança:** Helmet, CORS, bcrypt

---

## 📂 Estrutura de Módulos

### 🔐 Autenticação e Usuários
- **[AUTH_API.md](./AUTH_API.md)** - Autenticação JWT, login, refresh token
- **[USERS_API.md](./USERS_API.md)** - Gestão de usuários Master/Supervisor
- **[PASSWORD_MANAGEMENT.md](./PASSWORD_MANAGEMENT.md)** - 🔑 Gerenciamento de senhas temporárias e segurança

### 👥 Gestão de Pessoas
- **[TECNICOS_API.md](./TECNICOS_API.md)** - CRUD de colaboradores/técnicos
- **[TEAMS_API.md](./TEAMS_API.md)** - Gestão de times
- **[SUBTIMES_API.md](./SUBTIMES_API.md)** - Gestão de sub-times

### 🏭 Gestão Técnica
- **[MACHINES_API.md](./MACHINES_API.md)** - Cadastro e gestão de máquinas
- **[SKILLS_API.md](./SKILLS_API.md)** - Competências técnicas e avaliações
- **[EVALUATIONS_API.md](./EVALUATIONS_API.md)** - Sistema de avaliações
- **[QUARTERLY_NOTES_API.md](./QUARTERLY_NOTES_API.md)** - Notas trimestrais

### 📊 Analytics
- **[ANALYTICS_API.md](./ANALYTICS_API.md)** - Dashboards, métricas e relatórios

---

## 🚀 Início Rápido

### 1. Clone e Configuração

```bash
git clone <repository-url>
cd skillfix-backend
cp .env.example .env
```

### 2. Configuração Docker

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: skillfix_db
      POSTGRES_USER: skillfix
      POSTGRES_PASSWORD: skillfix_pass
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  app:
    build: .
    ports:
      - '3000:3000'
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://skillfox:skillfox_pass@postgres:5432/skillfix_db
      - REDIS_URL=redis://redis:6379

volumes:
  postgres_data:
```

### 3. Variáveis de Ambiente (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=skillfix
DATABASE_PASSWORD=skillfix_pass
DATABASE_NAME=skillfix_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=30d

# Application
PORT=3000
NODE_ENV=development
API_PREFIX=api/v1

# Redis (Cache/Sessions)
REDIS_HOST=localhost
REDIS_PORT=6379

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf

# CORS
CORS_ORIGIN=http://localhost:3001
```

### 4. Instalação e Execução

```bash
# Instalar dependências
npm install

# Rodar migrations
npm run migration:run

# Seed inicial (opcional)
npm run seed

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Docker
docker-compose up -d
```

---

## 🗂️ Estrutura de Pastas

```
src/
├── main.ts                      # Entry point
├── app.module.ts                # Módulo raiz
├── config/                      # Configurações
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── swagger.config.ts
├── common/                      # Compartilhado
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── modules/
│   ├── auth/                    # Autenticação
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── guards/
│   │   └── strategies/
│   ├── users/                   # Usuários
│   ├── tecnicos/                # Colaboradores
│   ├── teams/                   # Times
│   ├── subtimes/                # Sub-times
│   ├── machines/                # Máquinas
│   ├── skills/                  # Competências
│   ├── evaluations/             # Avaliações
│   ├── quarterly-notes/         # Notas trimestrais
│   └── analytics/               # Analytics
└── database/
    ├── migrations/
    └── seeds/
```

---

## 🔑 Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem autenticação via JWT Bearer Token:

```bash
Authorization: Bearer <token>
```

### Roles e Permissões

- **Master:** Acesso total (CRUD completo)
- **Supervisor:** Acesso limitado (leitura + gestão de time próprio)

---

## 📡 Padrões de API

### Response Success
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

### Response Error
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [...]
}
```

### Paginação
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📝 Swagger/OpenAPI

Acesse a documentação interativa:

```
http://localhost:3000/api/docs
```

---

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt (salt rounds: 10)
- ✅ JWT com refresh tokens
- ✅ Rate limiting (express-rate-limit)
- ✅ Helmet para headers de segurança
- ✅ CORS configurado
- ✅ Validação com class-validator
- ✅ SQL Injection protegido (TypeORM)
- ✅ XSS protegido (sanitização)

---

## 📦 Dependências Principais

```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "typeorm": "^0.3.17",
  "pg": "^8.11.0",
  "passport-jwt": "^4.0.1",
  "bcrypt": "^5.1.1",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.1"
}
```

---

## 🤝 Contribuição

1. Leia a documentação específica do módulo
2. Siga os padrões estabelecidos
3. Valide com DTOs
4. Documente com Swagger
5. Escreva testes

---

## 📮 Suporte

Para dúvidas sobre endpoints específicos, consulte a documentação de cada módulo listada acima.
