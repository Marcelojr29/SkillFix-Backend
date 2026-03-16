# 🏢 Teams API - Integração de Gestão de Times

## Base URL
```
/api/v1/teams
```

## 🔒 Autenticação

Requer JWT Bearer Token: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Time

**POST /teams**

**Body:**
```json
{
  "name": "Time de Produção",
  "description": "Time responsável pela produção",
  "department": "Produção",
  "supervisorId": "uuid-do-supervisor",
  "managerId": "uuid-do-manager",
  "color": "#FF5733"
}
```

**Campos:**
- `name` (obrigatório): nome do time
- `description` (obrigatório): descrição
- `department` (obrigatório): departamento
- `supervisorId` (obrigatório): UUID do supervisor
- `managerId` (opcional): UUID do gerente
- `color` (opcional): cor hex para identificação visual

**Resposta (201):**
```json
{
  "id": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "name": "Time de Produção",
  "description": "Time responsável pela produção",
  "department": "Produção",
  "supervisorId": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
  "managerId": null,
  "status": true,
  "color": "#FF5733",
  "createdAt": "2026-03-15T23:52:17.081Z",
  "updatedAt": "2026-03-15T23:52:17.081Z"
}
```

---

### 2. Listar Times

**GET /teams?page=1&limit=10&search=producao&status=true**

**Query Params:**
- `page`: número da página (padrão: 1)
- `limit`: itens por página (padrão: 20)
- `search`: busca por nome ou departamento
- `status`: boolean (true/false)

**Resposta (200):**
```json
[
  {
    "id": "bdb03293-da37-4998-a81d-b5f0344816ff",
    "name": "Time de Produção",
    "description": "Time responsável pela produção",
    "department": "Produção",
    "supervisorId": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
    "managerId": null,
    "status": true,
    "color": "#FF5733",
    "createdAt": "2026-03-15T23:52:17.081Z",
    "updatedAt": "2026-03-15T23:52:17.081Z",
    "supervisor": {
      "id": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
      "email": "admin@skillfix.com",
      "name": "Administrador",
      "role": "master"
    },
    "manager": null
  }
]
```

---

### 3. Buscar Time por ID

**GET /teams/:id**

**Resposta (200):** Mesmo formato do item acima com relações `supervisor`, `manager`, `subtimes` e `tecnicos`.

---

### 4. Atualizar Time

**PATCH /teams/:id**

**Body (campos opcionais):**
```json
{
  "name": "Novo Nome do Time",
  "description": "Nova descrição",
  "department": "Novo Departamento",
  "supervisorId": "novo-uuid",
  "managerId": "novo-uuid",
  "color": "#00FF00"
}
```

**Resposta (200):** Objeto do time atualizado

---

### 5. Alternar Status

**PATCH /teams/:id/toggle-status**

**Resposta (200):** Time com `status` invertido

---

### 6. Deletar Time

**DELETE /teams/:id**

**Resposta (200):**
```json
{
  "message": "Time deletado com sucesso"
}
```

---

## 📘 Service Example

```javascript
// src/services/teamService.js
import api from './api';

export const teamService = {
  async create(teamData) {
    const { data } = await api.post('/teams', teamData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/teams?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/teams/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/teams/${id}`, updates);
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.patch(`/teams/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/teams/${id}`);
    return data;
  },
};
```
