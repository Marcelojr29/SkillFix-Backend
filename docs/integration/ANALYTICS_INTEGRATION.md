# 📊 Analytics API - Integração de Relatórios e Dashboards

## Base URL
```
/api/v1/analytics
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Dashboard Geral

**GET /analytics/dashboard**

Retorna visão geral do sistema com indicadores principais.

**Resposta (200):**
```json
{
  "totalTecnicos": 45,
  "totalSkills": 28,
  "totalMachines": 12,
  "totalTeams": 5,
  "averageScore": 82.5,
  "recentEvaluations": 15,
  "pendingEvaluations": 7,
  "tecnicosAtivos": 42,
  "tecnicosInativos": 3
}
```

---

### 2. Avaliações por Técnico

**GET /analytics/evaluations-by-tecnico**

**Query Params:**
- `startDate`: data inicial (formato: YYYY-MM-DD)
- `endDate`: data final (formato: YYYY-MM-DD)

**Resposta (200):**
```json
[
  {
    "tecnicoId": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
    "name": "João Silva",
    "employeeNumber": "EMP-12345",
    "totalEvaluations": 8,
    "averageScore": 87.5,
    "approvedCount": 7,
    "rejectedCount": 1,
    "lastEvaluationDate": "2024-03-15"
  },
  {
    "tecnicoId": "another-uuid",
    "name": "Maria Santos",
    "employeeNumber": "EMP-67890",
    "totalEvaluations": 12,
    "averageScore": 91.2,
    "approvedCount": 11,
    "rejectedCount": 1,
    "lastEvaluationDate": "2024-03-10"
  }
]
```

---

### 3. Avaliações por Skill

**GET /analytics/evaluations-by-skill**

**Query Params:**
- `startDate`: data inicial (formato: YYYY-MM-DD)
- `endDate`: data final (formato: YYYY-MM-DD)

**Resposta (200):**
```json
[
  {
    "skillId": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "name": "Operação de Injetora",
    "category": "Operação",
    "totalEvaluations": 25,
    "averageScore": 84.3,
    "aprendizCount": 5,
    "operadorCount": 12,
    "especialistaCount": 7,
    "mestreCount": 1
  }
]
```

---

### 4. Ranking de Técnicos

**GET /analytics/tecnico-ranking?limit=10**

**Query Params:**
- `limit`: número de técnicos no ranking (padrão: 10)
- `skillId`: filtrar por skill específica

**Resposta (200):**
```json
[
  {
    "rank": 1,
    "tecnicoId": "uuid-123",
    "name": "Maria Santos",
    "employeeNumber": "EMP-67890",
    "averageScore": 93.5,
    "totalEvaluations": 15,
    "approvedCount": 15,
    "mestreCount": 3,
    "especialistaCount": 8
  },
  {
    "rank": 2,
    "tecnicoId": "uuid-456",
    "name": "Carlos Oliveira",
    "employeeNumber": "EMP-11111",
    "averageScore": 91.8,
    "totalEvaluations": 12,
    "approvedCount": 12,
    "mestreCount": 2,
    "especialistaCount": 7
  }
]
```

---

### 5. Evolução por Time

**GET /analytics/team-evolution?teamId=uuid**

**Query Params:**
- `teamId` (obrigatório): UUID do time
- `period`: período (`month`, `quarter`, `year`) - padrão: `month`

**Resposta (200):**
```json
{
  "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "teamName": "Time de Produção",
  "period": "month",
  "data": [
    {
      "period": "2024-01",
      "averageScore": 78.5,
      "evaluationsCount": 12,
      "tecnicosCount": 8
    },
    {
      "period": "2024-02",
      "averageScore": 81.2,
      "evaluationsCount": 15,
      "tecnicosCount": 8
    },
    {
      "period": "2024-03",
      "averageScore": 84.7,
      "evaluationsCount": 18,
      "tecnicosCount": 9
    }
  ]
}
```

---

### 6. Distribuição de Níveis

**GET /analytics/level-distribution?teamId=uuid**

**Query Params:**
- `teamId`: filtrar por time
- `skillId`: filtrar por skill

**Resposta (200):**
```json
{
  "total": 45,
  "distribution": {
    "aprendiz": {
      "count": 8,
      "percentage": 17.8
    },
    "operador": {
      "count": 20,
      "percentage": 44.4
    },
    "especialista": {
      "count": 14,
      "percentage": 31.1
    },
    "mestre": {
      "count": 3,
      "percentage": 6.7
    }
  }
}
```

---

### 7. Skills Críticas

**GET /analytics/critical-skills?threshold=70**

**Query Params:**
- `threshold`: pontuação mínima (padrão: 70)

Retorna skills com pontuação média abaixo do threshold.

**Resposta (200):**
```json
[
  {
    "skillId": "uuid-skill-1",
    "name": "Setup de Matriz Complexa",
    "category": "Setup",
    "averageScore": 65.3,
    "evaluationsCount": 8,
    "tecnicosCount": 5,
    "status": "critical",
    "recommendation": "Requer treinamento adicional"
  },
  {
    "skillId": "uuid-skill-2",
    "name": "Manutenção Preventiva Avançada",
    "category": "Manutenção",
    "averageScore": 68.7,
    "evaluationsCount": 10,
    "tecnicosCount": 6,
    "status": "attention",
    "recommendation": "Monitorar evolução"
  }
]
```

---

### 8. Quarterly Report

**GET /analytics/quarterly-report?quarter=2&year=2024**

**Query Params:**
- `quarter` (obrigatório): trimestre (1-4)
- `year` (obrigatório): ano
- `teamId`: filtrar por time

**Resposta (200):**
```json
{
  "quarter": 2,
  "year": 2024,
  "period": "2024-Q2",
  "summary": {
    "totalEvaluations": 120,
    "averageScore": 83.5,
    "tecnicosAvaliadosCount": 38,
    "skillsAvaliadasCount": 22,
    "approvedRate": 92.5,
    "improvementRate": 5.2
  },
  "topPerformers": [
    {
      "tecnicoId": "uuid-1",
      "name": "Maria Santos",
      "score": 95.5
    }
  ],
  "mostEvaluatedSkills": [
    {
      "skillId": "uuid-a",
      "name": "Operação de Injetora",
      "count": 25
    }
  ],
  "trends": {
    "scoreTrend": "up",
    "evaluationVolumeTrend": "stable",
    "approvalRateTrend": "up"
  }
}
```

---

## 📘 Service

```javascript
export const analyticsService = {
  async getDashboard() {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },

  async getEvaluationsByTecnico(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data } = await api.get(`/analytics/evaluations-by-tecnico?${params}`);
    return data;
  },

  async getEvaluationsBySkill(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const { data } = await api.get(`/analytics/evaluations-by-skill?${params}`);
    return data;
  },

  async getTecnicoRanking(limit = 10, skillId = null) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (skillId) params.append('skillId', skillId);
    
    const { data } = await api.get(`/analytics/tecnico-ranking?${params}`);
    return data;
  },

  async getTeamEvolution(teamId, period = 'month') {
    const params = new URLSearchParams({ teamId, period });
    const { data } = await api.get(`/analytics/team-evolution?${params}`);
    return data;
  },

  async getLevelDistribution(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/analytics/level-distribution?${params}`);
    return data;
  },

  async getCriticalSkills(threshold = 70) {
    const { data } = await api.get(`/analytics/critical-skills?threshold=${threshold}`);
    return data;
  },

  async getQuarterlyReport(quarter, year, teamId = null) {
    const params = new URLSearchParams({ quarter: quarter.toString(), year: year.toString() });
    if (teamId) params.append('teamId', teamId);
    
    const { data } = await api.get(`/analytics/quarterly-report?${params}`);
    return data;
  },
};
```

---

## 🧪 Exemplo de Dashboard React

```jsx
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';

export const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [criticalSkills, setCriticalSkills] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [dashData, rankData, critData] = await Promise.all([
      analyticsService.getDashboard(),
      analyticsService.getTecnicoRanking(5),
      analyticsService.getCriticalSkills(70),
    ]);

    setDashboard(dashData);
    setRanking(rankData);
    setCriticalSkills(critData);
  };

  if (!dashboard) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Dashboard SkillFix</h1>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        <div className="kpi-card">
          <h3>{dashboard.totalTecnicos}</h3>
          <p>Técnicos</p>
        </div>
        <div className="kpi-card">
          <h3>{dashboard.totalSkills}</h3>
          <p>Skills</p>
        </div>
        <div className="kpi-card">
          <h3>{dashboard.averageScore.toFixed(1)}</h3>
          <p>Média Geral</p>
        </div>
        <div className="kpi-card">
          <h3>{dashboard.pendingEvaluations}</h3>
          <p>Pendentes</p>
        </div>
      </div>

      {/* Top Performers */}
      <h2>Top 5 Técnicos</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Nome</th>
            <th>Matrícula</th>
            <th>Média</th>
            <th>Avaliações</th>
          </tr>
        </thead>
        <tbody>
          {ranking.map((t) => (
            <tr key={t.tecnicoId}>
              <td>{t.rank}</td>
              <td>{t.name}</td>
              <td>{t.employeeNumber}</td>
              <td>{t.averageScore.toFixed(1)}</td>
              <td>{t.totalEvaluations}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Critical Skills */}
      <h2>Skills Críticas</h2>
      {criticalSkills.length === 0 ? (
        <p>Nenhuma skill crítica identificada</p>
      ) : (
        <ul>
          {criticalSkills.map((skill) => (
            <li key={skill.skillId}>
              <strong>{skill.name}</strong> 
              {' '}(Média: {skill.averageScore.toFixed(1)}) 
              {' '}→ {skill.recommendation}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 📝 Notas

1. **Dashboard:** Visão geral com KPIs principais do sistema
2. **Filtros de Data:** Use `startDate` e `endDate` para análises por período
3. **Ranking:** Ordenado por média de pontuação
4. **Skills Críticas:** Identifica habilidades que precisam de atenção
5. **Evolução:** Acompanhamento temporal por time
6. **Quarterly Report:** Relatório consolidado por trimestre
7. **Performance:** Endpoints podem ser cacheados no frontend para melhor performance
8. **Exportação:** Considere adicionar exportação para Excel/PDF no frontend
