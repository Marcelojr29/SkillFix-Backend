# 👨‍👩‍👧‍👦 SubTimes API - Integração de Sub-Times

## Base URL
```
/api/v1/subtimes
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar SubTime

**POST /subtimes**

**Body:**
```json
{
  "name": "Subtime Injeção",
  "description": "Subtime de operadores de injeção",
  "parentTeamId": "uuid-do-time-pai",
  "coordenadorId": "uuid-do-coordenador",
  "functions": ["Operador", "Auxiliar", "Líder"],
  "evaluationCriteria": {
    "pontualidade": 10,
    "qualidade": 20,
    "produtividade": 30
  }
}
```

**Campos:**
- `name` (obrigatório): nome do subtime
- `description` (obrigatório): descrição
- `parentTeamId` (obrigatório): UUID do time pai
- `coordenadorId` (opcional): UUID do coordenador
- `functions` (opcional): array de funções
- `evaluationCriteria` (opcional): objeto com critérios de avaliação

**Resposta (201):**
```json
{
  "id": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
  "name": "Subtime Injeção",
  "description": "Subtime de operadores de injeção",
  "parentTeamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "coordenadorId": null,
  "functions": ["Operador", "Auxiliar", "Líder"],
  "evaluationCriteria": {
    "pontualidade": 10,
    "qualidade": 20,
    "produtividade": 30
  },
  "status": true,
  "createdAt": "2026-03-15T23:53:00.000Z",
  "updatedAt": "2026-03-15T23:53:00.000Z"
}
```

---

### 2. Listar SubTimes

**GET /subtimes?teamId=uuid&status=true**

**Query Params:**
- `teamId`: filtrar por time pai
- `status`: boolean

**Resposta (200):** Array de subtimes com relações `team`, `coordenador`, `tecnicos`

---

### 3. Buscar por ID

**GET /subtimes/:id**

---

### 4. Atualizar

**PATCH /subtimes/:id**

---

### 5. Alternar Status

**PATCH /subtimes/:id/toggle-status**

---

### 6. Deletar

**DELETE /subtimes/:id**

---

## 📘 Service

```javascript
export const subtimeService = {
  async create(data) {
    return (await api.post('/subtimes', data)).data;
  },
  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    return (await api.get(`/subtimes?${params}`)).data;
  },
  async getById(id) {
    return (await api.get(`/subtimes/${id}`)).data;
  },
  async update(id, updates) {
    return (await api.patch(`/subtimes/${id}`, updates)).data;
  },
  async toggleStatus(id) {
    return (await api.patch(`/subtimes/${id}/toggle-status`)).data;
  },
  async delete(id) {
    return (await api.delete(`/subtimes/${id}`)).data;
  },
};
```
