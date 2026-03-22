# 🧪 Script de Teste - Sistema de Fotos de Técnicos

Use estes comandos para testar rapidamente a funcionalidade de fotos.

---

## 1️⃣ Teste Básico com cURL

### Login (obter token)
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "Admin@123"
  }'
```

**Copie o token da resposta e use nos próximos comandos.**

---

### Criar Técnico COM Foto
```bash
# Substitua SEU_TOKEN e /path/to/photo.jpg
curl -X POST "http://localhost:3000/api/v1/tecnicos/with-photo" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "photo=@/path/to/photo.jpg" \
  -F "name=João Silva" \
  -F "workday=WDC00001" \
  -F "cargo=Técnico de Manutenção Elétrica" \
  -F "senioridade=Pleno" \
  -F "area=Manutenção" \
  -F "shift=1T" \
  -F "department=Manutenção Elétrica" \
  -F "gender=M" \
  -F "joinDate=2020-01-15"
```

---

### Criar Técnico SEM Foto
```bash
curl -X POST "http://localhost:3000/api/v1/tecnicos/with-photo" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "name=Maria Santos" \
  -F "workday=WDC00002" \
  -F "cargo=Técnica de Qualidade" \
  -F "senioridade=Junior" \
  -F "area=Qualidade" \
  -F "shift=2T" \
  -F "department=Controle de Qualidade" \
  -F "gender=F" \
  -F "joinDate=2021-03-10"
