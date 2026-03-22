# API de Fotos de Técnicos - Guia de Integração Frontend

## 📋 Visão Geral

Este documento descreve como integrar o sistema de fotos de técnicos no frontend. O sistema permite:
- ✅ Cadastrar técnico com foto em um único request
- ✅ Cadastrar técnico sem foto e adicionar depois
- ✅ Atualizar/substituir foto de técnico existente
- ✅ Visualizar fotos nas listagens e detalhes
- ✅ Servir fotos como arquivos estáticos

---

## 🆕 Novo Endpoint: Cadastrar Técnico com Foto

### **POST** `/api/v1/tecnicos/with-photo`

Criar um novo técnico enviando todos os dados + foto em um único request multipart/form-data.

#### Headers
```http
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Permissões
- Requer role: `MASTER`

#### Corpo da Requisição (FormData)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `photo` | File | ❌ Não | Arquivo de imagem (JPG, PNG, etc) | - |
| `name` | String | ✅ Sim | Nome completo do técnico | "João Silva" |
| `workday` | String | ✅ Sim | Matrícula do colaborador | "WDC00001" |
| `cargo` | String | ✅ Sim | Cargo/função | "Técnico de Manutenção Elétrica" |
| `senioridade` | Enum | ✅ Sim | Nível de senioridade | "Pleno" |
| `area` | Enum | ✅ Sim | Área de atuação | "Manutenção" |
| `shift` | Enum | ✅ Sim | Turno de trabalho | "1T" |
| `department` | String | ✅ Sim | Departamento | "Manutenção Elétrica" |
| `gender` | Enum | ✅ Sim | Gênero | "M" |
| `joinDate` | Date | ✅ Sim | Data de admissão (YYYY-MM-DD) | "2020-01-15" |
| `teamId` | UUID | ❌ Não | ID do time | "uuid-do-time" |
| `subtimeId` | UUID | ❌ Não | ID do sub-time | "uuid-do-subtime" |
| `email` | Email | Condicional* | Email (obrigatório se Supervisor) | "supervisor@empresa.com" |
| `password` | String | Condicional* | Senha (obrigatório se Supervisor) | "Senha@123" |
| `skills` | JSON String | ❌ Não | Array de skills em formato JSON | Ver exemplo abaixo |

**Condicional*: Obrigatório apenas quando `senioridade = "Supervisor"`

#### Valores dos Enums

**Senioridade:**
- `Auxiliar`
- `Junior`
- `Pleno`
- `Sênior`
- `Especialista`
- `Coordenador`
- `Supervisor`

**Área:**
- `Produção`
- `Manutenção`
- `Qualidade`
- `Engenharia`
- `Logística`
- `Administrativa`
- `Outro`

**Turno (Shift):**
- `1T` - Primeiro Turno
- `2T` - Segundo Turno
- `3T` - Terceiro Turno
- `ADM` - Administrativo

**Gênero (Gender):**
- `M` - Masculino
- `F` - Feminino
- `O` - Outro

#### Formato do campo `skills` (JSON String)

```json
[
  {
    "skillId": "uuid-da-skill",
    "score": 85.5,
    "notes": "Experiência em manutenção preventiva"
  },
  {
    "skillId": "outro-uuid",
    "score": 92.0,
    "notes": "Especialista em motores elétricos"
  }
]
```

### 💻 Exemplo de Código - JavaScript/TypeScript

```typescript
async function criarTecnicoComFoto(formData: FormData) {
  const response = await fetch('http://localhost:3000/api/v1/tecnicos/with-photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // NÃO definir Content-Type - o browser define automaticamente para multipart/form-data
    },
    body: formData
  });

  return await response.json();
}

// Exemplo de uso
const formData = new FormData();

// Adicionar arquivo de foto (se selecionado)
if (photoFile) {
  formData.append('photo', photoFile);
}

// Adicionar campos obrigatórios
formData.append('name', 'João Silva');
formData.append('workday', 'WDC00001');
formData.append('cargo', 'Técnico de Manutenção Elétrica');
formData.append('senioridade', 'Pleno');
formData.append('area', 'Manutenção');
formData.append('shift', '1T');
formData.append('department', 'Manutenção Elétrica');
formData.append('gender', 'M');
formData.append('joinDate', '2020-01-15');

// Campos opcionais
formData.append('teamId', 'uuid-do-time');
formData.append('subtimeId', 'uuid-do-subtime');

