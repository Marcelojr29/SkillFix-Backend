# 👥 TECNICOS API - Gestão de Colaboradores/Técnicos

## 📋 Visão Geral

Módulo responsável pela gestão completa de colaboradores técnicos, incluindo informações pessoais, vinculação a times/sub-times, competências técnicas, notas trimestrais e histórico de avaliações.

**Funcionalidades:**
- CRUD completo de técnicos
- Upload de foto de perfil
- Gestão de skills por técnico
- Vinculação a times e sub-times
- Histórico de avaliações
- Filtros avançados (turno, área, cargo, senioridade)
- Paginação e ordenação

---

## 🗄️ Entidade: Tecnico (TypeORM)

```typescript
// src/modules/tecnicos/entities/tecnico.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { SubTeam } from '../../subtimes/entities/subteam.entity';
import { QuarterlyNote } from '../../quarterly-notes/entities/quarterly-note.entity';
import { TecnicoSkill } from './tecnico-skill.entity';

export enum Shift {
  PRIMEIRO = '1T',
  SEGUNDO = '2T',
  TERCEIRO = '3T',
  ADMINISTRATIVO = 'ADM',
}

export enum Gender {
  MASCULINO = 'M',
  FEMININO = 'F',
  OUTRO = 'O',
}

export enum Area {
  PRODUCAO = 'Produção',
  MANUTENCAO = 'Manutenção',
  QUALIDADE = 'Qualidade',
  ENGENHARIA = 'Engenharia',
  LOGISTICA = 'Logística',
  ADMINISTRATIVA = 'Administrativa',
  OUTRO = 'Outro',
}

export enum Senioridade {
  AUXILIAR = 'Auxiliar',
  JUNIOR = 'Junior',
  PLENO = 'Pleno',
  SENIOR = 'Sênior',
  ESPECIALISTA = 'Especialista',
  COORDENADOR = 'Coordenador',
  SUPERVISOR = 'Supervisor',
}

@Entity('tecnicos')
export class Tecnico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Shift })
  workday: Shift;

  @Column()
  cargo: string; // Ex: "Engenheiro de Produção", "Técnico de Manutenção"

  @Column({ type: 'enum', enum: Senioridade })
  senioridade: Senioridade;

  @Column({ type: 'enum', enum: Area })
  area: Area;

  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @Column()
  department: string; // Departamento específico

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ nullable: true })
  photo?: string; // URL ou caminho do arquivo

  @Column({ type: 'date' })
  joinDate: Date; // Data de admissão

  @Column({ default: true })
  status: boolean; // true = ativo, false = inativo

  // Relacionamentos
  @Column({ nullable: true })
  teamId?: string;

  @ManyToOne(() => Team, (team) => team.tecnicos, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: Team;

  @Column({ nullable: true })
  subtimeId?: string;

  @ManyToOne(() => SubTeam, (subtime) => subtime.tecnicos, { nullable: true })
  @JoinColumn({ name: 'subtimeId' })
  subtime?: SubTeam;

  // Skills do técnico (relacionamento many-to-many através de TecnicoSkill)
  @OneToMany(() => TecnicoSkill, (tecnicoSkill) => tecnicoSkill.tecnico, {
    cascade: true,
  })
  skills: TecnicoSkill[];

  // Notas trimestrais
  @OneToMany(() => QuarterlyNote, (note) => note.tecnico, { cascade: true })
  quarterlyNotes: QuarterlyNote[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entidade: TecnicoSkill (Tabela Intermediária)

```typescript
// src/modules/tecnicos/entities/tecnico-skill.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tecnico } from './tecnico.entity';
import { Skill } from '../../skills/entities/skill.entity';

