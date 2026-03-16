# 👥 Users API - Integração de Gestão de Usuários

## Base URL
```
/api/v1/users
```

## 🔒 Autenticação Necessária

Todos os endpoints requerem autenticação JWT via header `Authorization: Bearer {token}`.

---

## 📌 Endpoints

### 1. Criar Usuário

**Endpoint:** `POST /users`

**Permissão:** Master ou Supervisor

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:**
```json
{
  "email": "novo.usuario@exemplo.com",
  "password": "SenhaSegura123!",
  "name": "Nome do Usuário",
  "role": "supervisor",
  "workday": "diurno"
}
```

**Campos:**
- `email` (obrigatório): string, formato de email, único no sistema
- `password` (obrigatório): string, mínimo 6 caracteres
- `name` (obrigatório): string, mínimo 3 caracteres
- `role` (obrigatório): enum: `"master"` | `"supervisor"`
- `workday` (opcional): enum: `"diurno"` | `"noturno"`

**Resposta de Sucesso (201):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "novo.usuario@exemplo.com",
  "name": "Nome do Usuário",
  "role": "supervisor",
  "workday": "diurno",
  "isActive": true,
  "lastLogin": null,
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-03-15T10:00:00.000Z"
}
```

**Erros:**
- **400** - Validação falhou
- **409** - Email já cadastrado
- **401** - Não autenticado

**Exemplo:**
```javascript
const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};
```

---

### 2. Listar Usuários (Paginado)

**Endpoint:** `GET /users`

**Query Parameters:**
- `page` (opcional): número, padrão 1
- `limit` (opcional): número, padrão 20
- `search` (opcional): string, busca por nome ou email
- `role` (opcional): enum: `"master"` | `"supervisor"`
- `isActive` (opcional): boolean

**URL Exemplo:**
```
GET /users?page=1&limit=10&search=admin&role=master&isActive=true
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
    "email": "admin@skillfix.com",
    "name": "Administrador",
    "role": "master",
    "workday": null,
    "isActive": true,
    "lastLogin": "2026-03-15T19:52:00.498Z",
    "createdAt": "2026-03-15T23:51:47.320Z",
    "updatedAt": "2026-03-15T23:52:00.508Z"
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "supervisor@skillfix.com",
    "name": "Supervisor Teste",
    "role": "supervisor",
    "workday": "diurno",
    "isActive": true,
    "lastLogin": null,
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:00:00.000Z"
  }
]
```

**Exemplo:**
```javascript
const getUsers = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

  const response = await api.get(`/users?${params}`);
  return response.data;
};
```

---

### 3. Buscar Usuário por ID

**Endpoint:** `GET /users/:id`

**Resposta de Sucesso (200):**
```json
{
  "id": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
  "email": "admin@skillfix.com",
  "name": "Administrador",
  "role": "master",
  "workday": null,
  "isActive": true,
  "lastLogin": "2026-03-15T19:52:00.498Z",
  "createdAt": "2026-03-15T23:51:47.320Z",
  "updatedAt": "2026-03-15T23:52:00.508Z"
}
```

**Erros:**
- **404** - Usuário não encontrado

**Exemplo:**
```javascript
const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

---

### 4. Atualizar Usuário

**Endpoint:** `PATCH /users/:id`

**Body (todos campos opcionais):**
```json
{
  "email": "novo.email@exemplo.com",
  "name": "Novo Nome",
  "role": "master",
  "workday": "noturno"
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "novo.email@exemplo.com",
  "name": "Novo Nome",
  "role": "master",
  "workday": "noturno",
  "isActive": true,
  "lastLogin": null,
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-03-15T10:30:00.000Z"
}
```

**Erros:**
- **404** - Usuário não encontrado
- **409** - Email já cadastrado por outro usuário

**Exemplo:**
```javascript
const updateUser = async (userId, updates) => {
  const response = await api.patch(`/users/${userId}`, updates);
  return response.data;
};
```

---

### 5. Alternar Status do Usuário

Ativa/desativa um usuário.

**Endpoint:** `PATCH /users/:id/toggle-status`

