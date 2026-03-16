# 📋 Quarterly Notes API - Integração de Notas Trimestrais

## Base URL
```
/api/v1/quarterly-notes
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Nota Trimestral

**POST /quarterly-notes**

**Body:**
```json
{
  "tecnicoId": "uuid-do-tecnico",
  "evaluatedBy": "uuid-do-avaliador",
  "quarter": 2,
  "year": 2024,
  "overallRating": 8.5,
  "breakdown": {
    "technical": 9.0,
    "teamwork": 8.5,
    "punctuality": 8.0,
    "quality": 9.0,
    "productivity": 8.5
  },
  "strengths": "Excelente domínio técnico, rápido na execução",
  "improvements": "Melhorar comunicação com a equipe",
  "goals": "Treinar novos operadores no próximo trimestre",
  "observations": "Destaque no trimestre pela redução de retrabalho"
}
```

**Campos:**
- `tecnicoId` (obrigatório): UUID do técnico avaliado
- `evaluatedBy` (obrigatório): UUID do usuário avaliador
- `quarter` (obrigatório): trimestre (1, 2, 3 ou 4)
- `year` (obrigatório): ano (ex: 2024)
- `overallRating` (obrigatório): nota geral (0-10, decimal permitido)
- `breakdown` (obrigatório): objeto JSON com notas por critério
- `strengths` (obrigatório): texto com pontos fortes
- `improvements` (obrigatório): texto com pontos de melhoria
- `goals` (opcional): metas para próximo período
- `observations` (opcional): observações adicionais

**Estrutura do `breakdown`:**
```typescript
{
  technical?: number;      // Habilidade técnica
  teamwork?: number;       // Trabalho em equipe
  punctuality?: number;    // Pontualidade
  quality?: number;        // Qualidade do trabalho
  productivity?: number;   // Produtividade
  safety?: number;         // Segurança
  initiative?: number;     // Iniciativa
  leadership?: number;     // Liderança
  // Campos customizados também são aceitos
}
```

**Resposta (201):**
```json
{
  "id": "f1g2h3i4-5678-90ab-cdef-1234567890ef",
  "tecnicoId": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
  "evaluatedBy": "user-uuid-123",
  "quarter": 2,
  "year": 2024,
  "overallRating": 8.5,
  "breakdown": {
    "technical": 9.0,
    "teamwork": 8.5,
    "punctuality": 8.0,
    "quality": 9.0,
    "productivity": 8.5
  },
  "strengths": "Excelente domínio técnico, rápido na execução",
  "improvements": "Melhorar comunicação com a equipe",
  "goals": "Treinar novos operadores no próximo trimestre",
  "observations": "Destaque no trimestre pela redução de retrabalho",
  "createdAt": "2026-03-16T00:05:00.000Z",
  "updatedAt": "2026-03-16T00:05:00.000Z"
}
```

**Erros:**
- **409** - Nota já existe para o período:
```json
{
  "message": "Já existe avaliação para este técnico no trimestre/ano informado",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### 2. Listar Notas Trimestrais

**GET /quarterly-notes?tecnicoId=uuid&quarter=2&year=2024**

**Query Params:**
- `tecnicoId`: filtrar por técnico
- `quarter`: filtrar por trimestre (1-4)
- `year`: filtrar por ano
- `evaluatedBy`: filtrar por avaliador

**Resposta (200):**
```json
[
  {
    "id": "f1g2h3i4-5678-90ab-cdef-1234567890ef",
    "tecnicoId": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
    "evaluatedBy": "user-uuid-123",
    "quarter": 2,
    "year": 2024,
    "overallRating": 8.5,
    "breakdown": {
      "technical": 9.0,
      "teamwork": 8.5,
      "punctuality": 8.0,
      "quality": 9.0,
      "productivity": 8.5
    },
    "strengths": "Excelente domínio técnico, rápido na execução",
    "improvements": "Melhorar comunicação com a equipe",
    "goals": "Treinar novos operadores no próximo trimestre",
    "observations": "Destaque no trimestre pela redução de retrabalho",
    "createdAt": "2026-03-16T00:05:00.000Z",
    "updatedAt": "2026-03-16T00:05:00.000Z",
    "tecnico": {
      "id": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
      "name": "João Silva",
      "employeeNumber": "EMP-12345",
      "position": "Operador de Produção"
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

**GET /quarterly-notes/:id**

Retorna nota com relações `tecnico` e `evaluator` populadas.

---

### 4. Atualizar

**PATCH /quarterly-notes/:id**

**Body (todos opcionais):**
```json
{
  "overallRating": 9.0,
  "breakdown": {
    "technical": 9.5,
    "teamwork": 9.0,
    "punctuality": 8.5,
    "quality": 9.5,
    "productivity": 9.0
  },
  "strengths": "Melhorou muito a comunicação",
  "improvements": "Continuar desenvolvimento",
  "goals": "Assumir papel de mentor",
  "observations": "Evolução excepcional"
}
```

---

### 5. Deletar

**DELETE /quarterly-notes/:id**

---

## 📘 Service

```javascript
export const quarterlyNoteService = {
  async create(noteData) {
    const { data } = await api.post('/quarterly-notes', noteData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/quarterly-notes?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/quarterly-notes/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/quarterly-notes/${id}`, updates);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/quarterly-notes/${id}`);
    return data;
  },

  // Helper para buscar por técnico
  async getByTecnico(tecnicoId, year = null) {
    const filters = { tecnicoId };
    if (year) filters.year = year;
    return this.list(filters);
  },

  // Helper para buscar período específico
  async getByPeriod(quarter, year) {
    return this.list({ quarter, year });
  },

  // Helper para calcular média do ano
  calculateYearAverage(notes) {
    if (notes.length === 0) return 0;
    const sum = notes.reduce((acc, note) => acc + note.overallRating, 0);
    return (sum / notes.length).toFixed(2);
  },
};
```

---

## 🧪 Exemplo de Componente React

```jsx
import { useState, useEffect } from 'react';
import { quarterlyNoteService } from '../services/quarterlyNoteService';

export const TecnicoQuarterlyReport = ({ tecnicoId, year = 2024 }) => {
  const [notes, setNotes] = useState([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    loadNotes();
  }, [tecnicoId, year]);

  const loadNotes = async () => {
    const data = await quarterlyNoteService.getByTecnico(tecnicoId, year);
    setNotes(data);
    
    const avg = quarterlyNoteService.calculateYearAverage(data);
    setAverage(avg);
  };

  const getQuarterLabel = (quarter) => {
    return `${quarter}º Trimestre`;
  };

  return (
    <div>
      <h2>Avaliações Trimestrais - {year}</h2>
      <p>Média Anual: <strong>{average}</strong></p>

      {[1, 2, 3, 4].map((quarter) => {
        const note = notes.find((n) => n.quarter === quarter);
        
        return (
          <div key={quarter}>
            <h3>{getQuarterLabel(quarter)}</h3>
            
            {note ? (
              <>
                <p>Nota Geral: {note.overallRating}</p>
                
                <h4>Detalhamento:</h4>
                <ul>
                  {Object.entries(note.breakdown).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
                
                <p><strong>Pontos Fortes:</strong> {note.strengths}</p>
                <p><strong>Melhorias:</strong> {note.improvements}</p>
                {note.goals && <p><strong>Metas:</strong> {note.goals}</p>}
              </>
            ) : (
              <p>Sem avaliação</p>
            )}
          </div>
        );
      })}
    </div>
  );
};
```

---

## 📝 Notas

1. **Período Único:** Um técnico só pode ter uma nota por trimestre/ano
2. **Notas:** `overallRating` e valores do `breakdown` devem estar entre 0 e 10
3. **Breakdown Flexível:** Campo JSONB aceita propriedades customizadas além das sugeridas
4. **Trimestres:** 1 (Jan-Mar), 2 (Abr-Jun), 3 (Jul-Set), 4 (Out-Dez)
5. **Histórico:** Use filtros de ano para ver evolução do técnico ao longo do tempo
