# 🏢 TEAMS API - Gestão de Times

## 📋 Visão Geral

Módulo para gestão de times/equipes organizacionais, incluindo supervisores, membros e vinculação com sub-times.

---

## 🗄️ Entidade: Team (TypeORM)

```typescript
// src/modules/teams/entities/team.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubTeam } from '../../subtimes/entities/subteam.entity';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';
import { User } from '../../users/entities/user.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  department: string; // Ex: "Engenharia", "Manutenção"

  @Column()
  supervisorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'supervisorId' })
  supervisor: User;

  @Column({ nullable: true })
  managerId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: User;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  color?: string; // Cor hex para identificação visual

  @OneToMany(() => SubTeam, (subteam) => subteam.team)
  subtimes: SubTeam[];

  @OneToMany(() => Tecnico, (tecnico) => tecnico.team)
  tecnicos: Tecnico[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📥 DTOs

```typescript
// src/modules/teams/dto/create-team.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Time de Manutenção A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Responsável pela manutenção preventiva' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Manutenção' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'user-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  supervisorId: string;

  @ApiProperty({ example: 'user-uuid-456', required: false })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ example: '#3B82F6', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Cor deve ser hex válida' })
  color?: string;
}

// src/modules/teams/dto/update-team.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
```

---

## 🎮 Controller

```typescript
// src/modules/teams/teams.controller.ts
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
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Teams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar novo time' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os times' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar time por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.findOne(id);
  }

  @Get(':id/subtimes')
  @ApiOperation({ summary: 'Listar sub-times de um time' })
  getSubTimes(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getSubTimes(id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do time' })
  getMembers(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.getMembers(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar time' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar time' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teamsService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/teams/teams.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamsRepository.create(createTeamDto);
    return this.teamsRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find({
      relations: ['supervisor', 'manager', 'subtimes', 'tecnicos'],
      where: { status: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['supervisor', 'manager', 'subtimes', 'tecnicos'],
    });

    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado`);
    }

    return team;
  }

  async getSubTimes(id: string) {
    const team = await this.findOne(id);
    return team.subtimes;
  }

  async getMembers(id: string) {
    const team = await this.findOne(id);
    return team.tecnicos;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string): Promise<{ message: string }> {
    const team = await this.findOne(id);
    team.status = false;
    await this.teamsRepository.save(team);
    return { message: 'Time desativado com sucesso' };
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/teams` | Criar time | Master |
| GET | `/teams` | Listar times | Todos |
| GET | `/teams/:id` | Buscar por ID | Todos |
| GET | `/teams/:id/subtimes` | Listar sub-times | Todos |
| GET | `/teams/:id/members` | Listar membros | Todos |
| PATCH | `/teams/:id` | Atualizar time | Master |
| DELETE | `/teams/:id` | Desativar time | Master |