**Resposta de Sucesso (200):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "role": "supervisor",
  "workday": "diurno",
  "isActive": false,
  "lastLogin": null,
  "createdAt": "2026-03-15T10:00:00.000Z",
  "updatedAt": "2026-03-15T10:35:00.000Z"
}
```

**Exemplo:**
```javascript
const toggleUserStatus = async (userId) => {
  const response = await api.patch(`/users/${userId}/toggle-status`);
  return response.data;
};
```

---

### 6. Deletar Usuário

Remove permanentemente um usuário.

**Endpoint:** `DELETE /users/:id`

**Resposta de Sucesso (200):**
```json
{
  "message": "Usuário deletado com sucesso"
}
```

**Erros:**
- **404** - Usuário não encontrado

**Exemplo:**
```javascript
const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};
```

---

### 7. Alterar Senha

Permite ao próprio usuário alterar sua senha.

**Endpoint:** `PATCH /users/:id/change-password`

**Body:**
```json
{
  "currentPassword": "SenhaAtual123",
  "newPassword": "NovaSenha456!"
}
```

**Campos:**
- `currentPassword` (obrigatório): senha atual do usuário
- `newPassword` (obrigatório): nova senha, mínimo 6 caracteres

**Resposta de Sucesso (200):**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Erros:**
- **400** - Senha atual incorreta
- **404** - Usuário não encontrado

**Exemplo:**
```javascript
const changePassword = async (userId, currentPassword, newPassword) => {
  const response = await api.patch(`/users/${userId}/change-password`, {
    currentPassword,
    newPassword,
  });
  return response.data;
};
```

---

### 8. Resetar Senha (Admin)

Permite admin resetar senha de qualquer usuário.

**Endpoint:** `POST /users/:id/reset-password`

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Senha resetada com sucesso",
  "temporaryPassword": "tempPass123"
}
```

**Nota:** A senha temporária deve ser enviada ao usuário de forma segura (email, SMS, etc).

**Exemplo:**
```javascript
const resetUserPassword = async (userId, email) => {
  const response = await api.post(`/users/${userId}/reset-password`, { email });
  
  // Enviar senha temporária para o usuário
  alert(`Senha temporária: ${response.data.temporaryPassword}`);
  
  return response.data;
};
```

---

## 📘 Exemplo Completo de Integração

```javascript
// src/services/userService.js
import api from './api';

export const userService = {
  // Criar usuário
  async create(userData) {
    const { data } = await api.post('/users', userData);
    return data;
  },

  // Listar com filtros
  async list(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) {
      params.append('isActive', filters.isActive);
    }

    const { data } = await api.get(`/users?${params}`);
    return data;
  },

  // Buscar por ID
  async getById(userId) {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  // Atualizar
  async update(userId, updates) {
    const { data } = await api.patch(`/users/${userId}`, updates);
    return data;
  },

  // Alternar status
  async toggleStatus(userId) {
    const { data } = await api.patch(`/users/${userId}/toggle-status`);
    return data;
  },

  // Deletar
  async delete(userId) {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  },

  // Alterar senha
  async changePassword(userId, currentPassword, newPassword) {
    const { data } = await api.patch(`/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    return data;
  },

  // Resetar senha (admin)
  async resetPassword(userId, email) {
    const { data } = await api.post(`/users/${userId}/reset-password`, {
      email,
    });
    return data;
  },
};
```

---

## 🧪 Exemplo de Uso em Componente React

```jsx
// src/pages/UsersPage.jsx
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.list(filters);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleStatus(userId);
      loadUsers(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Confirma a exclusão?')) return;

    try {
      await userService.delete(userId);
      loadUsers();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      <h1>Usuários</h1>
      
      {/* Filtros */}
      <input
        type="text"
        placeholder="Buscar..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Lista */}
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Ativo' : 'Inativo'}</td>
              <td>
                <button onClick={() => handleToggleStatus(user.id)}>
                  {user.isActive ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => handleDelete(user.id)}>Deletar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 📝 Notas Importantes

1. **Paginação:** A API não retorna metadados de paginação (total, páginas). É responsabilidade do frontend gerenciar isso.
2. **Senha:** O campo `password` nunca é retornado nas respostas (uso do decorator `@Exclude()`).
3. **Filtros:** Todos os query parameters são opcionais.
4. **Status:** Desativar usuário não o deleta, apenas altera `isActive` para `false`.
5. **Validação:** Email deve ser único no sistema.
