# 👥 Sistema Multi-Supervisor - Documentação Técnica

## 📋 Visão Geral

Sistema que permite que **Supervisores sejam técnicos com login próprio**, onde cada supervisor gerencia apenas seus times e sub-times de forma isolada.

---

## 🎯 Requisitos de Negócio

### Hierarquia da Empresa
```
Admin (você) - Acesso total ao sistema
  └── Supervisores (vários) - Gerentes com login próprio
       ├── Coordenadores
       ├── Especialistas
       ├── Sêniors
       ├── Plenos
       ├── Juniors
       └── Auxiliares
```

### Funcionalidades

1. **Admin cadastra Supervisor:**
   - Preenche dados do técnico (nome, matrícula, etc.)
   - Senioridade = "Supervisor"
   - Informa e-mail e senha → **Cria conta de usuário automaticamente**

2. **Supervisor faz login:**
   - Usa e-mail e senha cadastrados
   - Acessa sistema "vazio" (só vê seus dados)
   - Pode criar times, técnicos, avaliações, etc.

3. **Supervisor cadastra outro Supervisor:**
   - Mesmo fluxo do Admin
   - Não precisa de aprovação

4. **Isolamento de Dados:**
   - Cada supervisor vê apenas **seus times/sub-times**
   - Admin vê **tudo**

---

## 🗄️ Mudanças no Banco de Dados

### 1. Tabela `users` (já existe)

```sql
-- Adicionar coluna para vincular User → Tecnico
ALTER TABLE users ADD COLUMN tecnico_id UUID NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_tecnico 
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE SET NULL;
```

### 2. Tabela `tecnicos` (já existe)

```sql
-- Adicionar colunas para credenciais de supervisores
ALTER TABLE tecnicos ADD COLUMN email VARCHAR(255) NULL UNIQUE;
ALTER TABLE tecnicos ADD COLUMN has_user_account BOOLEAN DEFAULT FALSE;
```

### 3. Relacionamento User ↔ Tecnico

```
User (1) ←→ (0..1) Tecnico
- Um User pode estar vinculado a um Tecnico (se for supervisor)
- Um Tecnico pode ter uma conta User (se senioridade = Supervisor)
```

---

## 📦 Mudanças nas Entidades

### `User.entity.ts`

```typescript
import { OneToOne, JoinColumn } from 'typeorm';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';

@Entity('users')
export class User {
  // ... campos existentes

  @Column({ name: 'tecnico_id', nullable: true })
  tecnicoId?: string;

  @OneToOne(() => Tecnico, { nullable: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico?: Tecnico;

  // ... resto do código
}
```

### `Tecnico.entity.ts`

```typescript
import { OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('tecnicos')
export class Tecnico {
  // ... campos existentes

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column({ name: 'has_user_account', default: false })
  hasUserAccount: boolean;

  @OneToOne(() => User, (user) => user.tecnico, { nullable: true })
  user?: User;

  // ... resto do código
}
```

---

## 📝 Mudanças nos DTOs

### `CreateTecnicoDto`

```typescript
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  ValidateIf 
} from 'class-validator';

export class CreateTecnicoDto {
  // ... campos existentes

  // Novos campos para supervisores
  @ApiProperty({ 
    example: 'supervisor@empresa.com',
    description: 'E-mail do supervisor (obrigatório se senioridade = Supervisor)',
    required: false 
  })
  @ValidateIf((o) => o.senioridade === 'Supervisor')
  @IsNotEmpty({ message: 'E-mail é obrigatório para Supervisores' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: 'Senha@123',
    description: 'Senha do supervisor (obrigatório se senioridade = Supervisor)',
    required: false 
  })
  @ValidateIf((o) => o.senioridade === 'Supervisor')
  @IsNotEmpty({ message: 'Senha é obrigatória para Supervisores' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsOptional()
  password?: string;
}
```

### `UpdateTecnicoDto`

```typescript
export class UpdateTecnicoDto extends PartialType(CreateTecnicoDto) {
  // Não permite alterar email/password por aqui
  // Terá endpoint separado para trocar senha
}
```

---

## 🔧 Mudanças nos Services

### `TecnicosService.create()`

