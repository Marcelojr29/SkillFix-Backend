# 🚨 Rota de Edição de Técnicos - Implementação Necessária

## 📋 Contexto

**Data**: 02/04/2026  
**Status**: ❌ Não implementado  
**Prioridade**: Média  

## ❌ Problema Identificado

A interface de listagem de técnicos (`/tecnicos`) possui um menu dropdown com a opção "Editar" que tentava navegar para a rota `/tecnicos/[id]/edit`, mas essa rota não existe no frontend.

### Erro Observado

```
GET /tecnicos/b4e0e86b-275a-46b1-b5d8-88b0b84f66f2/edit 404 in 650ms
```

## ✅ Solução Temporária Aplicada

A opção "Editar" foi temporariamente **comentada** no menu dropdown até que a funcionalidade seja implementada:

```typescript
// Arquivo: app/tecnicos/page.tsx (linha ~255)
{/* TODO: Implementar rota de edição /tecnicos/[id]/edit */}
{/* {canEditTecnico && (
  <DropdownMenuItem onClick={() => router.push(`/tecnicos/${tecnico.id}/edit`)}>
    <Edit className="mr-2 h-4 w-4" />
    Editar
  </DropdownMenuItem>
)} */}
```

---

## 🎯 Opções de Implementação

### **Opção 1: Criar Rota Dedicada de Edição (Recomendada)**

Criar uma nova página específica para edição de técnicos.

#### Frontend
**Arquivo**: `app/tecnicos/[id]/edit/page.tsx`

**Funcionalidades necessárias**:
- ✅ Carregar dados do técnico pelo ID
- ✅ Preencher formulário com dados existentes
- ✅ Permitir edição de todos os campos
- ✅ Validação de campos obrigatórios
- ✅ Upload/alteração de foto de perfil
- ✅ Atualização de habilidades (skills)
- ✅ Gerenciamento de máquinas associadas
- ✅ Navegação de volta após salvar

#### Backend

**Endpoint já implementado**:
```
PATCH /api/v1/tecnicos/:id
```

**✅ VALIDAÇÕES IMPLEMENTADAS (02/04/2026)**:

1. **Validação de Workday**: 
   - ❌ Não permite alterar o `workday` se o técnico já possui avaliações vinculadas
   - ✅ Valida se o novo workday já existe no banco

2. **Validação de Email**:
   - ✅ Valida se o email já está em uso por outro usuário

3. **Validação de Team e SubTeam**:
   - ✅ Verifica se o `teamId` existe
   - ✅ Verifica se o `subtimeId` pertence ao `teamId` informado

4. **Gestão de Supervisores**:
   - ✅ Valida que email é obrigatório se senioridade = "Supervisor"
   - ✅ Cria conta de usuário automaticamente ao promover para Supervisor
   - ✅ Marca `hasUserAccount = false` ao remover senioridade de Supervisor

5. **Tratamento de Erros**:
   - ✅ Retorna `400 Bad Request` para dados inválidos
   - ✅ Retorna `409 Conflict` para workday/email duplicados
   - ✅ Retorna `404 Not Found` se técnico não existir
   - ✅ Valida ownership antes de permitir edição

**DTO de atualização** (`UpdateTecnicoDto`):
```typescript
{
  name?: string
  workday?: string  // ⚠️ Bloqueado se houver avaliações vinculadas
  cargo?: string
  senioridade?: 'Auxiliar' | 'Junior' | 'Pleno' | 'Sênior' | 'Especialista' | 'Coordenador' | 'Supervisor'
  area?: string
  shift?: '1T' | '2T' | '3T' | 'ADM'
  department?: string
  teamId?: string
  subtimeId?: string
  gender?: 'M' | 'F'
  joinDate?: Date
  status?: boolean
  // Campos para supervisores
  email?: string     // ✅ Obrigatório se senioridade = "Supervisor"
  password?: string  // ✅ Necessário ao promover para Supervisor pela primeira vez
}
```

