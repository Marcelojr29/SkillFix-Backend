# Gerenciamento de Senhas

## Visão Geral

Este documento descreve como funciona o sistema de gerenciamento de senhas no SkillFix Backend, incluindo criação de usuários, senhas temporárias, alteração e reset de senhas.

## 1. Criação de Usuário com Senha Automática

### Comportamento

Quando um administrador cria um novo usuário através do endpoint `POST /api/v1/users`, **a senha é opcional**. Se não for fornecida, o sistema irá:

1. Gerar automaticamente uma senha temporária segura (12 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais)
2. Retornar a senha temporária no campo `temporaryPassword` na resposta da API
3. O administrador pode então compartilhar esta senha com o novo usuário através de um canal seguro (email, mensagem, etc.)

### Exemplo de Requisição SEM senha

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@skillfix.com",
    "name": "Novo Usuário",
    "role": "SUPERVISOR"
  }'
```

### Exemplo de Resposta

```json
{
  "id": "uuid",
  "email": "novo.usuario@skillfix.com",
  "name": "Novo Usuário",
  "role": "SUPERVISOR",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z",
  "temporaryPassword": "Xy9#aB2cD5eF"
}
```

> ⚠️ **IMPORTANTE**: A senha temporária é retornada **apenas uma vez** na resposta da criação. Certifique-se de salvá-la para compartilhar com o usuário!

### Exemplo de Requisição COM senha

Se preferir definir uma senha manualmente:

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novo.usuario@skillfix.com",
    "name": "Novo Usuário",
    "role": "SUPERVISOR",
    "password": "MinhaSenh@123"
  }'
```

Neste caso, a resposta **não incluirá** o campo `temporaryPassword` e você deverá compartilhar a senha manualmente com o usuário.

## 2. Alteração de Senha pelo Próprio Usuário

Qualquer usuário autenticado pode alterar sua própria senha:

### Endpoint

```
POST /api/v1/users/change-password
Authorization: Bearer {token-do-usuario}
```

### Requisição

```json
{
  "currentPassword": "SenhaAtual123",
  "newPassword": "NovaSenha@456"
}
```

### Validações

- Senha atual deve estar correta
- Nova senha deve ter no mínimo 8 caracteres
- Nova senha deve ser diferente da senha atual

### Exemplo com curl

```bash
curl -X POST http://localhost:3000/api/v1/users/change-password \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Xy9#aB2cD5eF",
    "newPassword": "MinhaNovaSenh@789"
  }'
```

## 3. Reset de Senha (Administrador)

Apenas usuários com role `MASTER` podem resetar senhas de outros usuários. Este endpoint gera uma nova senha temporária.

### Endpoint

```
POST /api/v1/users/reset-password
Authorization: Bearer {token-do-master}
```

### Requisição

```json
{
  "userId": "uuid-do-usuario"
}
```

### Resposta

```json
{
  "message": "Senha resetada com sucesso",
  "temporaryPassword": "Pq8#mN4vC7xZ"
}
```

### Exemplo com curl

```bash
curl -X POST http://localhost:3000/api/v1/users/reset-password \
  -H "Authorization: Bearer SEU_TOKEN_MASTER" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "uuid-do-usuario-que-esqueceu-a-senha"
  }'
```

## 4. Boas Práticas

### Para Administradores

1. **Criação de Usuários**:
   - Não forneça a senha inicial e deixe o sistema gerar automaticamente
   - Copie a senha temporária retornada na resposta
   - Compartilhe a senha com o novo usuário através de um canal seguro (não por email não criptografado)
   - Instrua o usuário a alterar a senha no primeiro acesso

2. **Reset de Senhas**:
   - Use o endpoint de reset apenas quando o usuário esquecer/perder a senha
   - Compartilhe a nova senha temporária de forma segura
   - Oriente o usuário a alterar a senha imediatamente

### Para Usuários Finais

1. **Primeiro Acesso**:
   - Faça login com a senha temporária fornecida pelo administrador
   - **Imediatamente** após o login, use o endpoint `POST /users/change-password` para definir uma senha própria