// Skills (converter array para JSON string)
const skills = [
  { skillId: 'uuid-skill-1', score: 85.5, notes: 'Experiência em manutenção' }
];
formData.append('skills', JSON.stringify(skills));

// Enviar
const tecnico = await criarTecnicoComFoto(formData);
console.log('Técnico criado:', tecnico);
```

### 📦 Exemplo com React + Axios

```tsx
import axios from 'axios';

const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  const formData = new FormData();
  
  // Arquivo de foto
  if (selectedPhoto) {
    formData.append('photo', selectedPhoto);
  }
  
  // Dados do formulário
  formData.append('name', formState.name);
  formData.append('workday', formState.workday);
  formData.append('cargo', formState.cargo);
  formData.append('senioridade', formState.senioridade);
  formData.append('area', formState.area);
  formData.append('shift', formState.shift);
  formData.append('department', formState.department);
  formData.append('gender', formState.gender);
  formData.append('joinDate', formState.joinDate);
  
  if (formState.teamId) {
    formData.append('teamId', formState.teamId);
  }
  
  if (formState.subtimeId) {
    formData.append('subtimeId', formState.subtimeId);
  }
  
  // Skills
  if (skills.length > 0) {
    formData.append('skills', JSON.stringify(skills));
  }
  
  try {
    const response = await axios.post(
      'http://localhost:3000/api/v1/tecnicos/with-photo',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Axios define automaticamente o Content-Type correto
        }
      }
    );
    
    console.log('Técnico criado com sucesso:', response.data);
  } catch (error) {
    console.error('Erro ao criar técnico:', error);
  }
};
```

#### Resposta de Sucesso (201 Created)

```json
{
  "id": "uuid-do-tecnico",
  "name": "João Silva",
  "workday": "WDC00001",
  "cargo": "Técnico de Manutenção Elétrica",
  "senioridade": "Pleno",
  "area": "Manutenção",
  "shift": "1T",
  "department": "Manutenção Elétrica",
  "gender": "M",
  "photo": "uploads/photos/uuid-do-tecnico.jpg",
  "joinDate": "2020-01-15",
  "email": null,
  "hasUserAccount": false,
  "status": true,
  "teamId": "uuid-do-time",
  "subtimeId": "uuid-do-subtime",
  "createdAt": "2026-03-22T10:30:00.000Z",
  "updatedAt": "2026-03-22T10:30:00.000Z",
  "team": { ... },
  "subtime": { ... },
  "skills": [ ... ],
  "quarterlyNotes": [],
  "evaluations": []
}
```

#### Respostas de Erro

**400 Bad Request - Campo obrigatório ausente**
```json
{
  "statusCode": 400,
  "message": "Campo obrigatório ausente: name",
  "error": "Bad Request"
}
```

**400 Bad Request - Email já em uso**
```json
{
  "statusCode": 400,
  "message": "Este e-mail já está em uso",
  "error": "Bad Request"
}
```

---

## 📸 Endpoint Alternativo: Upload de Foto Separado

Use este endpoint se preferir criar o técnico primeiro e adicionar a foto depois.

### **POST** `/api/v1/tecnicos/:id/photo`

Fazer upload ou substituir a foto de um técnico existente.

#### Headers
```http
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

#### Parâmetros
- `id` (UUID) - ID do técnico

#### Corpo da Requisição
```
file: [arquivo de imagem]
```

#### Exemplo JavaScript

```typescript
async function uploadFotoTecnico(tecnicoId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`http://localhost:3000/api/v1/tecnicos/${tecnicoId}/photo`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
}
```

#### Resposta de Sucesso

```json
{
  "photoUrl": "uploads/photos/uuid-do-tecnico.jpg"
}
```

---

## 👀 Visualizar Fotos dos Técnicos

### Acessar URL da Foto

Quando você busca um técnico (GET `/api/v1/tecnicos/:id` ou GET `/api/v1/tecnicos`), o campo `photo` contém o caminho relativo da foto:

```json
{
  "id": "uuid",
  "name": "João Silva",
  "photo": "uploads/photos/uuid-do-tecnico.jpg",
  ...
}
```

### Construir URL Completa da Imagem

Para exibir a imagem no frontend, construa a URL completa:

```typescript
const baseURL = 'http://localhost:3000'; // URL do backend