**Validações Backend**:
- ✅ `workday` deve ser único (se alterado)
- ✅ `email` deve ser único (se alterado)
- ✅ Se `senioridade` for "Supervisor", email e password são obrigatórios
- ✅ `teamId` deve existir no banco
- ✅ `subtimeId` deve pertencer ao time selecionado
- ✅ Validar tipos de dados e formatos

**Requisitos adicionais**:
- ✅ **Não permite alterar o `workday`** se já existir avaliações vinculadas
- ✅ **Valida se o email já existe** (se for alterado)
- ✅ **Atualiza timestamp `updatedAt`** automaticamente
- ✅ **Permite remover supervisor** (alterar senioridade)
- ✅ **Gerencia contas de usuário** automaticamente ao promover/rebaixar supervisores

---

### **Opção 2: Adaptar Página de Cadastro**

Modificar a página `/cadastro` para funcionar tanto para criação quanto edição.

#### Implementação
```typescript
// app/cadastro/page.tsx
const searchParams = useSearchParams()
const editId = searchParams.get('id') // /cadastro?id=abc123

useEffect(() => {
  if (editId) {
    // Carregar dados do técnico e preencher formulário
    loadTecnicoData(editId)
  }
}, [editId])
```

#### Navegação
```typescript
// Em app/tecnicos/page.tsx
router.push(`/cadastro?id=${tecnico.id}`)
```

**Prós**:
- Reutiliza formulário existente
- Menos código duplicado

**Contras**:
- Página `/cadastro` fica com múltiplas responsabilidades
- URL menos intuitiva
- Pode confundir usuários

---

## 📝 Checklist de Implementação (Opção 1 - Recomendada)

### Frontend

- [ ] Criar arquivo `app/tecnicos/[id]/edit/page.tsx`
- [ ] Implementar formulário de edição (copiar base de `/cadastro`)
- [ ] Adicionar hook `useParams()` para pegar ID
- [ ] Criar serviço `tecnicosService.update(id, data)`
- [ ] Carregar dados do técnico via `tecnicosService.findOne(id)`
- [ ] Preencher formulário com dados carregados
- [ ] Implementar validação de campos
- [ ] Adicionar loading states
- [ ] Adicionar tratamento de erros
- [ ] Implementar upload de foto (se necessário)
- [ ] Descomentar opção "Editar" no menu dropdown
- [ ] Testar fluxo completo

### Backend

**Endpoints necessários** (já implementados):
- ✅ `GET /api/v1/tecnicos/:id` - Buscar dados do técnico
- ✅ `PATCH /api/v1/tecnicos/:id` - Atualizar técnico
- ✅ `POST /api/v1/tecnicos/:id/photo` - Upload de foto (se houver)

**Validações Backend**:
- [x] Validar que o `workday` é único (se alterado)
- [x] Validar que o `email` é único (se alterado)  
- [x] Validar que `teamId` existe
- [x] Validar que `subtimeId` pertence ao `teamId`
- [x] Se senioridade = "Supervisor", validar email obrigatório
- [x] Retornar erro 400 com mensagem clara em caso de falha
- [x] Retornar erro 404 se técnico não existir
- [x] Retornar 403 se usuário não tiver permissão (se houver controle de acesso)
- [x] Não permitir alterar `workday` se já existir avaliações vinculadas
- [x] Criar conta de usuário automaticamente ao promover para Supervisor

---

## 🔧 Exemplo de Implementação Frontend

### Estrutura Básica do Formulário de Edição