```

---

### Adicionar Foto a Técnico Existente
```bash
# Substitua TECNICO_ID e SEU_TOKEN
curl -X POST "http://localhost:3000/api/v1/tecnicos/TECNICO_ID/photo" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/path/to/photo.jpg"
```

---

### Listar Todos os Técnicos (com fotos)
```bash
curl -X GET "http://localhost:3000/api/v1/tecnicos?limit=100" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### Buscar Detalhes de um Técnico
```bash
# Substitua TECNICO_ID
curl -X GET "http://localhost:3000/api/v1/tecnicos/TECNICO_ID" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 2️⃣ Teste com JavaScript (Node.js)

Salve como `test-photo-upload.js`:

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api/v1';

async function testPhotoUpload() {
  try {
    // 1. Login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@empresa.com',
      password: 'Admin@123'
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login realizado com sucesso');
    
    // 2. Criar técnico com foto
    console.log('\n2. Criando técnico com foto...');
    const formData = new FormData();
    
    // Adicionar foto (substitua com caminho real)
    formData.append('photo', fs.createReadStream('./photo.jpg'));
    
    // Adicionar campos
    formData.append('name', 'João Silva Teste');
    formData.append('workday', `WD${Date.now()}`);
    formData.append('cargo', 'Técnico de Manutenção');
    formData.append('senioridade', 'Pleno');
    formData.append('area', 'Manutenção');
    formData.append('shift', '1T');
    formData.append('department', 'Manutenção Elétrica');
    formData.append('gender', 'M');
    formData.append('joinDate', '2020-01-15');
    
    const createResponse = await axios.post(
      `${BASE_URL}/tecnicos/with-photo`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      }
    );
    
    const tecnico = createResponse.data;
    console.log('✅ Técnico criado com sucesso');
    console.log(`   ID: ${tecnico.id}`);
    console.log(`   Nome: ${tecnico.name}`);
    console.log(`   Foto: ${tecnico.photo}`);
    
    // 3. Buscar técnico
    console.log('\n3. Buscando técnico criado...');
    const getResponse = await axios.get(
      `${BASE_URL}/tecnicos/${tecnico.id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log('✅ Técnico encontrado');
    console.log(`   Foto URL: http://localhost:3000/${getResponse.data.photo}`);
    
    // 4. Listar todos os técnicos
    console.log('\n4. Listando todos os técnicos...');
    const listResponse = await axios.get(
      `${BASE_URL}/tecnicos?limit=10`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log(`✅ Total de técnicos: ${listResponse.data.meta.total}`);
    console.log(`   Técnicos com foto: ${listResponse.data.data.filter(t => t.photo).length}`);
    
    console.log('\n✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

testPhotoUpload();
```

**Execute:**
```bash
npm install axios form-data
node test-photo-upload.js
```

---

## 3️⃣ Teste com Postman

### Passo 1: Login
- Método: `POST`
- URL: `http://localhost:3000/api/v1/auth/login`
- Body (JSON):
```json
{
  "email": "admin@empresa.com",
  "password": "Admin@123"
}
```
- Copie o `accessToken` da resposta

### Passo 2: Criar Técnico com Foto
- Método: `POST`
- URL: `http://localhost:3000/api/v1/tecnicos/with-photo`
- Headers:
  - Authorization: `Bearer SEU_TOKEN`
- Body: `form-data`
  - photo: [selecione arquivo]
  - name: João Silva
  - workday: WDC00001
  - cargo: Técnico de Manutenção
  - senioridade: Pleno
  - area: Manutenção
  - shift: 1T
  - department: Manutenção Elétrica
  - gender: M
  - joinDate: 2020-01-15

### Passo 3: Ver a Foto
- Abra no navegador: `http://localhost:3000/uploads/photos/[ID_DO_TECNICO].jpg`

---

## 4️⃣ Teste no Swagger UI

1. Acesse: `http://localhost:3000/api/docs`
2. Clique em `POST /auth/login`
3. Execute o login e copie o token
4. Clique no botão "Authorize" (cadeado no topo)
5. Cole o token e clique em "Authorize"
6. Vá até `POST /tecnicos/with-photo`
7. Clique em "Try it out"
8. Selecione uma foto no campo `photo`
9. Preencha os campos obrigatórios
10. Execute

---

## 5️⃣ Teste Frontend (HTML + JavaScript)

Salve como `test-frontend.html` e abra no navegador:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste Upload de Foto - Técnico</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    input, select { width: 100%; padding: 10px; margin: 5px 0; box-sizing: border-box; }
    button { background: #007bff; color: white; padding: 12px 24px; border: none; cursor: pointer; margin-top: 10px; }
    button:hover { background: #0056b3; }
    .preview { max-width: 200px; margin: 10px 0; }
    .result { background: #f0f0f0; padding: 15px; margin-top: 20px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Teste - Cadastro de Técnico com Foto</h1>
  
  <form id="cadastroForm">
    <h3>1. Login</h3>
    <input type="email" id="email" placeholder="Email" value="admin@empresa.com">
    <input type="password" id="password" placeholder="Senha" value="Admin@123">
    <button type="button" onclick="login()">Fazer Login</button>
    
    <hr>
    
    <h3>2. Dados do Técnico</h3>
    <input type="file" id="photo" accept="image/*" onchange="previewPhoto()">
    <img id="preview" class="preview" style="display:none">
    
    <input type="text" id="name" placeholder="Nome Completo" value="João Silva">
    <input type="text" id="workday" placeholder="Matrícula (Workday)" value="WDC00001">
    <input type="text" id="cargo" placeholder="Cargo" value="Técnico de Manutenção">
    
    <select id="senioridade">
      <option value="Pleno">Pleno</option>
      <option value="Junior">Junior</option>
      <option value="Sênior">Sênior</option>
    </select>
    
    <select id="area">
      <option value="Manutenção">Manutenção</option>
      <option value="Produção">Produção</option>
      <option value="Qualidade">Qualidade</option>
    </select>
    
    <select id="shift">
      <option value="1T">1º Turno</option>
      <option value="2T">2º Turno</option>
      <option value="3T">3º Turno</option>
    </select>
    
    <input type="text" id="department" placeholder="Departamento" value="Manutenção Elétrica">
    
    <select id="gender">
      <option value="M">Masculino</option>
      <option value="F">Feminino</option>
      <option value="O">Outro</option>
    </select>
    
    <input type="date" id="joinDate" value="2020-01-15">
    
    <button type="button" onclick="cadastrarTecnico()">Cadastrar Técnico</button>
  </form>
  
  <div id="result" class="result" style="display:none"></div>

  <script>
    let token = '';
    
    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('http://localhost:3000/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        token = data.accessToken;
        
        alert('✅ Login realizado com sucesso!');
      } catch (error) {
        alert('❌ Erro no login: ' + error.message);
      }
    }
    
    function previewPhoto() {
      const file = document.getElementById('photo').files[0];
      const preview = document.getElementById('preview');
      
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          preview.src = reader.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    }
    
    async function cadastrarTecnico() {
      if (!token) {
        alert('❌ Faça login primeiro!');
        return;
      }
      
      const formData = new FormData();
      
      // Adicionar foto se selecionada
      const photoFile = document.getElementById('photo').files[0];
      if (photoFile) {
        formData.append('photo', photoFile);
      }
      
      // Adicionar campos
      formData.append('name', document.getElementById('name').value);
      formData.append('workday', document.getElementById('workday').value);
      formData.append('cargo', document.getElementById('cargo').value);
      formData.append('senioridade', document.getElementById('senioridade').value);
      formData.append('area', document.getElementById('area').value);
      formData.append('shift', document.getElementById('shift').value);
      formData.append('department', document.getElementById('department').value);
      formData.append('gender', document.getElementById('gender').value);
      formData.append('joinDate', document.getElementById('joinDate').value);
      
      try {
        const response = await fetch('http://localhost:3000/api/v1/tecnicos/with-photo', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const tecnico = await response.json();
        
        const resultDiv = document.getElementById('result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
          <h3>✅ Técnico Cadastrado com Sucesso!</h3>
          <p><strong>ID:</strong> ${tecnico.id}</p>
          <p><strong>Nome:</strong> ${tecnico.name}</p>
          <p><strong>Foto:</strong> ${tecnico.photo || 'Sem foto'}</p>
          ${tecnico.photo ? `
            <img src="http://localhost:3000/${tecnico.photo}" 
                 alt="${tecnico.name}" 
                 style="max-width: 200px; border-radius: 8px;">
          ` : ''}
          <hr>
          <pre>${JSON.stringify(tecnico, null, 2)}</pre>
        `;
        
        alert('✅ Técnico cadastrado com sucesso!');
        
      } catch (error) {
        alert('❌ Erro ao cadastrar: ' + error.message);
      }
    }
  </script>
</body>
</html>
```

---

## ✅ Checklist de Testes

- [ ] Backend está rodando (`npm run start:dev`)
- [ ] Login funciona e retorna token
- [ ] Criar técnico COM foto funciona
- [ ] Criar técnico SEM foto funciona
- [ ] Foto aparece na listagem de técnicos
- [ ] Foto aparece nos detalhes do técnico
- [ ] URL da foto é acessível no navegador
- [ ] Upload de foto separado funciona (POST /tecnicos/:id/photo)
- [ ] Swagger documenta corretamente o endpoint
- [ ] CORS permite acesso do frontend

---

## 🐛 Troubleshooting

### Erro: "Authorization required"
- Verifique se o token está correto
- Token pode ter expirado, faça login novamente

### Erro: "Cannot find module 'multer'"
```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
```

### Foto não carrega no navegador
- Verifique se a pasta `uploads/photos` existe
- Verifique se o arquivo foi salvo corretamente
- Teste o acesso direto: `http://localhost:3000/uploads/photos/[nome-arquivo]`

### CORS error no frontend
- Adicione a origem do seu frontend no `main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:4200', 'SUA_URL_FRONTEND'],
  ...
});
```

---

**Pronto para testar! 🚀**
