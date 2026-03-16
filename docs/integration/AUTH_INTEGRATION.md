# 🔐 Auth API - Integração de Autenticação

## Base URL
```
/api/v1/auth
```

---

## 📌 Endpoints

### 1. Login

Autentica um usuário e retorna tokens JWT.

**Endpoint:** `POST /auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@skillfix.com",
  "password": "Admin@123"
}
```

**Validações:**
- `email`: obrigatório, formato de email válido
- `password`: obrigatório, mínimo 6 caracteres

**Resposta de Sucesso (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erros Possíveis:**

- **400 Bad Request** - Validação falhou
```json
{
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

- **401 Unauthorized** - Credenciais inválidas
```json
{
  "message": "Credenciais inválidas",
  "statusCode": 401
}
```

**Exemplo (JavaScript/Fetch):**
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login falhou');
  }

  const data = await response.json();
  
  // Salvar tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data;
};
```

**Exemplo (Axios):**
```javascript
import api from './api';

const login = async (email, password) => {
  try {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });
    
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    
    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Email ou senha incorretos');
    }
    throw error;
  }
};
```

---

### 2. Refresh Token

Renova o access token usando o refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validações:**
- `refreshToken`: obrigatório, string

**Resposta de Sucesso (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "c2ac0254-4fb5-463b-aca9-ebc4d5dbe67b",
    "email": "admin@skillfix.com",
    "name": "Administrador",
    "role": "master",
    "workday": null
  }
}
```

**Erros Possíveis:**

- **401 Unauthorized** - Token inválido ou expirado
```json
{
  "message": "Token inválido ou expirado",
  "statusCode": 401
}
```

**Exemplo (JavaScript):**
```javascript
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('Refresh token não encontrado');
  }

  const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Token expirado, redirecionar para login
    localStorage.clear();
    window.location.href = '/login';
    return;
  }

  const data = await response.json();
  
  // Atualizar tokens
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  
  return data;
};
```

---

### 3. Logout

Invalida o refresh token do usuário.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Body:** Nenhum

**Resposta de Sucesso (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Erros Possíveis:**

- **401 Unauthorized** - Token não fornecido ou inválido

**Exemplo (JavaScript):**
```javascript
const logout = async () => {
  const token = localStorage.getItem('accessToken');

  try {
    await fetch('http://localhost:3000/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    // Limpar tokens localmente mesmo se a requisição falhar
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};
```

---

### 4. Obter Perfil do Usuário Atual

Retorna informações do usuário autenticado.

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer {accessToken}
```

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

**Erros Possíveis:**

- **401 Unauthorized** - Token não fornecido ou inválido

**Exemplo (JavaScript):**
```javascript
const getCurrentUser = async () => {
  const token = localStorage.getItem('accessToken');

  const response = await fetch('http://localhost:3000/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar usuário');
  }

  return await response.json();
};
```

---

## 🔑 Gerenciamento de Tokens

### Estrutura Recomendada

```javascript
// src/utils/auth.ts

export const auth = {
  // Salvar tokens após login
  saveTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  // Obter access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Obter refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Limpar tokens
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Decodificar token JWT (sem validação)
  decodeToken: (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  },
};
```

### Interceptor Axios para Auto-Refresh

```javascript
// src/services/api.ts
import axios from 'axios';
import { auth } from '../utils/auth';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = auth.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor para auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se 401 e não é retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = auth.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Tentar renovar token
        const { data } = await axios.post(
          'http://localhost:3000/api/v1/auth/refresh',
          { refreshToken }
        );

        // Salvar novos tokens
        auth.saveTokens(data.accessToken, data.refreshToken);

        // Retentar requisição original com novo token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh falhou, fazer logout
        auth.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 🛡️ Proteção de Rotas (React Router)

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { auth } from '../utils/auth';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const token = auth.getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificar role se necessário
  if (requiredRole) {
    const decoded = auth.decodeToken(token);
    if (decoded?.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

// Uso
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="master">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

---

## 📝 Notas Importantes

1. **Segurança:** Nunca armazene tokens em cookies sem `httpOnly` ou em localStorage se seu app for vulnerável a XSS
2. **Expiração:** Access token expira em 7 dias, refresh token em 30 dias
3. **Renovação Automática:** Implemente auto-refresh para melhor UX
4. **Logout:** Sempre limpe os tokens do lado do cliente ao fazer logout
5. **HTTPS:** Em produção, sempre use HTTPS para proteger os tokens em trânsito

---

## 🎯 Fluxo Completo de Autenticação

```
1. Usuário faz login → POST /auth/login
2. Backend valida credenciais e retorna tokens
3. Frontend salva tokens (localStorage/sessionStorage)
4. Para cada requisição, adicionar header Authorization: Bearer {token}
5. Se receber 401:
   a. Tentar renovar com refresh token → POST /auth/refresh
   b. Se renovação falhar, redirecionar para login
6. Ao fazer logout → POST /auth/logout + limpar tokens locais
```