```typescript
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TecnicosService {
  constructor(
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
    @InjectRepository(TecnicoSkill)
    private tecnicoSkillsRepository: Repository<TecnicoSkill>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto, createdBy?: string): Promise<Tecnico> {
    const { skills, email, password, ...tecnicoData } = createTecnicoDto;

    // Validação: se é Supervisor, email e password são obrigatórios
    if (tecnicoData.senioridade === Senioridade.SUPERVISOR) {
      if (!email || !password) {
        throw new BadRequestException(
          'E-mail e senha são obrigatórios para cadastrar um Supervisor'
        );
      }

      // Verificar se e-mail já existe
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('Este e-mail já está em uso');
      }
    }

    // Criar técnico
    const tecnico = this.tecnicosRepository.create({
      ...tecnicoData,
      email: email || null,
      hasUserAccount: false,
    });
    const savedTecnico = await this.tecnicosRepository.save(tecnico);

    // Se for supervisor, criar conta de usuário
    if (tecnicoData.senioridade === Senioridade.SUPERVISOR && email && password) {
      const user = this.usersRepository.create({
        email,
        password, // Será hasheado pelo @BeforeInsert no User.entity
        name: tecnicoData.name,
        role: UserRole.MASTER,
        tecnicoId: savedTecnico.id,
      });
      await this.usersRepository.save(user);

      // Atualizar flag no técnico
      savedTecnico.hasUserAccount = true;
      await this.tecnicosRepository.save(savedTecnico);
    }

    // Criar skills se fornecidas
    if (skills && skills.length > 0) {
      const tecnicoSkills = skills.map((skill) =>
        this.tecnicoSkillsRepository.create({
          tecnicoId: savedTecnico.id,
          skillId: skill.skillId,
          score: skill.score,
          notes: skill.notes,
        }),
      );
      await this.tecnicoSkillsRepository.save(tecnicoSkills);
    }

    return this.findOne(savedTecnico.id);
  }
}
```

### `TecnicosModule` - Adicionar injeção de User

```typescript
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tecnico, TecnicoSkill, User]), // ← Adicionar User
  ],
  controllers: [TecnicosController],
  providers: [TecnicosService],
  exports: [TecnicosService],
})
export class TecnicosModule {}
```

---

## 🔐 Sistema de Filtros por Supervisor

### Decorator `@GetUser()` - Já existe

