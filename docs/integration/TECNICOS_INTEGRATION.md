# 👷 Tecnicos API - Integração de Gestão de Técnicos

## Base URL
```
/api/v1/tecnicos
```

## 🔒 Autenticação

Requer JWT: `Authorization: Bearer {token}`

---

## 📌 Endpoints

### 1. Criar Técnico

**POST /tecnicos**

**Body:**
```json
{
  "name": "João Silva",
  "employeeNumber": "EMP-12345",
  "position": "Operador de Produção",
  "teamId": "uuid-do-time",
  "subtimeId": "uuid-do-subtime",
  "email": "joao.silva@empresa.com",
  "phone": "(11) 98765-4321",
  "admissionDate": "2022-01-15",
  "birthDate": "1990-05-20",
  "notes": "Experiência prévia em injetoras"
}
```

**Campos:**
- `name` (obrigatório): nome completo
- `employeeNumber` (obrigatório): número único de matrícula
- `position` (obrigatório): cargo
- `teamId` (obrigatório): UUID do time
- `subtimeId` (obrigatório): UUID do subtime
- `email` (opcional): e-mail
- `phone` (opcional): telefone
- `admissionDate` (obrigatório): data de admissão (formato: YYYY-MM-DD)
- `birthDate` (opcional): data de nascimento (formato: YYYY-MM-DD)
- `notes` (opcional): observações

**Resposta (201):**
```json
{
  "id": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
  "name": "João Silva",
  "employeeNumber": "EMP-12345",
  "position": "Operador de Produção",
  "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
  "subtimeId": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
  "email": "joao.silva@empresa.com",
  "phone": "(11) 98765-4321",
  "photoUrl": null,
  "admissionDate": "2022-01-15",
  "birthDate": "1990-05-20",
  "notes": "Experiência prévia em injetoras",
  "status": true,
  "createdAt": "2026-03-16T00:00:00.000Z",
  "updatedAt": "2026-03-16T00:00:00.000Z"
}
```

**Erros:**
- **409** - Matrícula duplicada:
```json
{
  "message": "Matrícula já cadastrada",
  "error": "Conflict",
  "statusCode": 409
}
```

---

### 2. Listar Técnicos

**GET /tecnicos?search=joão&teamId=uuid&subtimeId=uuid&status=true**

**Query Params:**
- `search`: busca por nome, matrícula ou cargo
- `teamId`: filtrar por time
- `subtimeId`: filtrar por subtime
- `status`: boolean

**Resposta (200):**
```json
[
  {
    "id": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
    "name": "João Silva",
    "employeeNumber": "EMP-12345",
    "position": "Operador de Produção",
    "teamId": "bdb03293-da37-4998-a81d-b5f0344816ff",
    "subtimeId": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
    "email": "joao.silva@empresa.com",
    "phone": "(11) 98765-4321",
    "photoUrl": "https://storage.example.com/photos/emp-12345.jpg",
    "admissionDate": "2022-01-15",
    "birthDate": "1990-05-20",
    "notes": "Experiência prévia em injetoras",
    "status": true,
    "createdAt": "2026-03-16T00:00:00.000Z",
    "updatedAt": "2026-03-16T00:00:00.000Z",
    "team": {
      "id": "bdb03293-da37-4998-a81d-b5f0344816ff",
      "name": "Time de Produção"
    },
    "subtime": {
      "id": "028a97e8-9937-4a6d-8c82-5e3c59f2e3c6",
      "name": "Subtime Injeção"
    },
    "tecnicoSkills": []
  }
]
```

---

### 3. Buscar por ID

**GET /tecnicos/:id**

Retorna técnico com relações `team`, `subtime` e `tecnicoSkills` populadas.

---

### 4. Atualizar

**PATCH /tecnicos/:id**

**Body (todos opcionais):**
```json
{
  "name": "João Silva Santos",
  "position": "Operador Sênior",
  "email": "joao.santos@empresa.com",
  "phone": "(11) 99999-8888",
  "notes": "Promovido a sênior"
}
```

---

### 5. Upload de Foto

**POST /tecnicos/:id/upload-photo**

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**Body (FormData):**
```javascript
const formData = new FormData();
formData.append('photo', file); // Campo "photo"
```

**Resposta (200):**
```json
{
  "id": "e1f2g3h4-5678-90ab-cdef-1234567890cd",
  "name": "João Silva",
  "photoUrl": "https://storage.example.com/photos/emp-12345-1234567890.jpg",
  ...
}
```

**Validações:**
- Tamanho máximo: 5MB
- Formatos aceitos: jpg, jpeg, png, webp

**Erros:**
- **400** - Arquivo muito grande:
```json
{
  "message": "Arquivo muito grande. Máximo: 5MB",
  "error": "Bad Request",
  "statusCode": 400
}
```

- **400** - Formato inválido:
```json
{
  "message": "Formato inválido. Use: jpg, jpeg, png, webp",
  "error": "Bad Request",
  "statusCode": 400
}
```

---

### 6. Alternar Status

**PATCH /tecnicos/:id/toggle-status**

---

### 7. Deletar

**DELETE /tecnicos/:id**

---

## 📘 Service

```javascript
export const tecnicoService = {
  async create(tecnicoData) {
    const { data } = await api.post('/tecnicos', tecnicoData);
    return data;
  },

  async list(filters = {}) {
    const params = new URLSearchParams(filters);
    const { data } = await api.get(`/tecnicos?${params}`);
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/tecnicos/${id}`);
    return data;
  },

  async update(id, updates) {
    const { data } = await api.patch(`/tecnicos/${id}`, updates);
    return data;
  },

  async uploadPhoto(id, photoFile) {
    const formData = new FormData();
    formData.append('photo', photoFile);

    const { data } = await api.post(`/tecnicos/${id}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  async toggleStatus(id) {
    const { data } = await api.patch(`/tecnicos/${id}/toggle-status`);
    return data;
  },

  async delete(id) {
    const { data } = await api.delete(`/tecnicos/${id}`);
    return data;
  },

  // Helper para buscar por time
  async getByTeam(teamId) {
    return this.list({ teamId });
  },

  // Helper para buscar por subtime
  async getBySubtime(subtimeId) {
    return this.list({ subtimeId });
  },
};
```

---

## 🧪 Exemplo de Upload de Foto

```jsx
import { useState } from 'react';
import { tecnicoService } from '../services/tecnicoService';

export const TecnicoPhotoUpload = ({ tecnicoId, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Formato inválido. Use: JPG, PNG ou WEBP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const updatedTecnico = await tecnicoService.uploadPhoto(tecnicoId, file);
      
      console.log('Foto atualizada:', updatedTecnico.photoUrl);
      onSuccess(updatedTecnico);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Enviando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

---

## 📝 Notas

1. **Matrícula Única:** `employeeNumber` deve ser único no sistema
2. **Foto:** Upload em endpoint separado com FormData
3. **Relações:** Técnico sempre vinculado a um time e subtime
4. **TecnicoSkills:** Relacionamento N:N com Skills (ver entidade TecnicoSkill)
5. **Datas:** Usar formato ISO (YYYY-MM-DD) para `admissionDate` e `birthDate`
