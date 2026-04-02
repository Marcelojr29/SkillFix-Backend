# API de Desempenho por Turno (Shift Performance)

## 📋 Visão Geral

Este documento descreve a especificação do endpoint de **Desempenho por Turno**, necessário para popular o gráfico "Pontuação Anual por Turno" na tela Home do SkillFix.

**Status**: ✅ **Implementado**  
**Prioridade**: Média  
**Frontend**: ✅ Já implementado e pronto para integração automática  
**Backend**: ✅ Implementado em 02/04/2026

---

## 🎯 Objetivo

Fornecer dados de evolução mensal da pontuação média de cada turno ao longo do ano, permitindo visualizar tendências de desempenho por turno em um gráfico de linhas.

---

## 📊 Endpoint

### **GET** `/api/v1/analytics/shift-performance`

Retorna a evolução mensal da pontuação média de técnicos agrupados por turno.

---

## 📥 Request

### Query Parameters

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| `year` | number | Não | Ano atual | Ano para filtrar as avaliações |
| `quarter` | number | Não | - | Trimestre específico (1-4). Se não informado, retorna ano completo |

### Exemplos de Request

```http
GET /api/v1/analytics/shift-performance
GET /api/v1/analytics/shift-performance?year=2026
GET /api/v1/analytics/shift-performance?year=2026&quarter=2
```

---

## 📤 Response

### Status Codes

- **200 OK**: Dados retornados com sucesso
- **400 Bad Request**: Parâmetros inválidos
- **401 Unauthorized**: Usuário não autenticado
- **500 Internal Server Error**: Erro no servidor

### Response Body

**Type**: `ShiftPerformanceData[]`

```typescript
interface ShiftPerformanceData {
  month: string           // Nome do mês (Jan, Fev, Mar, ...)
  monthNumber: number     // Número do mês (1-12)
  '1T': number           // Pontuação média do 1º Turno (0-100)
  '2T': number           // Pontuação média do 2º Turno (0-100)
  '3T': number           // Pontuação média do 3º Turno (0-100)
  'ADM': number          // Pontuação média do Turno Administrativo (0-100)
  'Especial'?: number    // Pontuação média de turnos especiais (opcional)
}
```

### Exemplo de Response

```json
[
  {
    "month": "Jan",
    "monthNumber": 1,
    "1T": 85.5,
    "2T": 82.3,
    "3T": 78.9,
    "ADM": 86.2,
    "Especial": 84.1
  },
  {
    "month": "Fev",
    "monthNumber": 2,
    "1T": 87.2,
    "2T": 84.1,
    "3T": 80.5,
    "ADM": 88.0,
    "Especial": 85.3
  },
  {
    "month": "Mar",
    "monthNumber": 3,
    "1T": 88.1,
    "2T": 86.0,
    "3T": 81.2,
    "ADM": 87.5,
    "Especial": 86.0
  }
  // ... até Dezembro (ou meses do trimestre específico)
]
```

### Response Vazio

Se não houver avaliações no período:

```json
[]
```

---

## 🧮 Lógica de Cálculo

### Agregação de Dados

1. **Filtrar avaliações**:
   - Por ano (obrigatório, default: ano atual)
   - Por trimestre (opcional)

2. **Agrupar por mês e turno**:
   - Extrair mês da data de avaliação (`evaluationDate`)
   - Agrupar técnicos pelo campo `shift`

3. **Calcular média mensal**:
   - Para cada mês, calcular média das pontuações (`totalScore`) dos técnicos de cada turno
   - Normalizar pontuação para escala 0-100 se necessário

4. **Montar resposta**:
   - Ordenar por mês (crescente)
   - Retornar array de objetos com mês + pontuações por turno

### Mapeamento de Turnos

| Valor no DB | Campo na Response | Nome Exibido |
|-------------|-------------------|--------------|
| `1T` | `1T` | 1º Turno |
| `2T` | `2T` | 2º Turno |
| `3T` | `3T` | 3º Turno |
| `ADM` | `ADM` | Comercial/Administrativo |
| `Especial` | `Especial` | Especial |

### Tratamento de Dados Ausentes

- Se um turno não tiver avaliações em determinado mês, retornar `0` ou `null`
- Se o mês não tiver nenhuma avaliação, incluir o mês com todos os turnos em `0`

---

## 💻 Implementação no Backend

### Exemplo de Query SQL (Conceitual)

```sql
SELECT 
  EXTRACT(MONTH FROM e.evaluation_date) as month_number,
  TO_CHAR(e.evaluation_date, 'Mon') as month,
  t.shift,
  AVG(e.total_score) as avg_score
FROM evaluations e
JOIN tecnicos t ON e.tecnico_id = t.id
WHERE 
  EXTRACT(YEAR FROM e.evaluation_date) = :year
  AND (:quarter IS NULL OR EXTRACT(QUARTER FROM e.evaluation_date) = :quarter)
GROUP BY 
  EXTRACT(MONTH FROM e.evaluation_date),
  TO_CHAR(e.evaluation_date, 'Mon'),
  t.shift
ORDER BY month_number ASC
```

### Pseudo-código