```typescript
// src/modules/auth/decorators/get-user.decorator.ts
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

### Lógica de Filtragem

```typescript
// TeamsService.findAll()
async findAll(query: QueryTeamDto, userId?: string) {
  const queryBuilder = this.teamsRepository
    .createQueryBuilder('team')
    .leftJoinAndSelect('team.supervisor', 'supervisor')
    .leftJoinAndSelect('team.subtimes', 'subtimes');

  // Se userId fornecido, buscar se é supervisor
  if (userId) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['tecnico'],
    });

    // Se user tem tecnico vinculado, filtrar apenas times desse supervisor
    if (user?.tecnicoId) {
      queryBuilder.andWhere('team.supervisorId = :supervisorId', {
        supervisorId: user.tecnicoId,
      });
    }
    // Se não tem tecnico, é admin - vê tudo
  }

  // ... resto da query
}
```

### Controllers - Adicionar GetUser

```typescript
// teams.controller.ts
@Get()
@ApiOperation({ summary: 'Listar times' })
findAll(
  @Query() query: QueryTeamDto,
  @GetUser('id') userId: string, // ← Pega ID do usuário logado
) {
  return this.teamsService.findAll(query, userId);
}
```

---

## 🔄 Migration

### Criar Migration

```bash
npm run migration:generate -- src/database/migrations/AddSupervisorAccounts
```

### Código da Migration

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupervisorAccounts1742500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Adicionar colunas em tecnicos
    await queryRunner.query(`
      ALTER TABLE tecnicos 
      ADD COLUMN email VARCHAR(255) NULL UNIQUE,
      ADD COLUMN has_user_account BOOLEAN DEFAULT FALSE;
    `);

    // 2. Adicionar coluna em users
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN tecnico_id UUID NULL;
    `);

    // 3. Criar foreign key
    await queryRunner.query(`
      ALTER TABLE users 
      ADD CONSTRAINT fk_users_tecnico 
      FOREIGN KEY (tecnico_id) 
      REFERENCES tecnicos(id) 
      ON DELETE SET NULL;
    `);

    // 4. Criar índice
    await queryRunner.query(`
      CREATE INDEX idx_users_tecnico_id ON users(tecnico_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_users_tecnico_id;`);
    await queryRunner.query(`ALTER TABLE users DROP CONSTRAINT fk_users_tecnico;`);
    await queryRunner.query(`ALTER TABLE users DROP COLUMN tecnico_id;`);
    await queryRunner.query(`ALTER TABLE tecnicos DROP COLUMN has_user_account;`);
    await queryRunner.query(`ALTER TABLE tecnicos DROP COLUMN email;`);
  }
}
```

---

## 📡 Endpoints da API

### POST `/api/v1/tecnicos` - Cadastrar Técnico/Supervisor

#### Request (Supervisor):

```json
{
  "name": "Carlos Supervisor",
  "workday": "WDC00010",
  "cargo": "Gerente de Produção",
  "senioridade": "Supervisor",
  "area": "Produção",
  "shift": "ADM",
  "department": "Gestão de Produção",
  "gender": "M",
  "joinDate": "2026-01-10",
  "email": "carlos.supervisor@empresa.com",
  "password": "Senha@Segura123",
  "teamId": null,
  "subtimeId": null
}
```

#### Response:

```json
{
  "id": "tecnico-uuid-123",
  "name": "Carlos Supervisor",
  "workday": "WDC00010",
  "cargo": "Gerente de Produção",
  "senioridade": "Supervisor",
  "email": "carlos.supervisor@empresa.com",
  "hasUserAccount": true,
  "area": "Produção",
  "shift": "ADM",
  "department": "Gestão de Produção",
  "gender": "M",
  "joinDate": "2026-01-10",
  "status": true,
  "user": {
    "id": "user-uuid-456",
    "email": "carlos.supervisor@empresa.com",
    "name": "Carlos Supervisor",
    "role": "master"
  },
  "createdAt": "2026-03-19T15:30:00.000Z"
}
```

#### Request (Técnico comum):

```json
{
  "name": "João Técnico",
  "workday": "WDC00011",
  "cargo": "Técnico de Manutenção",
  "senioridade": "Pleno",
  "area": "Manutenção",
  "shift": "1T",
  "department": "Manutenção Elétrica",
  "gender": "M",
  "joinDate": "2026-02-01",
  "teamId": "team-uuid-789"
  // Sem email e password
}
```

---

## 🔐 Fluxo de Login

### 1. Login

**POST** `/api/v1/auth/login`

```json
{
  "email": "carlos.supervisor@empresa.com",
  "password": "Senha@Segura123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-456",
    "email": "carlos.supervisor@empresa.com",
    "name": "Carlos Supervisor",
    "role": "master",
    "tecnicoId": "tecnico-uuid-123",
    "tecnico": {
      "id": "tecnico-uuid-123",
      "name": "Carlos Supervisor",
      "senioridade": "Supervisor",
      "area": "Produção"
    }
  }
}
```

### 2. Verificar Perfil

**GET** `/api/v1/auth/me`

Headers: `Authorization: Bearer {token}`

**Response:**

```json
{
  "id": "user-uuid-456",
  "email": "carlos.supervisor@empresa.com",
  "name": "Carlos Supervisor",
  "role": "master",
  "tecnicoId": "tecnico-uuid-123",
  "tecnico": {
    "id": "tecnico-uuid-123",
    "name": "Carlos Supervisor",
    "senioridade": "Supervisor",
    "area": "Produção",
    "department": "Gestão de Produção"
  }
}
```

---

## 🎨 Integração Frontend

### 1. Formulário de Cadastro de Técnico

```typescript
interface CreateTecnicoForm {
  name: string;
  workday: string;
  cargo: string;
  senioridade: Senioridade;
  area: Area;
  shift: Shift;
  department: string;
  gender: Gender;
  joinDate: string;
  teamId?: string;
  subtimeId?: string;
  // Campos condicionais
  email?: string;
  password?: string;
}

