# ⭐ Avaliacoes API - Integração de Sistema de Avaliações

## Base URL
```
/api/v1/avaliacoes
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Avaliação

**POST /avaliacoes**

**Body:**
```json
{
  "tecnicoId": "uuid-do-tecnico",
  "skillId": "uuid-da-skill",
  "evaluatedBy": "uuid-do-avaliador",
  "level": "operador",
  "score": 85,
  "observations": "Demonstrou excelente conhecimento prático",
  "evaluationDate": "2024-03-15",
  "evidences": ["Certificado de conclusão", "Teste prático aprovado"]
}
```

**Campos:**
- `tecnicoId` (obrigatório): UUID do técnico avaliado
- `skillId` (obrigatório): UUID da habilidade avaliada
- `evaluatedBy` (obrigatório): UUID do usuário avaliador
- `level` (obrigatório): enum: `"aprendiz"` | `"operador"` | `"especialista"` | `"mestre"`
- `score` (obrigatório): pontuação (0-100)
- `observations` (obrigatório): texto com observações
- `evaluationDate` (obrigatório): data da avaliação (formato: YYYY-MM-DD)
- `evidences` (opcional): array de strings com evidências/documentos

**Enum SkillLevel:**
- `aprendiz`: Aprendiz
- `operador`: Operador
- `especialista`: Especialista
- `mestre`: Mestre

**Resposta (201):**
```json
{
  "id": "g1h2i3j4-5678-90ab-cdef-1234567890gh",
  "tecnicoId": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
  "skillId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "evaluatedBy": "user-uuid-123",
  "level": "operador",
  "score": 85,
  "observations": "Demonstrou excelente conhecimento prático",
  "evaluationDate": "2024-03-15",
  "evidences": ["Certificado de conclusão", "Teste prático aprovado"],
  "status": "draft",
  "createdAt": "2026-03-16T00:10:00.000Z",
  "updatedAt": "2026-03-16T00:10:00.000Z"
}
```

**Status da Avaliação:**
- `draft`: Rascunho (inicial)
- `submitted`: Submetida (aguardando aprovação)
- `approved`: Aprovada
- `rejected`: Rejeitada

---

### 2. Listar Avaliações

**GET /avaliacoes?tecnicoId=uuid&skillId=uuid&level=operador&status=approved**

**Query Params:**
- `tecnicoId`: filtrar por técnico
- `skillId`: filtrar por skill
- `evaluatedBy`: filtrar por avaliador
- `level`: filtrar por nível (`aprendiz`, `operador`, `especialista`, `mestre`)
- `status`: filtrar por status (`draft`, `submitted`, `approved`, `rejected`)
- `startDate`: data inicial (formato: YYYY-MM-DD)
- `endDate`: data final (formato: YYYY-MM-DD)

**Resposta (200):**
```json
[
  {
    "id": "g1h2i3j4-5678-90ab-cdef-1234567890gh",
    "tecnicoId": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
    "skillId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "evaluatedBy": "user-uuid-123",
    "level": "operador",
    "score": 85,
    "observations": "Demonstrou excelente conhecimento prático",
    "evaluationDate": "2024-03-15",
    "evidences": ["Certificado de conclusão", "Teste prático aprovado"],
    "status": "approved",
    "createdAt": "2026-03-16T00:10:00.000Z",
    "updatedAt": "2026-03-16T00:10:00.000Z",
    "tecnico": {
      "id": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
      "name": "João Silva",
      "employeeNumber": "EMP-12345",
      "position": "Operador de Produção"
    },
    "skill": {
      "id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "name": "Operação de Injetora",
      "category": "Operação"
    },
    "evaluator": {
      "id": "user-uuid-123",
      "name": "Maria Supervisora",
      "email": "maria@empresa.com"
    }
  }
]
```

---

### 3. Buscar por ID

**GET /avaliacoes/:id**

Retorna avaliação com relações `tecnico`, `skill` e `evaluator` populadas.

---

### 4. Atualizar

**PATCH /avaliacoes/:id**

**Body (todos opcionais):**
```json
{
  "level": "especialista",
  "score": 90,
  "observations": "Evoluiu para nível especialista",
  "evidences": ["Certificado avançado", "Projeto de melhoria concluído"]
}
```

---

### 5. Submeter Avaliação

**PATCH /avaliacoes/:id/submit**

Muda status de `draft` para `submitted`.

**Resposta (200):**
```json
{
  "id": "g1h2i3j4-5678-90ab-cdef-1234567890gh",
  "status": "submitted",
  ...
}
```

---

### 6. Aprovar Avaliação

**PATCH /avaliacoes/:id/approve**

Muda status de `submitted` para `approved`.

**Resposta (200):**
```json
{
  "id": "g1h2i3j4-5678-90ab-cdef-1234567890gh",
  "status": "approved",
  ...
}
```

---

### 7. Rejeitar Avaliação

**PATCH /avaliacoes/:id/reject**

**Body:**
```json
{
  "reason": "Falta evidência documental adequada"
}
```

Muda status de `submitted` para `rejected`.

**Resposta (200):**
```json
{
  "id": "g1h2i3j4-5678-90ab-cdef-1234567890gh",
  "status": "rejected",
  ...
}
```

---

### 8. Deletar

**DELETE /avaliacoes/:id**

---

## 📘 Service

```javascript
export const avaliacaoService = {
  async create(avaliacaoData) {
    const { data } = await api.post('/avaliacoes', avaliacaoData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/avaliacoes?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/avaliacoes/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/avaliacoes/${id}`, updates);
    return data;
  },

  async submit(id) {
    const { data } = await api.patch(`/avaliacoes/${id}/submit`);
    return data;
  },

  async approve(id) {
    const { data } = await api.patch(`/avaliacoes/${id}/approve`);
    return data;
  },

  async reject(id, reason) {
    const { data } = await api.patch(`/avaliacoes/${id}/reject`, { reason });
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/avaliacoes/${id}`);
    return data;
  },

  // Helper para buscar por técnico
  async getByTecnico(tecnicoId) {
    return this.list({ tecnicoId });
  },

  // Helper para buscar por skill
  async getBySkill(skillId) {
    return this.list({ skillId });
  },

  // Helper para buscar avaliações pendentes
  async getPending() {
    return this.list({ status: 'submitted' });
  },
};
```

---

## 🧪 Exemplo de Componente React

```jsx
import { useState, useEffect } from 'react';
import { avaliacaoService } from '../services/avaliacaoService';

