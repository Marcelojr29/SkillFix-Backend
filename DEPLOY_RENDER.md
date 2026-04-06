# 🚀 Guia de Deploy no Render

## Pré-requisitos
- Conta no [Render](https://render.com)
- Repositório GitHub do projeto
- Frontend já deployado na Vercel: https://skill-fix-frontend.vercel.app

## 📋 Passo a Passo

### 1. Criar PostgreSQL Database no Render

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `skillfix-db` (ou nome de sua preferência)
   - **Database**: `skillfix_db`
   - **User**: `skillfix_user`
   - **Region**: Escolha a região mais próxima (ex: Oregon)
   - **PostgreSQL Version**: 15
   - **Plan**: Free (para testes) ou Starter
4. Clique em **"Create Database"**
5. ⚠️ **IMPORTANTE**: Salve a **Internal Database URL** que será exibida

### 2. Criar Web Service

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `skillfix-backend`
   - **Region**: Mesma região do banco de dados
   - **Branch**: `main`
   - **Root Directory**: (deixe em branco)
   - **Runtime**: `Docker`
   - **Plan**: Free (para testes) ou Starter

### 3. Configurar Variáveis de Ambiente

Na seção **"Environment Variables"**, adicione:

```env
# Database - Use a Internal Database URL do PostgreSQL criado
DATABASE_URL=postgres://skillfix_user:senha@hostname/skillfix_db
# OU configure individualmente:
DATABASE_HOST=dpg-xxxxx.oregon-postgres.render.com
DATABASE_PORT=5432
DATABASE_USER=skillfix_user
DATABASE_PASSWORD=sua_senha_do_banco
DATABASE_NAME=skillfix_db

# JWT - IMPORTANTE: Gere secrets seguros!
JWT_SECRET=seu-secret-jwt-super-seguro-aqui-min-32-chars
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro-aqui
JWT_REFRESH_EXPIRATION=30d

# Application
PORT=3000
NODE_ENV=production
API_PREFIX=api/v1

# CORS - URL do frontend na Vercel
CORS_ORIGIN=https://skill-fix-frontend.vercel.app

# Swagger
SWAGGER_TITLE=SkillFix API
SWAGGER_DESCRIPTION=Sistema de gestão de colaboradores, avaliações e competências técnicas
SWAGGER_VERSION=1.0
SWAGGER_PATH=api/docs

# Upload
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf
UPLOAD_PATH=uploads/photos
```

### 4. Deploy

1. Clique em **"Create Web Service"**
2. O Render iniciará automaticamente o build e deploy
3. Aguarde a conclusão (pode levar alguns minutos)

### 5. Executar Migrations

Após o primeiro deploy bem-sucedido:

1. Vá até a aba **"Shell"** do seu Web Service
2. Execute os comandos:

```bash
npm run migration:run
npm run seed  # Se quiser popular o banco com dados iniciais
```

Ou crie um **Build Command** customizado:

```bash
npm ci && npm run build && npm run migration:run
```

## 🔐 Gerando Secrets Seguros

Para gerar secrets JWT seguros, use um dos métodos:

**Node.js:**
```javascript
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**OpenSSL:**
```bash
openssl rand -hex 64
```

## 📝 URLs Importantes

Após o deploy:
- **Backend API**: `https://skillfix-backend.onrender.com`
- **Swagger Docs**: `https://skillfix-backend.onrender.com/api/docs`
- **Frontend**: `https://skill-fix-frontend.vercel.app`

## ⚙️ Configurações Adicionais

### Health Check
O Render faz health checks automáticos. Certifique-se de que a rota raiz responde corretamente.

### Auto-Deploy
Por padrão, o Render faz deploy automático quando há push na branch `main`.

### Disco Persistente (Para Uploads)
Se você precisa persistir uploads de fotos:

1. Na configuração do Web Service
2. Vá em **"Disks"**
3. Adicione um disco:
   - **Name**: `uploads`
   - **Mount Path**: `/app/uploads`
   - **Size**: 1GB (ou conforme necessidade)

⚠️ **Nota**: No plano Free, os arquivos são efêmeros e serão perdidos após 15 minutos de inatividade.

### Logs
- Acesse os logs em tempo real na aba **"Logs"** do Dashboard
- Use para debugar problemas de build ou runtime

## 🔄 Atualizar o Frontend

No seu frontend na Vercel, atualize a URL da API para:
```javascript
const API_URL = 'https://skillfix-backend.onrender.com/api/v1';
```

## 🐛 Troubleshooting

### "Build failed"
- Verifique os logs de build
- Certifique-se de que todas as dependências estão no `package.json`
- Verifique se o Dockerfile está correto

### "Database connection failed"
- Confirme que a `DATABASE_URL` está correta
- Verifique se o banco PostgreSQL está rodando
- Use a **Internal Database URL** para conexão

### "CORS errors"
- Certifique-se de que `CORS_ORIGIN` está configurado com a URL correta da Vercel
- Inclua o protocolo `https://`

### "Application não responde"
- Verifique se a porta 3000 está exposta no Dockerfile
- Confirme que `process.env.PORT` está sendo usado no `main.ts`

## 📚 Documentação

- [Render Docs](https://render.com/docs)
- [Render PostgreSQL](https://render.com/docs/databases)
- [Docker on Render](https://render.com/docs/docker)

## ✅ Checklist Final

- [ ] Banco PostgreSQL criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets JWT gerados e configurados
- [ ] Web Service criado e deployado
- [ ] Migrations executadas
- [ ] Seed executado (opcional)
- [ ] CORS configurado para aceitar o domínio da Vercel
- [ ] Frontend atualizado com URL do backend
- [ ] Testes de API realizados
- [ ] Swagger acessível

---

**Pronto! Seu backend SkillFix está no ar! 🎉**
