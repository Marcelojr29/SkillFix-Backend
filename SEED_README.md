# 🌱 Seed do Banco de Dados - SkillFix

## 📋 Descrição

Este script de seed popula o banco de dados do SkillFix com dados iniciais para facilitar o desenvolvimento e testes, eliminando a necessidade de usar dados mockados.

## 🎯 Dados Criados

### 👤 Usuários (2)
1. **Admin Master**
   - Email: `admin@skillfix.com`
   - Senha: `Admin@123`
   - Role: `master`

2. **Supervisor**
   - Email: `supervisor@skillfix.com`
   - Senha: `Supervisor@123`
   - Role: `supervisor`

### 🏢 Times (3)
1. Time de Produção
2. Time de Manutenção
3. Time de Qualidade

### 👨‍👩‍👧‍👦 SubTimes (3)
1. Subtime Injeção (vinculado ao Time de Produção)
2. Subtime Extrusão (vinculado ao Time de Produção)
3. Subtime Manutenção Preventiva (vinculado ao Time de Manutenção)

### 🏭 Máquinas (3)
1. **MAQ-001** - Injetora 001 (Engel E-Mac 50)
2. **MAQ-002** - Injetora 002 (Haitian Mars 3)
3. **MAQ-003** - Extrusora 001 (Romi EX-200)

### 🔧 Skills (4)
1. Operação de Injetora Básica (nível: basic)
2. Setup de Molde Avançado (nível: advanced)
3. Operação de Extrusora (nível: intermediary)
4. Manutenção Preventiva Geral (nível: intermediary)

### 👷 Técnicos (4)
1. **João Silva Santos** - Operador Sênior (1º Turno, Injeção)
2. **Maria Oliveira Costa** - Operadora Pleno (1º Turno, Injeção)
3. **Carlos Eduardo Pereira** - Operador Pleno (2º Turno, Extrusão)
4. **Ana Paula Rodrigues** - Técnica Especialista (Administrativo, Manutenção)

### 🔗 Relacionamentos Técnico-Skill (5)
- João → Operação Básica (score: 95.00)
- João → Setup Avançado (score: 88.50)
- Maria → Operação Básica (score: 82.00)
- Carlos → Operação de Extrusora (score: 90.00)
- Ana → Manutenção Preventiva (score: 92.00)

---

## 🚀 Como Usar

### 1. Pré-requisitos

Certifique-se de que:
- ✅ O Docker está rodando
- ✅ O banco PostgreSQL está acessível (`docker-compose up -d`)
- ✅ As dependências estão instaladas (`npm install`)

### 2. Executar a Seed

```bash
npm run seed
```

### 3. Saída Esperada

```
🌱 Iniciando seed do banco de dados...

🧹 Limpando tabelas...
✅ Tabelas limpas

👤 Criando usuário admin...
✅ Admin criado: admin@skillfix.com / Admin@123

👤 Criando usuário supervisor...
✅ Supervisor criado: supervisor@skillfix.com / Supervisor@123

🏢 Criando times...
✅ 3 times criados

👨‍👩‍👧‍👦 Criando subtimes...
✅ 3 subtimes criados

🏭 Criando máquinas...
✅ 3 máquinas criadas

🔧 Criando skills...
✅ 4 skills criadas

👷 Criando técnicos...
✅ 4 técnicos criados

🔗 Criando relacionamentos técnico-skill...
✅ 5 relacionamentos técnico-skill criados

============================================================
✅ SEED CONCLUÍDO COM SUCESSO!

📊 Resumo dos dados criados:
   • 2 usuários (admin + supervisor)
   • 3 times
   • 3 subtimes
   • 3 máquinas
   • 4 skills
   • 4 técnicos
   • 5 relacionamentos técnico-skill

🔑 Credenciais de acesso:
   Admin: admin@skillfix.com / Admin@123
   Supervisor: supervisor@skillfix.com / Supervisor@123

============================================================

🎉 Processo finalizado!
```

---

## 🔐 Testar Acesso

### Login via cURL

