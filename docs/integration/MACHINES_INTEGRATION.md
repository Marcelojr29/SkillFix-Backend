# 🏭 Machines API - Integração de Gestão de Máquinas

## Base URL
```
/api/v1/machines
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Máquina

**POST /machines**

**Body:**
```json
{
  "code": "MAQ-001",
  "name": "Matriz de Injeção 001",
  "description": "Matriz para produção de peças plásticas",
  "teamId": "uuid-do-time",
  "manufacturer": "Fabricante XYZ",
  "model": "Modelo ABC-2023",
  "installationDate": "2023-01-15"
}
```

**Campos:**
- `code` (obrigatório): código único no formato `MAQ-XXX` (3 dígitos)
- `name` (obrigatório): nome da máquina
- `description` (obrigatório): descrição
- `teamId` (obrigatório): UUID do time responsável
- `manufacturer` (opcional): fabricante
- `model` (opcional): modelo
- `installationDate` (opcional): data de instalação (formato: YYYY-MM-DD)

**Validação de Código:**
- Formato: `MAQ-XXX` onde XXX são 3 dígitos
- Exemplos válidos: `MAQ-001`, `MAQ-999`
- Exemplos inválidos: `MTX-001`, `MAQ-01`, `MAQ-1234`

**Resposta (201):**
```json
{
  "id": "4d2cb338-3a7b-4bfb-9602-8e5f2c95c069",
  "name": "Matriz de Injeção 001",
  "code": "MAQ-001",
  "description": "Matriz para produção de peças plásticas",
  "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "manufacturer": "Fabricante XYZ",
  "model": "Modelo ABC-2023",
  "installationDate": "2023-01-15",
  "status": true,
  "createdAt": "2026-03-15T23:52:52.526Z",
  "updatedAt": "2026-03-15T23:52:52.526Z"
}
```

**Erros Comuns:**
- **400** - Código inválido:
```json
{
  "message": ["Código deve seguir o formato MAQ-XXX"],
  "error": "Bad Request",
  "statusCode": 400
}
```

- **409** - Código duplicado:
```json
{
  "message": "Código já cadastrado",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### 2. Listar Máquinas

**GET /machines?search=matriz&teamId=uuid&status=true**

**Query Params:**
- `search`: busca por nome, código ou descrição
- `teamId`: filtrar por time
- `status`: boolean

**Resposta (200):**
```json
[
  {
    "id": "4d2cb338-3a7b-4bfb-9602-8e5f2c95c069",
    "name": "Matriz de Injeção 001",
    "code": "MAQ-001",
    "description": "Matriz para produção de peças plásticas",
    "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
    "manufacturer": "Fabricante XYZ",
    "model": "Modelo ABC-2023",
    "installationDate": "2023-01-15",
    "status": true,
    "createdAt": "2026-03-15T23:52:52.526Z",
    "updatedAt": "2026-03-15T23:52:52.526Z",
    "team": {
      "id": "bdb03293-da37-4998-a81d-b5f0344816ff",
      "name": "Time de Produção",
      "department": "Produção"
    },
    "skills": []
  }
]
```

---

### 3. Buscar por ID

**GET /machines/:id**

Retorna máquina com relações `team` e `skills` populadas.

---

### 4. Atualizar

**PATCH /machines/:id**

**Body (todos opcionais):**
```json
{
  "name": "Novo Nome",
  "code": "MAQ-002",
  "description": "Nova descrição",
  "teamId": "novo-uuid",
  "manufacturer": "Novo Fabricante",
  "model": "Novo Modelo",
  "installationDate": "2024-01-01"
}
```

---

### 5. Alternar Status

**PATCH /machines/:id/toggle-status**

Ativa/desativa a máquina.

---

### 6. Deletar

**DELETE /machines/:id**

---

## 📘 Service

```javascript
export const machineService = {
  async create(machineData) {
    const { data } = await api.post('/machines', machineData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/machines?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/machines/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/machines/${id}`, updates);
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.patch(`/machines/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/machines/${id}`);
    return data;
  },

  // Helper para validar código
  validateCode(code) {
    const pattern = /^MAQ-\d{3}$/;
    return pattern.test(code);
  },
};
```

---

## 🧪 Exemplo de Uso

```javascript
// Criar máquina com validação
const createMachine = async (machineData) => {
  // Validar código antes de enviar
  if (!machineService.validateCode(machineData.code)) {
    throw new Error('Código inválido. Use o formato MAQ-XXX');
  }

  try {
    const machine = await machineService.create(machineData);
    console.log('Máquina criada:', machine);
    return machine;
  } catch (error) {
    if (error.response?.status === 409) {
      throw new Error('Código já existe');
    }
    throw error;
  }
};
```

---

## 📝 Notas

1. **Código Único:** O código deve ser único no sistema
2. **Formato Rígido:** Validação estrita do formato `MAQ-XXX`
3. **Relações:** Máquina sempre vinculada a um time
4. **Skills:** Uma máquina pode ter múltiplas skills associadas