```typescript
async getShiftPerformance(year?: number, quarter?: number) {
  const targetYear = year || new Date().getFullYear()
  
  // 1. Buscar todas as avaliações do ano/trimestre
  const evaluations = await this.evaluationsRepository.find({
    where: {
      year: targetYear,
      ...(quarter && { quarter })
    },
    relations: ['tecnico']
  })
  
  // 2. Agrupar por mês e turno
  const monthlyData = {}
  
  evaluations.forEach(evaluation => {
    const month = new Date(evaluation.evaluationDate).getMonth() + 1
    const shift = evaluation.tecnico.shift
    
    if (!monthlyData[month]) {
      monthlyData[month] = {}
    }
    
    if (!monthlyData[month][shift]) {
      monthlyData[month][shift] = { total: 0, count: 0 }
    }
    
    monthlyData[month][shift].total += evaluation.totalScore
    monthlyData[month][shift].count += 1
  })
  
  // 3. Calcular médias e formatar resposta
  const result = []
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  for (let month = 1; month <= 12; month++) {
    const shifts = monthlyData[month] || {}
    
    result.push({
      month: monthNames[month - 1],
      monthNumber: month,
      '1T': shifts['1T'] ? shifts['1T'].total / shifts['1T'].count : 0,
      '2T': shifts['2T'] ? shifts['2T'].total / shifts['2T'].count : 0,
      '3T': shifts['3T'] ? shifts['3T'].total / shifts['3T'].count : 0,
      'ADM': shifts['ADM'] ? shifts['ADM'].total / shifts['ADM'].count : 0,
      'Especial': shifts['Especial'] ? shifts['Especial'].total / shifts['Especial'].count : 0,
    })
  }
  
  return result
}
```

---

## 🔌 Integração Frontend

### ✅ Status: Implementado

O frontend já está preparado para consumir este endpoint automaticamente quando o backend estiver pronto.

### Arquivos Modificados

1. **Rota Proxy**: `app/api/analytics/shift-performance/route.ts`
2. **Service**: `core/services/analytics.service.ts` → método `getShiftPerformance()`
3. **Componente**: `app/home/page.tsx` → consome API com fallback para dados mockados

### Funcionamento

```typescript
// Frontend tenta buscar dados reais
const data = await analyticsService.getShiftPerformance(currentYear)

// Se backend retornar 404/500 (endpoint não implementado):
// Frontend usa dados mockados como fallback

// Quando backend implementar:
// Dados reais serão usados automaticamente
```

---

## 🧪 Testes Recomendados

### Casos de Teste

1. **Ano completo com dados**:
   - Request: `GET /analytics/shift-performance?year=2026`
   - Espera: 12 meses com pontuações

2. **Trimestre específico**:
   - Request: `GET /analytics/shift-performance?year=2026&quarter=2`
   - Espera: 3 meses (Abr, Mai, Jun)

3. **Ano sem avaliações**:
   - Request: `GET /analytics/shift-performance?year=2050`
   - Espera: Array vazio `[]` ou meses com zeros

4. **Turno sem técnicos em mês específico**:
   - Espera: Campo do turno com valor `0` ou `null`

---

## 📝 Notas Adicionais

### Performance

- Considerar criar índice em `evaluations.evaluation_date`
- Considerar criar índice em `evaluations.year` e `evaluations.quarter`
- Para grandes volumes, avaliar uso de view materializada

### Caching

- Dados podem ser cacheados por 1 hora (60 minutos)
- Invalidar cache quando nova avaliação for criada/atualizada

### Permissões

- Endpoint deve ser acessível apenas para usuários autenticados
- Role `master` tem acesso completo
- Outras roles podem ter acesso limitado (ex: apenas seu próprio time)

### Escalas de Pontuação

- Se backend usar escala diferente de 0-100, normalizar antes de retornar
- Exemplo: escala 1-5 → multiplicar por 20 para converter para 0-100

---

## 📚 Ver Também

- [Documentação de Analytics](./ANALYTICS_API.md)
- [Documentação de Dashboards](./DASHBOARDS_BACKEND_SPEC.md)
- [Tipos TypeScript](../core/types/analytics.types.ts)

---

## ✅ Checklist de Implementação

### Backend
- [x] Criar controller `AnalyticsController.getShiftPerformance()`
- [x] Implementar lógica de agregação por mês e turno
- [x] Adicionar validação de parâmetros (year, quarter)
- [ ] Criar testes unitários
- [ ] Criar testes de integração
- [x] Documentar no Swagger/OpenAPI (via decorators)
- [ ] Validar performance com dados reais

### Frontend
- [x] Criar rota proxy `/api/analytics/shift-performance`
- [x] Adicionar método no `analyticsService`
- [x] Atualizar componente Home para consumir API
- [x] Implementar fallback para dados mockados
- [x] Adicionar tipos TypeScript
- [x] Testar integração quando backend estiver pronto

### Arquivos Implementados
- ✅ `src/modules/analytics/dto/shift-performance.dto.ts`
- ✅ `src/modules/analytics/analytics.service.ts` → método `getShiftPerformance()`
- ✅ `src/modules/analytics/analytics.controller.ts` → endpoint `GET /analytics/shift-performance`
- ✅ `docs/integration/ANALYTICS_INTEGRATION.md` → documentação atualizada

---

**Última atualização**: 2 de abril de 2026  
**Autor**: GitHub Copilot  
**Status**: ✅ **Implementado e pronto para uso**