// Lógica de validação
const isSupervisor = watchSenioridade === 'Supervisor';

// Validação do Yup/Zod
const schema = yup.object({
  // ... campos básicos
  email: yup.string()
    .when('senioridade', {
      is: 'Supervisor',
      then: yup.string()
        .required('E-mail é obrigatório para Supervisores')
        .email('E-mail inválido'),
      otherwise: yup.string().nullable(),
    }),
  password: yup.string()
    .when('senioridade', {
      is: 'Supervisor',
      then: yup.string()
        .required('Senha é obrigatória para Supervisores')
        .min(8, 'Senha deve ter no mínimo 8 caracteres'),
      otherwise: yup.string().nullable(),
    }),
});
```

### 2. Renderização Condicional

```tsx
{/* Campos básicos sempre visíveis */}
<Input name="name" label="Nome Completo" />
<Input name="workday" label="Matrícula" />
<Input name="cargo" label="Cargo" />
<Select name="senioridade" label="Senioridade" options={senioridadeOptions} />

{/* Campos condicionais para Supervisor */}
{isSupervisor && (
  <>
    <Input 
      name="email" 
      label="E-mail do Supervisor" 
      type="email"
      required
      placeholder="supervisor@empresa.com"
    />
    <Input 
      name="password" 
      label="Senha" 
      type="password"
      required
      placeholder="Mínimo 8 caracteres"
    />
    <Alert>
      ℹ️ Ao cadastrar um Supervisor, uma conta de usuário será criada automaticamente 
      com as credenciais informadas.
    </Alert>
  </>
)}

{/* Resto dos campos */}
<Select name="area" label="Área" options={areaOptions} />
// ...
```

### 3. Filtros por Supervisor

```typescript
// Store/Context
interface AuthState {
  user: User;
  isSupervisor: boolean; // user.tecnicoId !== null
  supervisorId: string | null; // user.tecnicoId
}

// Hook
const useAuth = () => {
  const { user } = useAuthContext();
  
  return {
    user,
    isSupervisor: !!user.tecnicoId,
    supervisorId: user.tecnicoId || null,
    isAdmin: !user.tecnicoId, // Admin não tem tecnicoId
  };
};

