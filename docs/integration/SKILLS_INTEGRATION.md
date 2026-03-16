# 🔧 Skills API - Integração de Gestão de Habilidades

## Base URL
```
/api/v1/skills
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Skill

**POST /skills**

**Body:**
```json
{
  "name": "Operação de Injetora",
  "description": "Habilidade para operar máquinas de injeção plástica",
  "category": "Operação",
  "machineId": "uuid-da-maquina",
  "teamId": "uuid-do-time",
  "subtimeId": "uuid-do-subtime",
  "level": "intermediary",
  "requirements": "Treinamento de 40 horas + prática supervisionada"
}
```

**Campos:**
- `name` (obrigatório): nome da habilidade
- `description` (obrigatório): descrição detalhada
- `category` (obrigatório): categoria (ex: "Operação", "Manutenção", "Setup")
- `machineId` (obrigatório): UUID da máquina relacionada
- `teamId` (obrigatório): UUID do time
- `subtimeId` (obrigatório): UUID do subtime
- `level` (opcional): enum: `"basic"` | `"intermediary"` | `"advanced"` (padrão: `"basic"`)
- `requirements` (opcional): texto com requisitos

**Enum SkillLevel:**
- `basic`: Básico
- `intermediary`: Intermediário
- `advanced`: Avançado

**Resposta (201):**
```json
{
  "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "name": "Operação de Injetora",
  "category": "Operação",
  "description": "Habilidade para operar máquinas de injeção plástica",
  "machineId": "4d2cb338-3a7b-4bfb-9602-8e5f2c95c069",
  "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "subtimeId": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
  "level": "intermediary",
  "requirements": "Treinamento de 40 horas + prática supervisionada",
  "status": true,
  "createdAt": "2026-03-15T23:55:00.000Z",
  "updatedAt": "2026-03-15T23:55:00.000Z"
}
```

---

### 2. Listar Skills

**GET /skills?machineId=uuid&teamId=uuid&level=basic&status=true**

**Query Params:**
- `machineId`: filtrar por máquina
- `teamId`: filtrar por time
- `subtimeId`: filtrar por subtime
- `level`: filtrar por nível (`basic`, `intermediary`, `advanced`)
- `category`: filtrar por categoria
- `status`: boolean

**Resposta (200):**
```json
[
  {
    "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "name": "Operação de Injetora",
    "category": "Operação",
    "description": "Habilidade para operar máquinas de injeção plástica",
    "machineId": "4d2cb338-3a7b-4bfb-9602-8e5f2c95c069",
    "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
    "subtimeId": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
    "level": "intermediary",
    "requirements": "Treinamento de 40 horas + prática supervisionada",
    "status": true,
    "createdAt": "2026-03-15T23:55:00.000Z",
    "updatedAt": "2026-03-15T23:55:00.000Z",
    "machine": {
      "id": "4d2cb338-3a7b-4bfb-9602-8e5f2c95c069",
      "name": "Matriz de Injeção 001",
      "code": "MAQ-001"
    },
    "team": {
      "id": "bdb03293-da37-4998-a81d-b5f0344816ff",
      "name": "Time de Produção"
    },
    "subtime": {
      "id": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
      "name": "Subtime Injeção"
    }
  }
]
```

---

### 3. Buscar por ID

**GET /skills/:id**

---

### 4. Atualizar

**PATCH /skills/:id**

---

### 5. Alternar Status

**PATCH /skills/:id/toggle-status**

---

### 6. Deletar

**DELETE /skills/:id**

---

## 📘 Service

```javascript
export const skillService = {
  async create(skillData) {
    const { data } = await api.post('/skills', skillData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/skills?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/skills/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/skills/${id}`, updates);
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.patch(`/skills/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/skills/${id}`);
    return data;
  },

  // Helper para obter skills por máquina
  async getByMachine(machineId) {
    return this.list({ machineId });
  },

  // Helper para obter skills por time
  async getByTeam(teamId) {
    return this.list({ teamId });
  },
};
```

---

## 🧪 Exemplo de Componente React

```jsx
import { useState, useEffect } from 'react';
import { skillService } from '../services/skillService';

export const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [filters, setFilters] = useState({
    level: '',
    machineId: '',
    teamId: '',
  });

  useEffect(() => {
    loadSkills();
  }, [filters]);

  const loadSkills = async () => {
    const data = await skillService.list(filters);
    setSkills(data);
  };

  const getLevelLabel = (level) => {
    const labels = {
      basic: 'Básico',
      intermediary: 'Intermediário',
      advanced: 'Avançado',
    };
    return labels[level] || level;
  };

  return (
    <div>
      <h1>Habilidades</h1>

      {/* Filtro de Nível */}
      <select
        value={filters.level}
        onChange={(e) => setFilters({ ...filters, level: e.target.value })}
      >
        <option value="">Todos os Níveis</option>
        <option value="basic">Básico</option>
        <option value="intermediary">Intermediário</option>
        <option value="advanced">Avançado</option>
      </select>

      {/* Lista */}
      {skills.map((skill) => (
        <div key={skill.id}>
          <h3>{skill.name}</h3>
          <p>Categoria: {skill.category}</p>
          <p>Nível: {getLevelLabel(skill.level)}</p>
          <p>Máquina: {skill.machine?.name}</p>
          <p>Time: {skill.team?.name}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 📝 Notas

1. **Hierarquia:** Skill → Machine → Team → SubTime
2. **Níveis:** 3 níveis de proficiência (básico, intermediário, avançado)
3. **Categorias:** Livre, definido pelo usuário (ex: Operação, Manutenção, Setup)
4. **Vinculação:** Sempre vinculada a uma máquina específica