function getFotoURL(photo: string | null): string {
  if (!photo) {
    return '/assets/avatar-placeholder.png'; // Imagem padrão
  }
  return `${baseURL}/${photo}`;
}

// Uso no componente
const tecnico = {
  name: 'João Silva',
  photo: 'uploads/photos/uuid-do-tecnico.jpg'
};

const photoURL = getFotoURL(tecnico.photo);
// Retorna: "http://localhost:3000/uploads/photos/uuid-do-tecnico.jpg"
```

### Exemplo React

```tsx
interface Tecnico {
  id: string;
  name: string;
  photo?: string;
  // ... outros campos
}

const TecnicoCard: React.FC<{ tecnico: Tecnico }> = ({ tecnico }) => {
  const baseURL = 'http://localhost:3000';
  const photoURL = tecnico.photo 
    ? `${baseURL}/${tecnico.photo}` 
    : '/assets/avatar-default.png';
  
  return (
    <div className="card">
      <img 
        src={photoURL} 
        alt={tecnico.name}
        onError={(e) => {
          // Fallback se imagem não carregar
          e.currentTarget.src = '/assets/avatar-default.png';
        }}
      />
      <h3>{tecnico.name}</h3>
    </div>
  );
};
```

### Exemplo Angular

```typescript
// tecnico.component.ts
export class TecnicoComponent {
  baseURL = 'http://localhost:3000';
  
  getFotoURL(photo: string | null): string {
    return photo ? `${this.baseURL}/${photo}` : '/assets/avatar-default.png';
  }
}
```

```html
<!-- tecnico.component.html -->
<img 
  [src]="getFotoURL(tecnico.photo)" 
  [alt]="tecnico.name"
  (error)="$event.target.src='/assets/avatar-default.png'"