2. **Senha Esquecida**:
   - Solicite ao administrador para usar o endpoint de reset
   - Após receber a nova senha temporária, altere-a imediatamente

3. **Alteração Regular**:
   - Altere sua senha periodicamente (recomendação: a cada 90 dias)
   - Use senhas fortes: mínimo 8 caracteres, incluindo letras, números e símbolos
   - Nunca compartilhe sua senha com outros usuários

## 5. Segurança

### Criptografia

- Todas as senhas são armazenadas usando bcrypt com salt automático
- As senhas nunca são armazenadas ou transmitidas em texto plano (exceto na resposta inicial quando geradas automaticamente)
- A senha temporária é retornada apenas uma vez

### Validações

- Senha mínima: 8 caracteres
- Senhas temporárias geradas: 12 caracteres com alta entropia
- Charset para senhas temporárias: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%`

### Permissões

- **Criar usuário**: Apenas MASTER
- **Alterar própria senha**: Qualquer usuário autenticado
- **Resetar senha de outros**: Apenas MASTER

## 6. Fluxo Completo de Onboarding

### Passo 1: Administrador cria o usuário

```bash
# Admin cria usuário sem senha
curl -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tecnico@skillfix.com",
    "name": "João Silva",
    "role": "TECNICO"
  }'

# Resposta: { ..., "temporaryPassword": "Xy9#aB2cD5eF" }
```

### Passo 2: Administrador compartilha credenciais

- Email: tecnico@skillfix.com
- Senha temporária: Xy9#aB2cD5eF

### Passo 3: Usuário faz login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tecnico@skillfix.com",
    "password": "Xy9#aB2cD5eF"
  }'

# Resposta: { "accessToken": "...", "refreshToken": "..." }
```

### Passo 4: Usuário altera a senha

```bash
curl -X POST http://localhost:3000/api/v1/users/change-password \
  -H "Authorization: Bearer TOKEN_DO_USUARIO" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Xy9#aB2cD5eF",
    "newPassword": "MinhaSenhaSegura@2024"
  }'
```

## 7. Troubleshooting

### Erro: "Senha atual incorreta"

- Verifique se está usando a senha correta
- Certifique-se de que não há espaços extras
- Se esquecer a senha, solicite reset ao administrador

### Erro: "Senha deve ter no mínimo 8 caracteres"

- A nova senha precisa ter pelo menos 8 caracteres
- Recomendado: Use letras maiúsculas, minúsculas, números e símbolos

### Erro: "Email já cadastrado"

- O email fornecido já está em uso
- Verifique se o usuário já existe no sistema
- Use outro email ou atualize o usuário existente

### Perdi a senha temporária

- Se você é administrador: não é possível recuperar a senha temporária após a criação
- Solução: Use o endpoint de reset password para gerar uma nova senha temporária

## 8. Exemplos de Integração Frontend

### React/TypeScript - Criar Usuário

```typescript
async function createUser(userData: CreateUserDto) {
  const response = await fetch('http://localhost:3000/api/v1/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  const result = await response.json();
  
  // Se temporaryPassword existir, mostrar ao admin
  if (result.temporaryPassword) {
    alert(`Usuário criado! Senha temporária: ${result.temporaryPassword}`);
    // Aqui você pode copiar para clipboard ou enviar por email
  }
  
  return result;
}
```

### React/TypeScript - Alterar Senha

```typescript
async function changePassword(currentPassword: string, newPassword: string) {
  const response = await fetch('http://localhost:3000/api/v1/users/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  
  if (response.ok) {
    alert('Senha alterada com sucesso!');
  } else {
    const error = await response.json();
    alert(`Erro: ${error.message}`);
  }
}
```

## 9. Próximas Melhorias

Funcionalidades planejadas para futuras versões:

- [ ] Forçar troca de senha no primeiro login
- [ ] Expiração automática de senhas temporárias (ex: válidas por 24h)
- [ ] Histórico de senhas (evitar reutilização)
- [ ] Política de complexidade de senha configurável
- [ ] Notificação por email com senha temporária
- [ ] Autenticação de dois fatores (2FA)
- [ ] Bloqueio temporário após múltiplas tentativas de login falhas
