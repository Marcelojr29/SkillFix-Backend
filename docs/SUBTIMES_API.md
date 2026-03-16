# 👥 SUBTIMES API - Gestão de Sub-Times

## 📋 Visão Geral

Módulo para gestão de sub-times dentro de times principais, incluindo funções específicas, critérios de avaliação e membros.

---

## 🗄️ Entidade: SubTeam (TypeORM)

```typescript
// src/modules/subtimes/entities/subteam.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';

@Entity('subtimes')
export class SubTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  parentTeamId: string;

  @ManyToOne(() => Team, (team) => team.subtimes)
  @JoinColumn({ name: 'parentTeamId' })
  team: Team;

  @Column({ nullable: true })
  coordenadorId?: string;

  @ManyToOne(() => Tecnico, { nullable: true })
  @JoinColumn({ name: 'coordenadorId' })
  coordenador?: Tecnico;

  @Column({ type: 'jsonb', default: [] })
  functions: {
    id: string;
    name: string;
    description: string;
    responsibilities: string[];
  }[];

  @Column({ type: 'jsonb', default: [] })
  evaluationCriteria: {
    id: string;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
  }[];

  @OneToMany(() => Tecnico, (tecnico) => tecnico.subtime)
  tecnicos: Tecnico[];

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
// src/modules/subtimes/dto/create-subteam.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class TeamFunctionDto {
  @ApiProperty({ example: 'func-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Operador de Linha' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Responsável pela operação da linha de produção' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['Operar máquinas', 'Registrar produção'] })
  @IsArray()
  responsibilities: string[];
}

class EvaluationCriteriaDto {
  @ApiProperty({ example: 'crit-456' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Qualidade' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Avaliação da qualidade do trabalho' })
  @IsString()
  description: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxScore: number;
}

export class CreateSubTeamDto {
  @ApiProperty({ example: 'Sub-time A - Linha 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Responsável pela linha de produção 1' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'team-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  parentTeamId: string;

  @ApiProperty({ example: 'tecnico-uuid-456', required: false })
  @IsUUID()
  @IsOptional()
  coordenadorId?: string;

  @ApiProperty({ type: [TeamFunctionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamFunctionDto)
  @IsOptional()
  functions?: TeamFunctionDto[];

  @ApiProperty({ type: [EvaluationCriteriaDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriteriaDto)
  @IsOptional()
  evaluationCriteria?: EvaluationCriteriaDto[];
}

// src/modules/subtimes/dto/update-subteam.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateSubTeamDto } from './create-subteam.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubTeamDto extends PartialType(CreateSubTeamDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
```

---

## 🎮 Controller

```typescript
// src/modules/subtimes/subtimes.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubTimesService } from './subtimes.service';
import { CreateSubTeamDto } from './dto/create-subteam.dto';
import { UpdateSubTeamDto } from './dto/update-subteam.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('SubTimes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subtimes')
export class SubTimesController {
  constructor(private readonly subTimesService: SubTimesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo sub-time' })
  create(@Body() createSubTeamDto: CreateSubTeamDto) {
    return this.subTimesService.create(createSubTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os sub-times' })
  findAll() {
    return this.subTimesService.findAll();
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Listar sub-times de um time específico' })
  findByTeam(@Param('teamId', ParseUUIDPipe) teamId: string) {
    return this.subTimesService.findByTeam(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar sub-time por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.findOne(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do sub-time' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.getMembers(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar sub-time' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubTeamDto: UpdateSubTeamDto,
  ) {
    return this.subTimesService.update(id, updateSubTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar sub-time' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subTimesService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/subtimes/subtimes.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubTeam } from './entities/subteam.entity';
import { CreateSubTeamDto } from './dto/create-subteam.dto';
import { UpdateSubTeamDto } from './dto/update-subteam.dto';

@Injectable()
export class SubTimesService {
  constructor(
    @InjectRepository(SubTeam)
    private subTimesRepository: Repository<SubTeam>,
  ) {}

  async create(createSubTeamDto: CreateSubTeamDto): Promise<SubTeam> {
    const subteam = this.subTimesRepository.create(createSubTeamDto);
    return this.subTimesRepository.save(subteam);
  }

  async findAll(): Promise<SubTeam[]> {
    return this.subTimesRepository.find({
      relations: ['team', 'coordenador', 'tecnicos'],
      where: { status: true },
      order: { name: 'ASC' },
    });
  }

  async findByTeam(teamId: string): Promise<SubTeam[]> {
    return this.subTimesRepository.find({
      where: { parentTeamId: teamId, status: true },
      relations: ['coordenador', 'tecnicos'],
    });
  }

  async findOne(id: string): Promise<SubTeam> {
    const subteam = await this.subTimesRepository.findOne({
      where: { id },
      relations: ['team', 'coordenador', 'tecnicos'],
    });

    if (!subteam) {
      throw new NotFoundException(`Sub-time com ID ${id} não encontrado`);
    }

    return subteam;
  }

  async getMembers(id: string) {
    const subteam = await this.findOne(id);
    return subteam.tecnicos;
  }

  async update(id: string, updateSubTeamDto: UpdateSubTeamDto): Promise<SubTeam> {
    const subteam = await this.findOne(id);
    Object.assign(subteam, updateSubTeamDto);
    return this.subTimesRepository.save(subteam);
  }

  async remove(id: string): Promise<{ message: string }> {
    const subteam = await this.findOne(id);
    subteam.status = false;
    await this.subTimesRepository.save(subteam);
    return { message: 'Sub-time desativado com sucesso' };
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/subtimes` | Criar sub-time | Master |
| GET | `/subtimes` | Listar sub-times | Todos |
| GET | `/subtimes/team/:teamId` | Listar por time | Todos |
| GET | `/subtimes/:id` | Buscar por ID | Todos |
| GET | `/subtimes/:id/members` | Listar membros | Todos |
| PATCH | `/subtimes/:id` | Atualizar | Master |
| DELETE | `/subtimes/:id` | Desativar | Master |