/>
```

---

## 📋 Listagem de Técnicos com Fotos

### **GET** `/api/v1/tecnicos`

A listagem de técnicos já retorna o campo `photo` em cada técnico.

#### Resposta

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "João Silva",
      "photo": "uploads/photos/uuid-1.jpg",
      "workday": "WDC00001",
      ...
    },
    {
      "id": "uuid-2",
      "name": "Maria Santos",
      "photo": null,
      "workday": "WDC00002",
      ...
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Exemplo de Renderização em Lista

```tsx
const TecnicosList: React.FC = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const baseURL = 'http://localhost:3000';
  
  useEffect(() => {
    // Buscar técnicos
    fetch('http://localhost:3000/api/v1/tecnicos?limit=100', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTecnicos(data.data));
  }, []);
  
  return (
    <div className="tecnicos-grid">
      {tecnicos.map(tecnico => (
        <div key={tecnico.id} className="tecnico-card">
          <img 
            src={tecnico.photo ? `${baseURL}/${tecnico.photo}` : '/avatar-default.png'}
            alt={tecnico.name}
            className="avatar"
          />
          <h4>{tecnico.name}</h4>
          <p>{tecnico.cargo}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## 📝 Detalhes do Técnico com Foto

### **GET** `/api/v1/tecnicos/:id`

Buscar detalhes completos de um técnico, incluindo foto.

#### Resposta

```json
{
  "id": "uuid-do-tecnico",
  "name": "João Silva",
  "photo": "uploads/photos/uuid-do-tecnico.jpg",
  "workday": "WDC00001",
  "cargo": "Técnico de Manutenção Elétrica",
  "senioridade": "Pleno",
  "area": "Manutenção",
  "shift": "1T",
  "department": "Manutenção Elétrica",
  "gender": "M",
  "joinDate": "2020-01-15",
  "email": null,
  "hasUserAccount": false,
  "status": true,
  "team": { ... },
  "subtime": { ... },
  "skills": [ ... ],
  "quarterlyNotes": [ ... ],
  "evaluations": [ ... ]
}
```

---

## 🔧 Boas Práticas

### 1. Validação de Arquivos no Frontend

```typescript
function validarFoto(file: File): string | null {
  // Verificar tipo de arquivo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) {
    return 'Apenas arquivos JPG, PNG ou WEBP são permitidos';
  }
  
  // Verificar tamanho (exemplo: máximo 5MB)
  const tamanhoMaximo = 5 * 1024 * 1024; // 5MB
  if (file.size > tamanhoMaximo) {
    return 'A foto deve ter no máximo 5MB';
  }
  
  return null; // Sem erros
}

// Uso
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  const erro = validarFoto(file);
  if (erro) {
    alert(erro);
    return;
  }
  
  setSelectedPhoto(file);
};
```

### 2. Preview de Imagem Antes do Upload

```typescript
const [photoPreview, setPhotoPreview] = useState<string | null>(null);

const handlePhotoSelect = (file: File) => {
  // Criar preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPhotoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
  
  setSelectedPhoto(file);
};

// No JSX
{photoPreview && (
  <img src={photoPreview} alt="Preview" className="photo-preview" />
)}
```

### 3. Loading State Durante Upload

```typescript
const [uploading, setUploading] = useState(false);

const handleUpload = async (formData: FormData) => {
  setUploading(true);
  try {
    const response = await fetch('...', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    console.log('Sucesso!', data);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    setUploading(false);
  }
};
```

### 4. Tratamento de Erro de Carregamento de Imagem

```tsx
<img 
  src={photoURL}
  alt={tecnico.name}
  onError={(e) => {
    // Tentar carregar novamente (uma vez)
    if (!e.currentTarget.dataset.retried) {
      e.currentTarget.dataset.retried = 'true';
      e.currentTarget.src = photoURL;
    } else {
      // Fallback para imagem padrão
      e.currentTarget.src = '/assets/avatar-default.png';
    }
  }}
/>
```

---

## 🌐 Configuração de CORS

O backend já está configurado para aceitar requisições de:
- `http://localhost:4200` (Angular)
- `http://localhost:3001` (React/Next.js)

Se seu frontend estiver em outra porta, é necessário adicionar no arquivo `src/main.ts`:

```typescript
app.enableCors({
  origin: ['http://localhost:4200', 'http://localhost:3001', 'http://localhost:SUA_PORTA'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## 📌 Resumo dos Endpoints

| Método | Endpoint | Uso |
|--------|----------|-----|
| **POST** | `/api/v1/tecnicos/with-photo` | Criar técnico com foto em um único request |
| **POST** | `/api/v1/tecnicos` | Criar técnico sem foto (JSON) |
| **POST** | `/api/v1/tecnicos/:id/photo` | Adicionar/atualizar foto de técnico existente |
| **GET** | `/api/v1/tecnicos` | Listar técnicos (com fotos) |
| **GET** | `/api/v1/tecnicos/:id` | Buscar detalhes de um técnico (com foto) |
| **GET** | `/uploads/photos/:filename` | Acessar arquivo de foto diretamente |

---

## ❓ Perguntas Frequentes

### 1. Posso criar técnico sem foto?
✅ Sim! O campo `photo` é opcional. Se não enviar, o técnico será criado sem foto e você pode adicionar depois via `POST /tecnicos/:id/photo`.

### 2. Qual formato de imagem é suportado?
✅ Todos os formatos comuns: JPG, JPEG, PNG, WEBP, GIF, etc.

### 3. Há limite de tamanho para a foto?
⚠️ Atualmente não há validação no backend. Recomenda-se implementar validação no frontend (sugestão: máximo 5MB).

### 4. A foto é redimensionada automaticamente?
❌ Não. O backend salva a imagem no tamanho original. Recomenda-se fazer resize no frontend antes do upload.

### 5. Como atualizar a foto de um técnico?
✅ Basta fazer novo POST para `/api/v1/tecnicos/:id/photo`. O arquivo anterior será substituído.

### 6. O que acontece se eu deletar um técnico?
⚠️ Atualmente é soft delete (status=false), então a foto permanece. Para implementar remoção física da foto, será necessário adicionar lógica no método `remove()` do service.

---

## 🔒 Segurança

- ✅ Todos os endpoints de criação/upload requerem autenticação JWT
- ✅ Apenas usuários com role `MASTER` podem criar técnicos e fazer upload de fotos
- ✅ Arquivos são salvos com UUID do técnico como nome para evitar conflitos
- ✅ CORS configurado para permitir apenas origens específicas
- ⚠️ **Recomendação:** Adicionar validação de tipo MIME e tamanho de arquivo no backend

---

## 📞 Suporte

Para dúvidas ou problemas na integração, consulte:
- Swagger: `http://localhost:3000/api/docs`
- Documentação completa da API de técnicos: `/docs/TECNICOS_API.md`

---

**Última atualização:** 22 de março de 2026