```bash
# Admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillfix.com","password":"Admin@123"}'

# Supervisor
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"supervisor@skillfix.com","password":"Supervisor@123"}'
```

### Listar Dados Criados

```bash
# Exportar token (substitua pelo token retornado no login)
export TOKEN="seu_token_aqui"

# Listar times
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/teams

# Listar máquinas
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/machines

# Listar skills
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/skills

# Listar técnicos
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/tecnicos
```

---

## ⚠️ Avisos Importantes

### Limpeza de Dados

**O script limpa todas as tabelas antes de inserir os dados!**

A seed executa um `TRUNCATE CASCADE` nas seguintes tabelas:
- `users`
- `teams`
- `subtimes`
- `machines`
- `skills`
- `tecnicos`

**⚠️ NUNCA execute este script em produção!**

### Comentar a Limpeza

Se você quiser **adicionar** dados sem limpar o banco, comente a seção de limpeza no arquivo `src/database/seeds/seed.ts`:

```typescript
// console.log('🧹 Limpando tabelas...');
// await dataSource.query('TRUNCATE TABLE users CASCADE');
// await dataSource.query('TRUNCATE TABLE teams CASCADE');
// ...
// console.log('✅ Tabelas limpas\n');
```

---

## 📁 Localização do Arquivo

```
src/database/seeds/seed.ts
```

---

## 🛠️ Customizar Dados

Para adicionar mais dados ou modificar os existentes, edite o arquivo `src/database/seeds/seed.ts`.

### Exemplo: Adicionar um novo técnico

```typescript
const [tecnico5] = await dataSource.query(
  `INSERT INTO tecnicos (id, name, workday, cargo, senioridade, area, shift, department, gender, photo, "joinDate", status, "teamId", "subtimeId", "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10, $11, $12, NOW(), NOW())
   RETURNING *`,
  [
    'Pedro Henrique',
    '3T',
    'Operador de Produção',
    'Junior',
    'Produção',
    '3T',
    'Produção',
    'M',
    '2023-01-20',
    true,
    timeProducao.id,
    subtimeInjecao.id
  ]
);
```

---

## 🔄 Re-executar a Seed

Você pode executar `npm run seed` quantas vezes quiser. O script sempre:
1. Limpa todas as tabelas
2. Recria todos os dados do zero
3. Garante IDs novos (UUID gerados)

---

## 📊 Swagger

Após executar a seed, você pode testar todos os endpoints no Swagger:

```
http://localhost:3000/api/docs
```

1. Faça login no endpoint `/auth/login`
2. Copie o `accessToken` retornado
3. Clique em "Authorize" no Swagger
4. Cole o token no formato: `Bearer {seu_token}`
5. Teste todos os endpoints!

---

## ❓ Troubleshooting

### Erro: "Cannot connect to database"

**Solução:** Inicie o Docker Compose
```bash
docker-compose up -d
```

### Erro: "Table doesn't exist"

**Solução:** Execute a aplicação uma vez para criar as tabelas (TypeORM synchronize)
```bash
npm run start:dev
```
Depois pare a aplicação (Ctrl+C) e execute a seed.

### Erro: "Cannot find module"

**Solução:** Instale as dependências
```bash
npm install
```

---

## 📝 Notas

- As senhas são criptografadas com bcrypt (salt rounds: 10)
- Os UUIDs são gerados automaticamente pelo PostgreSQL (`gen_random_uuid()`)
- Os campos `createdAt` e `updatedAt` são definidos automaticamente com `NOW()`
- As datas `joinDate` das máquinas e técnicos estão no formato `YYYY-MM-DD`

---

## 🎓 Para Desenvolvedores Frontend

Use os dados criados pela seed para desenvolver e testar suas telas:

- **Login:** Use as credenciais de admin ou supervisor
- **Listagens:** Todas as tabelas terão dados para popular seus componentes
- **Relacionamentos:** Os dados estão vinculados corretamente (times → subtimes → técnicos → skills)
- **Testes:** Crie novos registros, edite ou delete os dados de exemplo

**Sem necessidade de mockar dados!** 🚀
