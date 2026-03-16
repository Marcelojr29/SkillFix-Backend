# 🎯 SKILLS API - Gestão de Competências Técnicas

## 📋 Visão Geral

Módulo para cadastro e gestão de competências técnicas (skills) associadas a máquinas, times e sub-times específicos.

---

## 🗄️ Entidade: Skill (TypeORM)

```typescript
// src/modules/skills/entities/skill.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Machine } from '../../machines/entities/machine.entity';
import { Team } from '../../teams/entities/team.entity';
import { SubTeam } from '../../subtimes/entities/subteam.entity';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string; // Categoria (geralmente nome da máquina)

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  machineId: string;

  @ManyToOne(() => Machine, (machine) => machine.skills)
  @JoinColumn({ name: 'machineId' })
  machine: Machine;

  @Column()
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column()
  subtimeId: string;

  @ManyToOne(() => SubTeam)
  @JoinColumn({ name: 'subtimeId' })
  subtime: SubTeam;

  @Column({ type: 'varchar', nullable: true })
  level?: string; // Ex: "Básico", "Intermediário", "Avançado"

  @Column({ type: 'jsonb', default: [] })
  requirements?: string[]; // Requisitos para a skill

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📥 DTOs

```typescript
// src/modules/skills/dto/create-skill.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export enum SkillLevel {
  BASICO = 'Básico',
  INTERMEDIARIO = 'Intermediário',
  AVANCADO = 'Avançado',
  ESPECIALISTA = 'Especialista',
}

export class CreateSkillDto {
  @ApiProperty({ example: 'Operação de Torno CNC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Usinagem CNC' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 'Capacidade de operar torno CNC com programação básica',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'machine-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  machineId: string;

  @ApiProperty({ example: 'team-uuid-456' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ example: 'subtime-uuid-789' })
  @IsUUID()
  @IsNotEmpty()
  subtimeId: string;

  @ApiProperty({ enum: SkillLevel, required: false })
  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @ApiProperty({
    example: ['Conhecimento em programação G-code', 'Leitura de desenho técnico'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];
}

// src/modules/skills/dto/update-skill.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSkillDto extends PartialType(CreateSkillDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

// src/modules/skills/dto/query-skill.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { SkillLevel } from './create-skill.dto';

export class QuerySkillDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  machineId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({ enum: SkillLevel, required: false })
  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  status?: boolean;
}
```

---

## 🎮 Controller

```typescript
// src/modules/skills/skills.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { QuerySkillDto } from './dto/query-skill.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Skills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar nova skill' })
  @ApiResponse({ status: 201, description: 'Skill criada com sucesso' })
  create(@Body() createSkillDto: CreateSkillDto) {
    return this.skillsService.create(createSkillDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar skills com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de skills' })
  findAll(@Query() query: QuerySkillDto) {
    return this.skillsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar skill por ID' })
  @ApiResponse({ status: 200, description: 'Skill encontrada' })
  @ApiResponse({ status: 404, description: 'Skill não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.findOne(id);
  }

  @Get('machine/:machineId')
  @ApiOperation({ summary: 'Listar skills de uma máquina específica' })
  findByMachine(@Param('machineId', ParseUUIDPipe) machineId: string) {
    return this.skillsService.findByMachine(machineId);
  }

  @Get('subtime/:subtimeId')
  @ApiOperation({ summary: 'Listar skills de um sub-time específico' })
  findBySubTime(@Param('subtimeId', ParseUUIDPipe) subtimeId: string) {
    return this.skillsService.findBySubTime(subtimeId);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar skill' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar skill (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.skillsService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/skills/skills.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { QuerySkillDto } from './dto/query-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillsRepository: Repository<Skill>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillsRepository.create(createSkillDto);
    return this.skillsRepository.save(skill);
  }

  async findAll(query: QuerySkillDto): Promise<Skill[]> {
    const { search, machineId, teamId, subtimeId, level, status } = query;

    const queryBuilder = this.skillsRepository
      .createQueryBuilder('skill')
      .leftJoinAndSelect('skill.machine', 'machine')
      .leftJoinAndSelect('skill.team', 'team')
      .leftJoinAndSelect('skill.subtime', 'subtime');

    if (search) {
      queryBuilder.andWhere(
        '(skill.name ILIKE :search OR skill.category ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (machineId) {
      queryBuilder.andWhere('skill.machineId = :machineId', { machineId });
    }

    if (teamId) {
      queryBuilder.andWhere('skill.teamId = :teamId', { teamId });
    }

    if (subtimeId) {
      queryBuilder.andWhere('skill.subtimeId = :subtimeId', { subtimeId });
    }

    if (level) {
      queryBuilder.andWhere('skill.level = :level', { level });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('skill.status = :status', { status });
    }

    queryBuilder.orderBy('skill.category', 'ASC').addOrderBy('skill.name', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillsRepository.findOne({
      where: { id },
      relations: ['machine', 'team', 'subtime'],
    });

    if (!skill) {
      throw new NotFoundException(`Skill com ID ${id} não encontrada`);
    }

    return skill;
  }

  async findByMachine(machineId: string): Promise<Skill[]> {
    return this.skillsRepository.find({
      where: { machineId, status: true },
      relations: ['team', 'subtime'],
    });
  }

  async findBySubTime(subtimeId: string): Promise<Skill[]> {
    return this.skillsRepository.find({
      where: { subtimeId, status: true },
      relations: ['machine', 'team'],
    });
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);
    Object.assign(skill, updateSkillDto);
    return this.skillsRepository.save(skill);
  }

  async remove(id: string): Promise<{ message: string }> {
    const skill = await this.findOne(id);
    skill.status = false;
    await this.skillsRepository.save(skill);
    return { message: 'Skill desativada com sucesso' };
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/skills` | Criar skill | Master |
| GET | `/skills` | Listar skills | Todos |
| GET | `/skills/:id` | Buscar por ID | Todos |
| GET | `/skills/machine/:machineId` | Listar por máquina | Todos |
| GET | `/skills/subtime/:subtimeId` | Listar por sub-time | Todos |
| PATCH | `/skills/:id` | Atualizar | Master |
| DELETE | `/skills/:id` | Desativar | Master |

---

## ✅ Checklist

- [ ] Criar entidade Skill
- [ ] Implementar relacionamentos
- [ ] Criar migration
- [ ] Implementar filtros avançados
- [ ] Testar CRUD completo
