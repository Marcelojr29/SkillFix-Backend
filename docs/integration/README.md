# 📚 Documentação de Integração - SkillFix API

## 🎯 Visão Geral

Esta documentação descreve como integrar o frontend com a API REST do SkillFix Backend.

**Base URL:** `http://localhost:3000/api/v1`

**Documentação Swagger:** `http://localhost:3000/api/docs`

---

## 🔑 Autenticação

A API utiliza **JWT Bearer Token** para autenticação.

### Como Autenticar

1. Faça login através do endpoint `/auth/login`
2. Receba o `accessToken` na resposta
3. Inclua o token em todas as requisições subsequentes no header:

```
Authorization: Bearer {accessToken}
```

### Estrutura do Token JWT

```typescript
{
  sub: string;        // ID do usuário
  email: string;      // Email do usuário
  role: 'master' | 'supervisor';  // Role do usuário
  iat: number;        // Timestamp de criação
  exp: number;        // Timestamp de expiração
}
```

**Validade:**
- `accessToken`: 7 dias
- `refreshToken`: 30 dias

---

## 📦 Estrutura Padrão de Resposta

### Sucesso

```json
{
  "id": "uuid",
  "campo1": "valor",
  "campo2": "valor",
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-03-15T10:00:00.000Z"
}
```

### Erro de Validação (400)

```json
{
  "message": [
    "campo1 should not be empty",
    "campo2 must be a valid email"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Erro de Autenticação (401)

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### Erro de Autorização (403)

```json
{
  "message": "Forbidden resource",
  "statusCode": 403
}
```

### Erro Não Encontrado (404)

```json
{
  "message": "Resource not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### Erro Interno (500)

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

## 🗂️ Módulos Disponíveis

### Core
 
| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| 🔐 **Autenticação** | Login, logout, refresh token, validação JWT | [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) |
| 👥 **Usuários** | CRUD completo de usuários, troca de senha | [USERS_INTEGRATION.md](./USERS_INTEGRATION.md) |

### Gestão Organizacional

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| 🏢 **Times** | Gestão de times, hierarquia supervisor/liderado | [TEAMS_INTEGRATION.md](./TEAMS_INTEGRATION.md) |
| 👨‍👩‍👧‍👦 **Sub-Times** | Gestão de sub-times, funções, critérios de avaliação | [SUBTIMES_INTEGRATION.md](./SUBTIMES_INTEGRATION.md) |
| 👷 **Técnicos** | Gestão de técnicos, upload de foto, vínculo com times | [TECNICOS_INTEGRATION.md](./TECNICOS_INTEGRATION.md) |

### Gestão de Equipamentos e Habilidades

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| 🏭 **Máquinas** | Gestão de máquinas, validação código MAQ-XXX | [MACHINES_INTEGRATION.md](./MACHINES_INTEGRATION.md) |
| 🔧 **Skills** | Gestão de habilidades, níveis (básico → avançado) | [SKILLS_INTEGRATION.md](./SKILLS_INTEGRATION.md) |

### Avaliações e Notas

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| 📋 **Notas Trimestrais** | Avaliações por trimestre, breakdown de critérios | [QUARTERLY_NOTES_INTEGRATION.md](./QUARTERLY_NOTES_INTEGRATION.md) |
| ⭐ **Avaliações** | Sistema de avaliação completo, workflow de aprovação | [AVALIACOES_INTEGRATION.md](./AVALIACOES_INTEGRATION.md) |

### Relatórios e Analytics

| Módulo | Descrição | Documentação |
|--------|-----------|--------------|
| 📊 **Analytics** | Dashboard, rankings, relatórios trimestrais, skills críticas | [ANALYTICS_INTEGRATION.md](./ANALYTICS_INTEGRATION.md) |

---

## 📋 Resumo de Endpoints

### Contadores por Módulo

| Módulo | Total de Endpoints |
|--------|-------------------|
| Auth | 4 endpoints |
| Users | 8 endpoints |
| Teams | 6 endpoints |
| SubTimes | 6 endpoints |
| Tecnicos | 7 endpoints |
| Machines | 6 endpoints |
| Skills | 6 endpoints |
| Quarterly Notes | 5 endpoints |
| Avaliacoes | 8 endpoints |
| Analytics | 8 endpoints |
| **TOTAL** | **64 endpoints** |

---

## 🚀 Quick Start

### 1. Instalação de Dependências (Frontend)

```bash
# Axios (recomendado)
npm install axios

# ou Fetch nativo do browser
```

### 2. Configuração do Cliente HTTP

```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado - tentar refresh ou redirecionar para login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Exemplo de Uso

```typescript
// Login
import api from './services/api';

async function login(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;
    
    // Salvar tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Buscar times
async function getTeams() {
  try {
    const response = await api.get('/teams', {
      params: { page: 1, limit: 10 }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    throw error;
  }
}
```

---

## 🔒 Segurança

### Headers de Segurança (Helmet)

A API retorna os seguintes headers de segurança:

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=15552000
X-XSS-Protection: 0
```

### CORS

Configurado para aceitar requisições de: `http://localhost:3001`

Para adicionar outras origens, editar variável `CORS_ORIGIN` no `.env`.

---

## 📋 Convenções

### Nomenclatura de Endpoints

- Usar plural para recursos: `/teams`, `/users`, `/machines`
- IDs como path params: `/teams/:id`
- Query params para filtros: `/teams?status=true&limit=10`

### Formato de Datas

Todas as datas seguem o formato ISO 8601:

```
2026-03-15T10:30:00.000Z
```

### UUIDs

Todos os IDs são UUIDs v4:

```
c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b
```

### Status Codes

| Código | Significado |
|--------|-------------|
| 200    | OK - Requisição bem-sucedida |
| 201    | Created - Recurso criado com sucesso |
| 204    | No Content - Ação realizada sem retorno |
| 400    | Bad Request - Erro de validação |
| 401    | Unauthorized - Não autenticado |
| 403    | Forbidden - Sem permissão |
| 404    | Not Found - Recurso não encontrado |
| 409    | Conflict - Conflito (ex: email duplicado) |
| 500    | Internal Server Error - Erro interno |

---

## 🧪 Testando a API

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillfix.com","password":"Admin@123"}'

# Listar times (com autenticação)
curl -X GET "http://localhost:3000/api/v1/teams?page=1&limit=10" \
  -H "Authorization: Bearer {seu-token}"
```

### Postman / Insomnia

Importe a coleção da documentação Swagger:

`http://localhost:3000/api/docs-json`

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação Swagger em `/api/docs`
2. Verifique os logs da aplicação
3. Entre em contato com a equipe de backend

---

## 🔄 Versionamento

**Versão Atual:** `v1`

Todas as rotas estão prefixadas com `/api/v1/`.