// Uso em páginas
const TeamsPage = () => {
  const { isSupervisor } = useAuth();
  
  // API já filtra automaticamente com base no token JWT
  const { data: teams } = useQuery(['teams'], () => 
    api.get('/teams') // Backend usa o userId do token
  );
  
  return (
    <div>
      {isSupervisor ? (
        <h1>Meus Times</h1>
      ) : (
        <h1>Todos os Times</h1>
      )}
      {/* ... */}
    </div>
  );
};
```

---

## ✅ Checklist de Implementação

### Backend

- [ ] **Migration:**
  - [ ] Criar migration `AddSupervisorAccounts`
  - [ ] Executar migration no banco

- [ ] **Entities:**
  - [ ] Adicionar `tecnicoId` em `User.entity.ts`
  - [ ] Adicionar `email` e `hasUserAccount` em `Tecnico.entity.ts`
  - [ ] Criar relacionamento OneToOne entre User ↔ Tecnico

- [ ] **DTOs:**
  - [ ] Adicionar `email` e `password` em `CreateTecnicoDto`
  - [ ] Adicionar validações condicionais (`ValidateIf`)

- [ ] **Services:**
  - [ ] Atualizar `TecnicosService.create()` para criar User quando supervisor
  - [ ] Injetar `UsersRepository` no `TecnicosService`
  - [ ] Implementar lógica de filtro em `TeamsService.findAll()`
  - [ ] Implementar lógica de filtro em `SubTimesService.findAll()`
  - [ ] Implementar lógica de filtro em `TecnicosService.findAll()`

- [ ] **Modules:**
  - [ ] Adicionar `User` no `TypeOrmModule.forFeature()` do `TecnicosModule`

- [ ] **Controllers:**
  - [ ] Adicionar `@GetUser('id')` nos endpoints que precisam filtrar

- [ ] **Auth:**
  - [ ] Atualizar `AuthService.validateUser()` para incluir relação `tecnico`
  - [ ] Atualizar payload do JWT para incluir `tecnicoId`

### Frontend

- [ ] **Forms:**
  - [ ] Adicionar campos `email` e `password` no formulário de técnico
  - [ ] Renderizar condicionalmente quando `senioridade === 'Supervisor'`
  - [ ] Adicionar validações Yup/Zod condicionais

- [ ] **Auth:**
  - [ ] Atualizar interface `User` para incluir `tecnicoId` e `tecnico`
  - [ ] Criar helper `isSupervisor()` baseado em `tecnicoId`

- [ ] **UI:**
  - [ ] Mostrar badge "Supervisor" quando `hasUserAccount === true`
  - [ ] Ajustar títulos das páginas (Admin vê "Todos", Supervisor vê "Meus")

- [ ] **Hooks:**
  - [ ] Criar `useAuth()` com flags `isSupervisor` e `isAdmin`

---

## 🔒 Segurança

### Validações Importantes

1. **E-mail único:** Verificar se e-mail já existe antes de criar User
2. **Senha forte:** Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
3. **Transaction:** Usar transaction ao criar Tecnico + User simultaneamente

```typescript
async create(createTecnicoDto: CreateTecnicoDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Criar técnico
    const tecnico = await queryRunner.manager.save(Tecnico, { ... });
    
    // Criar user se supervisor
    if (isSupervisor) {
      const user = await queryRunner.manager.save(User, { 
        tecnicoId: tecnico.id,
        ...
      });
      tecnico.hasUserAccount = true;
      await queryRunner.manager.save(tecnico);
    }

    await queryRunner.commitTransaction();
    return tecnico;
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

---

## 📊 Exemplos de Uso

### Cenário 1: Admin cadastra Supervisor

```bash
# Admin faz login
POST /auth/login
{ "email": "admin@skillfix.com", "password": "Admin@123" }

# Admin cadastra supervisor
POST /tecnicos
{
  "name": "Maria Supervisora",
  "senioridade": "Supervisor",
  "email": "maria@empresa.com",
  "password": "Maria@2026",
  ...
}

# Sistema cria:
# 1. Tecnico (id: abc-123)
# 2. User (id: def-456, tecnicoId: abc-123)
```

### Cenário 2: Supervisor faz login e cria time

```bash
# Supervisor faz login
POST /auth/login
{ "email": "maria@empresa.com", "password": "Maria@2026" }
# Recebe token com tecnicoId: abc-123

# Supervisor cria time
POST /teams
{
  "name": "Time Alpha",
  "supervisorId": "abc-123", # ID do próprio técnico
  ...
}

# Supervisor lista times - vê APENAS times dele
GET /teams
Authorization: Bearer {token}
# Backend filtra: WHERE supervisorId = abc-123
```

### Cenário 3: Supervisor cadastra outro Supervisor

```bash
# Supervisor logado com token
POST /tecnicos
{
  "name": "João Supervisor",
  "senioridade": "Supervisor",
  "email": "joao@empresa.com",
  "password": "Joao@2026",
  ...
}
# Sistema permite - role = MASTER
```

---

## 🎯 Resultado Final

✅ **Admin:**
- Vê todos os times, técnicos, avaliações
- Pode cadastrar supervisores
- Acesso total

✅ **Supervisor:**
- Vê apenas seus times e sub-times
- Vê apenas técnicos dos seus times
- Pode criar times, técnicos, avaliações
- Pode cadastrar outros supervisores
- Sistema "vazio" ao fazer primeiro login

✅ **Isolamento:**
- Cada supervisor gerencia apenas seus recursos
- Sem necessidade de aprovação do admin

---

## 📞 Próximos Passos

1. Implementar backend conforme checklist
2. Testar migration em ambiente de desenvolvimento
3. Implementar frontend conforme exemplos
4. Testar fluxo completo:
   - Admin cadastra Supervisor A
   - Supervisor A faz login
   - Supervisor A cria Time 1
   - Supervisor A cadastra Supervisor B
   - Supervisor B faz login
   - Supervisor B cria Time 2
   - Verificar que A só vê Time 1 e B só vê Time 2

---

**Dúvidas?** Consulte os exemplos de código nesta documentação ou entre em contato.