```typescript
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { tecnicosService } from "@/core/services"
import { useNotification } from "@/core/contexts"
import { AppLayout } from "@/shared/components/layout"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"

export default function EditTecnicoPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useNotification()
  const tecnicoId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    workday: "",
    cargo: "",
    senioridade: "",
    area: "",
    shift: "",
    department: "",
    teamId: "",
    subtimeId: "",
    gender: "",
    joinDate: "",
    email: "",
  })

  useEffect(() => {
    loadTecnicoData()
  }, [tecnicoId])

  const loadTecnicoData = async () => {
    try {
      setLoading(true)
      const tecnico = await tecnicosService.findOne(tecnicoId)
      
      setFormData({
        name: tecnico.name,
        workday: tecnico.workday,
        cargo: tecnico.cargo || "",
        senioridade: tecnico.senioridade || "",
        area: tecnico.area || "",
        shift: tecnico.shift || "",
        department: tecnico.department || "",
        teamId: tecnico.teamId || "",
        subtimeId: tecnico.subtimeId || "",
        gender: tecnico.gender || "",
        joinDate: tecnico.joinDate || "",
        email: tecnico.email || "",
      })
    } catch (err) {
      showError("Erro ao carregar dados do colaborador")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      await tecnicosService.update(tecnicoId, formData)
      success("Colaborador atualizado com sucesso!")
      router.push(`/tecnicos/${tecnicoId}`)
    } catch (err: any) {
      showError(err.message || "Erro ao atualizar colaborador")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Editar Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos do formulário */}
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              {/* Adicionar mais campos conforme necessário */}

              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
```

---

## 🧪 Casos de Teste

### Frontend
- [ ] Carregar técnico existente
- [ ] Editar apenas nome e salvar
- [ ] Alterar time e verificar subtimes disponíveis
- [ ] Tentar salvar com campos obrigatórios vazios (deve mostrar erro)
- [ ] Salvar e verificar redirecionamento
- [ ] Cancelar edição (deve voltar sem salvar)
- [ ] Tentar editar técnico inexistente (deve mostrar erro 404)

### Backend
- [ ] `PATCH /api/v1/tecnicos/:id` com dados válidos → 200 OK
- [ ] `PATCH /api/v1/tecnicos/:id` com workday duplicado → 400 Bad Request
- [ ] `PATCH /api/v1/tecnicos/:id` com email duplicado → 400 Bad Request
- [ ] `PATCH /api/v1/tecnicos/:id` com teamId inválido → 400 Bad Request
- [ ] `PATCH /api/v1/tecnicos/:id` com ID inexistente → 404 Not Found
- [ ] Verificar que `updatedAt` foi atualizado
- [ ] Verificar que campos não enviados não foram alterados

---

## 📌 Pontos de Atenção

### Segurança
- ⚠️ **Validar permissões**: Apenas usuários com role "master" devem editar
- ⚠️ **Não permitir alterar campos sensíveis** via PATCH (ex: password sem validação)
- ⚠️ **Validar propriedade dos dados**: Supervisores devem editar apenas seus técnicos (se aplicável)

### Integridade de Dados
- ⚠️ **Workday único**: Não permitir duplicatas
- ⚠️ **Email único**: Não permitir duplicatas (se senioridade = Supervisor)
- ⚠️ **Relacionamentos**: Validar que teamId e subtimeId existem

### UX
- ✅ Mostrar loading states durante carregamento e submissão
- ✅ Feedback claro de sucesso/erro
- ✅ Voltar para página de detalhes após salvar
- ✅ Permitir cancelar sem salvar

---

## 🔗 Arquivos Relacionados

### Frontend
- `app/tecnicos/page.tsx` - Lista de técnicos (tem o menu dropdown)
- `app/tecnicos/[id]/page.tsx` - Detalhes do técnico
- `app/cadastro/page.tsx` - Formulário de cadastro (base para edição)
- `core/services/tecnicos.service.ts` - Service de técnicos

### Backend
- `src/modules/tecnicos/tecnicos.controller.ts` - Controller
- `src/modules/tecnicos/tecnicos.service.ts` - Service
- `src/modules/tecnicos/dto/update-tecnico.dto.ts` - DTO de atualização

---

## ✅ Depois de Implementar

1. Descomentar a opção "Editar" no menu dropdown:

```typescript
// app/tecnicos/page.tsx
{canEditTecnico && (
  <DropdownMenuItem onClick={() => router.push(`/tecnicos/${tecnico.id}/edit`)}>
    <Edit className="mr-2 h-4 w-4" />
    Editar
  </DropdownMenuItem>
)}
```

2. Testar fluxo completo de edição
3. Atualizar documentação
4. Marcar tarefa como concluída

---

## 📚 Referências

