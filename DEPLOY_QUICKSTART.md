# ✅ Configuração de Deploy - Resumo

## 📦 Arquivos Criados

Sua aplicação está pronta para deploy no Render! Os seguintes arquivos foram criados/atualizados:

### Arquivos de Configuração
- ✅ `Dockerfile` - Container Docker otimizado para produção
- ✅ `.dockerignore` - Arquivos a serem ignorados no build
- ✅ `render.yaml` - Configuração automatizada do Render (opcional)
- ✅ `.env.render` - Template de variáveis de ambiente

### Documentação
- ✅ `DEPLOY_RENDER.md` - **Guia completo passo a passo**
- ✅ `DEPLOY_README.md` - Informações importantes pré-deploy
- ✅ `README.md` - Atualizado com seção de deploy

### Scripts
- ✅ `scripts/generate-secrets.sh` - Script para gerar JWT secrets

### Código
- ✅ `src/main.ts` - CORS atualizado para aceitar Vercel

## 🚀 Próximos Passos

### 1. Gerar JWT Secrets
Execute um destes comandos para gerar secrets seguros:

**Windows (Node.js):**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Execute 2 vezes para gerar:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### 2. Acessar o Render
1. Acesse: https://dashboard.render.com
2. Faça login ou crie uma conta
3. Conecte sua conta ao GitHub

### 3. Criar PostgreSQL Database
1. New + → PostgreSQL
2. Nome: `skillfix-db`
3. Region: Oregon (ou mais próxima)
4. Plan: Free ou Starter
5. **Salve a Internal Database URL**

### 4. Criar Web Service
1. New + → Web Service
2. Conecte o repositório `SkillFix-Backend`
3. Runtime: **Docker**
4. Configure as variáveis de ambiente (use `.env.render` como base)

### 5. Configurar Variáveis de Ambiente
**OBRIGATÓRIAS:**
```env
DATABASE_HOST=<do-postgresql-criado>
DATABASE_PORT=5432
DATABASE_USER=<do-postgresql-criado>
DATABASE_PASSWORD=<do-postgresql-criado>
DATABASE_NAME=skillfix_db
JWT_SECRET=<secret-gerado>
JWT_REFRESH_SECRET=<secret-gerado>
NODE_ENV=production
CORS_ORIGIN=https://skill-fix-frontend.vercel.app
```

### 6. Deploy!
1. Clique em "Create Web Service"
2. Aguarde o build (3-5 minutos)
3. Acesse o Shell e execute:
```bash
npm run migration:run
npm run seed
```

### 7. Testar
- Backend: `https://skillfix-backend.onrender.com`
- Swagger: `https://skillfix-backend.onrender.com/api/docs`

### 8. Atualizar Frontend
No frontend na Vercel, atualize a URL da API:
```javascript
const API_URL = 'https://skillfix-backend.onrender.com/api/v1';
```

## 📚 Documentação Detalhada

Para instruções completas, consulte:
👉 **[DEPLOY_RENDER.md](./DEPLOY_RENDER.md)**

## 🆘 Problemas Comuns

### CORS Error
- Verifique se `CORS_ORIGIN` está configurado corretamente
- Deve incluir `https://skill-fix-frontend.vercel.app`

### Database Connection Failed
- Use a **Internal Database URL** do PostgreSQL
- Verifique se todas as variáveis DATABASE_* estão corretas

### Build Failed
- Verifique os logs no Render
- Certifique-se de que `Dockerfile` está presente
- Runtime deve ser "Docker"

## 🎯 Checklist Final

Antes de fazer o deploy, verifique:
- [ ] JWT Secrets gerados
- [ ] Variáveis de ambiente preparadas
- [ ] PostgreSQL criado no Render
- [ ] Repositório no GitHub atualizado
- [ ] `.env` local não foi commitado (está no `.gitignore`)
- [ ] CORS incluindo URL da Vercel

## 💡 Dicas

1. **Plano Free do Render:**
   - Após 15min de inatividade, o serviço "dorme"
   - Primeira requisição pode levar ~30s
   - Arquivos de upload são efêmeros (perdidos após sleep)

2. **Upgrade para Starter ($7/mês):**
   - Sem sleep
   - Disco persistente para uploads
   - Melhor performance

3. **Migrations:**
   - Execute APENAS depois do primeiro deploy
   - Via Shell do Render: `npm run migration:run`

4. **Logs:**
   - Monitore em tempo real na aba "Logs"
   - Útil para debug

---

**Boa sorte com o deploy! 🚀**

Se tiver dúvidas, consulte [DEPLOY_RENDER.md](./DEPLOY_RENDER.md)