@Entity('tecnico_skills')
export class TecnicoSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tecnicoId: string;

  @ManyToOne(() => Tecnico, (tecnico) => tecnico.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: Tecnico;

  @Column()
  skillId: string;

  @ManyToOne(() => Skill, { eager: true })
  @JoinColumn({ name: 'skillId' })
  skill: Skill;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number; // Pontuação de 0 a 100

  @Column({ type: 'text', nullable: true })
  notes?: string; // Observações sobre a competência

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📥 DTOs (Data Transfer Objects)

### Create Tecnico DTO

```typescript
// src/modules/tecnicos/dto/create-tecnico.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Shift, Gender, Area, Senioridade } from '../entities/tecnico.entity';

class SkillInput {
  @ApiProperty({ example: 'skill-id-123' })
  @IsUUID()
  skillId: string;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: 'Experiência em manutenção preventiva', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateTecnicoDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ enum: Shift, example: '1T' })
  @IsEnum(Shift)
  @IsNotEmpty()
  workday: Shift;

  @ApiProperty({ example: 'Técnico de Manutenção Elétrica' })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({ enum: Senioridade, example: 'Pleno' })
  @IsEnum(Senioridade)
  @IsNotEmpty()
  senioridade: Senioridade;

  @ApiProperty({ enum: Area, example: 'Manutenção' })
  @IsEnum(Area)
  @IsNotEmpty()
  area: Area;

  @ApiProperty({ enum: Shift, example: '1T' })
  @IsEnum(Shift)
  @IsNotEmpty()
  shift: Shift;

  @ApiProperty({ example: 'Manutenção Elétrica' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ enum: Gender, example: 'M' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '2020-01-15' })
  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  @ApiProperty({ example: 'team-id-123', required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ example: 'subtime-id-456', required: false })
  @IsUUID()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({ type: [SkillInput], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @IsOptional()
  skills?: SkillInput[];
}
```

### Update Tecnico DTO

```typescript
// src/modules/tecnicos/dto/update-tecnico.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTecnicoDto } from './create-tecnico.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTecnicoDto extends PartialType(CreateTecnicoDto) {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
```

### Query Tecnico DTO

```typescript
// src/modules/tecnicos/dto/query-tecnico.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Shift, Area, Senioridade } from '../entities/tecnico.entity';

export class QueryTecnicoDto {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string; // Busca por nome

  @ApiProperty({ enum: Shift, required: false })
  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;

  @ApiProperty({ enum: Area, required: false })
  @IsEnum(Area)
  @IsOptional()
  area?: Area;

  @ApiProperty({ enum: Senioridade, required: false })
  @IsEnum(Senioridade)
  @IsOptional()
  senioridade?: Senioridade;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({ required: false, default: true })
  @Type(() => Boolean)
  @IsOptional()
  status?: boolean;

  @ApiProperty({ required: false, enum: ['name', 'joinDate', 'senioridade'] })
  @IsString()
  @IsOptional()
  sortBy?: string = 'name';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
```

---

## 🎮 Controller

```typescript
// src/modules/tecnicos/tecnicos.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { TecnicosService } from './tecnicos.service';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Tecnicos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tecnicos')
export class TecnicosController {
  constructor(private readonly tecnicosService: TecnicosService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo técnico' })
  @ApiResponse({ status: 201, description: 'Técnico criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createTecnicoDto: CreateTecnicoDto) {
    return this.tecnicosService.create(createTecnicoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar técnicos com filtros e paginação' })
  @ApiResponse({ status: 200, description: 'Lista de técnicos' })
  findAll(@Query() query: QueryTecnicoDto) {
    return this.tecnicosService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar técnico por ID' })
  @ApiResponse({ status: 200, description: 'Técnico encontrado' })
  @ApiResponse({ status: 404, description: 'Técnico não encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar técnico' })
  @ApiResponse({ status: 200, description: 'Técnico atualizado' })
  @ApiResponse({ status: 404, description: 'Técnico não encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTecnicoDto: UpdateTecnicoDto,
  ) {
    return this.tecnicosService.update(id, updateTecnicoDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar técnico (soft delete)' })
  @ApiResponse({ status: 200, description: 'Técnico desativado' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.remove(id);
  }

  @Post(':id/photo')
  @Roles(UserRole.MASTER)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de foto do técnico' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.tecnicosService.uploadPhoto(id, file);
  }

  @Get(':id/skills')
  @ApiOperation({ summary: 'Listar skills do técnico' })
  @ApiResponse({ status: 200, description: 'Skills do técnico' })
  getSkills(@Param('id', ParseUUIDPipe) id: string) {
    return this.tecnicosService.getSkills(id);
  }

  @Patch(':id/skills/:skillId')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar score de uma skill' })
  updateSkillScore(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('skillId', ParseUUIDPipe) skillId: string,
    @Body() body: { score: number; notes?: string },
  ) {
    return this.tecnicosService.updateSkillScore(id, skillId, body.score, body.notes);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/tecnicos/tecnicos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Tecnico } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TecnicosService {
  constructor(
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
    @InjectRepository(TecnicoSkill)
    private tecnicoSkillsRepository: Repository<TecnicoSkill>,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto): Promise<Tecnico> {
    const { skills, ...tecnicoData } = createTecnicoDto;

    // Criar técnico
    const tecnico = this.tecnicosRepository.create(tecnicoData);
    const savedTecnico = await this.tecnicosRepository.save(tecnico);

    // Adicionar skills se fornecidas
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

  async findAll(query: QueryTecnicoDto) {
    const {
      page,
      limit,
      search,
      shift,
      area,
      senioridade,
      teamId,
      subtimeId,
      status,
      sortBy,
      sortOrder,
    } = query;

    const queryBuilder = this.tecnicosRepository
      .createQueryBuilder('tecnico')
      .leftJoinAndSelect('tecnico.team', 'team')
      .leftJoinAndSelect('tecnico.subtime', 'subtime')
      .leftJoinAndSelect('tecnico.skills', 'skills')
      .leftJoinAndSelect('skills.skill', 'skill')
      .leftJoinAndSelect('tecnico.quarterlyNotes', 'quarterlyNotes');

    // Filtros
    if (search) {
      queryBuilder.andWhere('tecnico.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (shift) {
      queryBuilder.andWhere('tecnico.shift = :shift', { shift });
    }

    if (area) {
      queryBuilder.andWhere('tecnico.area = :area', { area });
    }

    if (senioridade) {
      queryBuilder.andWhere('tecnico.senioridade = :senioridade', { senioridade });
    }

    if (teamId) {
      queryBuilder.andWhere('tecnico.teamId = :teamId', { teamId });
    }

    if (subtimeId) {
      queryBuilder.andWhere('tecnico.subtimeId = :subtimeId', { subtimeId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('tecnico.status = :status', { status });
    }

    // Ordenação
    queryBuilder.orderBy(`tecnico.${sortBy}`, sortOrder);

    // Paginação
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Tecnico> {
    const tecnico = await this.tecnicosRepository.findOne({
      where: { id },
      relations: ['team', 'subtime', 'skills', 'skills.skill', 'quarterlyNotes'],
    });

    if (!tecnico) {
      throw new NotFoundException(`Técnico com ID ${id} não encontrado`);
    }

    return tecnico;
  }

  async update(id: string, updateTecnicoDto: UpdateTecnicoDto): Promise<Tecnico> {
    const tecnico = await this.findOne(id);

    Object.assign(tecnico, updateTecnicoDto);
    await this.tecnicosRepository.save(tecnico);

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tecnico = await this.findOne(id);
    
    // Soft delete
    tecnico.status = false;
    await this.tecnicosRepository.save(tecnico);

    return { message: 'Técnico desativado com sucesso' };
  }

  async uploadPhoto(id: string, file: Express.Multer.File): Promise<Tecnico> {
    if (!file) {
      throw new BadRequestException('Arquivo não fornecido');
    }

    const tecnico = await this.findOne(id);

    // Salvar arquivo (exemplo simplificado - em produção usar S3, Cloudinary, etc)
    const uploadDir = './uploads/tecnicos';
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `${id}-${Date.now()}${path.extname(file.originalname)}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, file.buffer);

    tecnico.photo = `/uploads/tecnicos/${filename}`;
    await this.tecnicosRepository.save(tecnico);

    return tecnico;
  }

  async getSkills(id: string) {
    const tecnico = await this.findOne(id);
    return tecnico.skills;
  }

  async updateSkillScore(
    tecnicoId: string,
    skillId: string,
    score: number,
    notes?: string,
  ) {
    let tecnicoSkill = await this.tecnicoSkillsRepository.findOne({
      where: { tecnicoId, skillId },
    });

    if (!tecnicoSkill) {
      // Criar se não existir
      tecnicoSkill = this.tecnicoSkillsRepository.create({
        tecnicoId,
        skillId,
        score,
        notes,
      });
    } else {
      // Atualizar se existir
      tecnicoSkill.score = score;
      if (notes) tecnicoSkill.notes = notes;
    }

    return this.tecnicoSkillsRepository.save(tecnicoSkill);
  }
}
```

---

## 🗃️ Migration

```typescript
// src/database/migrations/CreateTecnicosTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateTecnicosTable1234567891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tecnicos',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'workday',
            type: 'enum',
            enum: ['1T', '2T', '3T', 'ADM'],
          },
          {
            name: 'cargo',
            type: 'varchar',
          },
          {
            name: 'senioridade',
            type: 'enum',
            enum: ['Auxiliar', 'Junior', 'Pleno', 'Sênior', 'Especialista', 'Coordenador', 'Supervisor'],
          },
          {
            name: 'area',
            type: 'enum',
            enum: ['Produção', 'Manutenção', 'Qualidade', 'Engenharia', 'Logística', 'Administrativa', 'Outro'],
          },
          {
            name: 'shift',
            type: 'enum',
            enum: ['1T', '2T', '3T', 'ADM'],
          },
          {
            name: 'department',
            type: 'varchar',
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['M', 'F', 'O'],
          },
          {
            name: 'photo',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'joinDate',
            type: 'date',
          },
          {
            name: 'status',
            type: 'boolean',
            default: true,
          },
          {
            name: 'teamId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'subtimeId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      'tecnicos',
      new TableForeignKey({
        columnNames: ['teamId'],
        referencedTableName: 'teams',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'tecnicos',
      new TableForeignKey({
        columnNames: ['subtimeId'],
        referencedTableName: 'subtimes',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'tecnicos',
      new TableIndex({
        name: 'IDX_TECNICO_NAME',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'tecnicos',
      new TableIndex({
        name: 'IDX_TECNICO_TEAM',
        columnNames: ['teamId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tecnicos');
  }
}
```

---

## 📍 Endpoints Resumidos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/tecnicos` | Criar técnico | Master |
| GET | `/tecnicos` | Listar técnicos (filtros, paginação) | Todos |
| GET | `/tecnicos/:id` | Buscar por ID | Todos |
| PATCH | `/tecnicos/:id` | Atualizar técnico | Master |
| DELETE | `/tecnicos/:id` | Desativar técnico | Master |
| POST | `/tecnicos/:id/photo` | Upload foto | Master |
| GET | `/tecnicos/:id/skills` | Listar skills | Todos |
| PATCH | `/tecnicos/:id/skills/:skillId` | Atualizar skill score | Master |

---

## ✅ Checklist de Implementação

- [ ] Criar entidades Tecnico e TecnicoSkill
- [ ] Criar DTOs com validação
- [ ] Implementar service com lógica de negócio
- [ ] Criar controller com Swagger
- [ ] Configurar upload de arquivos (Multer)
- [ ] Criar migrations
- [ ] Implementar filtros e paginação
- [ ] Adicionar relacionamentos com Teams/SubTimes
- [ ] Testar CRUD completo
- [ ] Testar upload de foto
- [ ] Testar gestão de skills