export const AvaliacaoApprovalPage = () => {
  const [pendingAvaliacoes, setPending] = useState([]);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    const data = await avaliacaoService.getPending();
    setPending(data);
  };

  const handleApprove = async (id) => {
    await avaliacaoService.approve(id);
    loadPending(); // Reload list
  };

  const handleReject = async (id) => {
    const reason = prompt('Motivo da rejeição:');
    if (!reason) return;

    await avaliacaoService.reject(id, reason);
    loadPending();
  };

  const getLevelLabel = (level) => {
    const labels = {
      aprendiz: 'Aprendiz',
      operador: 'Operador',
      especialista: 'Especialista',
      mestre: 'Mestre',
    };
    return labels[level] || level;
  };

  return (
    <div>
      <h1>Avaliações Pendentes de Aprovação</h1>

      {pendingAvaliacoes.length === 0 && (
        <p>Nenhuma avaliação pendente</p>
      )}

      {pendingAvaliacoes.map((avaliacao) => (
        <div key={avaliacao.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
          <h3>{avaliacao.tecnico.name}</h3>
          <p>Habilidade: {avaliacao.skill.name}</p>
          <p>Nível: {getLevelLabel(avaliacao.level)}</p>
          <p>Pontuação: {avaliacao.score}/100</p>
          <p>Data: {new Date(avaliacao.evaluationDate).toLocaleDateString()}</p>
          <p>Observações: {avaliacao.observations}</p>
          
          {avaliacao.evidences && avaliacao.evidences.length > 0 && (
            <>
              <strong>Evidências:</strong>
              <ul>
                {avaliacao.evidences.map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            </>
          )}

          <button onClick={() => handleApprove(avaliacao.id)}>
            ✅ Aprovar
          </button>
          <button onClick={() => handleReject(avaliacao.id)}>
            ❌ Rejeitar
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 📝 Notas

1. **Workflow de Status:**
   - `draft` → `submitted` (via /submit)
   - `submitted` → `approved` (via /approve)
   - `submitted` → `rejected` (via /reject)

2. **Níveis de Habilidade:**
   - `aprendiz`: Iniciante, aprendendo
   - `operador`: Executa com autonomia
   - `especialista`: Domínio avançado, resolve problemas complexos
   - `mestre`: Referência, treina outros

3. **Pontuação:** Score de 0-100 para medir desempenho

4. **Evidências:** Array de strings para documentar certificações, testes, projetos

5. **Relacionamento:** Avaliação vincula técnico + skill + avaliador