- [Next.js Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)
- [Radix UI Form Components](https://ui.shadcn.com/docs/components/form)

---

## ✅ Implementação Backend Concluída

**Data da implementação**: 02/04/2026

### 📦 Alterações Realizadas

#### 1. **Módulo de Técnicos** (`tecnicos.module.ts`)
- ✅ Adicionadas entidades: `Team`, `SubTeam`, `Evaluation`
- ✅ Repositórios disponíveis para validações

#### 2. **Service de Técnicos** (`tecnicos.service.ts`)
- ✅ Método `update()` completamente reescrito com validações
- ✅ Importadas exceções: `ConflictException`
- ✅ Importado operador TypeORM: `Not`

**Validações implementadas no método `update()`:**

```typescript
async update(id: string, updateTecnicoDto: UpdateTecnicoDto, userId: string)
```

1. **Validação de Ownership**: Verifica se o usuário tem permissão para editar
2. **Validação de Workday**: 
   - Verifica se há avaliações vinculadas (bloqueia alteração)
   - Verifica se o novo workday já existe
3. **Validação de Email**: Verifica se o email já está em uso
4. **Validação de Team**: Verifica se o teamId existe
5. **Validação de SubTeam**: 
   - Verifica se o subtimeId existe
   - Verifica se pertence ao teamId informado
6. **Gestão de Supervisores**:
   - Valida email obrigatório para supervisores
   - Cria conta de usuário automaticamente
   - Remove flag `hasUserAccount` ao rebaixar

#### 3. **DTO de Atualização** (`update-tecnico.dto.ts`)
- ✅ Adicionado campo `email` (opcional, obrigatório se supervisor)
- ✅ Adicionado campo `password` (opcional, requerido ao promover)
- ✅ Validações com `@ValidateIf` para supervisores
- ✅ Documentação Swagger completa

### 🎯 Tratamento de Erros

| Situação | Status Code | Mensagem |
|----------|-------------|----------|
| Workday duplicado | `409 Conflict` | "Este workday (matrícula) já está em uso" |
| Email duplicado | `409 Conflict` | "Este e-mail já está em uso" |
| Workday com avaliações | `400 Bad Request` | "Não é possível alterar o workday pois o técnico possui avaliações vinculadas" |
| TeamId inválido | `400 Bad Request` | "Time com ID {id} não encontrado" |
| SubTimeId inválido | `400 Bad Request` | "Subtime com ID {id} não encontrado" |
| SubTime não pertence ao Team | `400 Bad Request` | "O subtime selecionado não pertence ao time informado" |
| Supervisor sem email | `400 Bad Request` | "E-mail é obrigatório para técnicos com senioridade Supervisor" |
| Técnico não encontrado | `404 Not Found` | "Técnico com ID {id} não encontrado" |
| Sem permissão | `403 Forbidden` | (via OwnershipService) |

### 🧪 Pontos de Teste Recomendados

**Testes que devem funcionar:**
- ✅ Atualizar nome, cargo, área (campos simples)
- ✅ Atualizar teamId para time válido
- ✅ Atualizar subtimeId que pertence ao teamId
- ✅ Promover técnico para Supervisor (com email e senha)
- ✅ Rebaixar Supervisor para outro nível
- ✅ Atualizar email de supervisor existente
- ✅ Atualizar workday de técnico sem avaliações

**Testes que devem falhar com erro:**
- ❌ Alterar workday de técnico com avaliações
- ❌ Usar workday já existente
- ❌ Usar email já cadastrado
- ❌ Atribuir subtimeId que não pertence ao teamId
- ❌ Promover para Supervisor sem email
- ❌ Usar teamId inexistente

### 📝 Próximos Passos (Frontend)

Para completar a funcionalidade, o frontend precisa:

1. [ ] Criar rota `/tecnicos/[id]/edit`
2. [ ] Implementar formulário de edição
3. [ ] Adicionar validações de UI
4. [ ] Descomentar opção "Editar" no menu dropdown
5. [ ] Testar fluxo completo de edição

Ver checklist completo na seção "Checklist de Implementação" acima.

---

**Status**: 🟢 Backend implementado e funcional  
**Última atualização**: 02/04/2026  
**Responsável**: Claude AI Assistant
