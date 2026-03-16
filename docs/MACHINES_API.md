# 🏭 MACHINES API - Gestão de Máquinas

## 📋 Visão Geral

Módulo para cadastro e gestão de máquinas/equipamentos industriais, vinculadas a times específicos e servindo como base para competências técnicas.

---

## 🗄️ Entidade: Machine (TypeORM)

```typescript
// src/modules/machines/entities/machine.entity.ts
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
import { Skill } from '../../skills/entities/skill.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string; // Código único da máquina (ex: "MAQ-001")

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  teamId: string;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ type: 'varchar', nullable: true })
  manufacturer?: string; // Fabricante

  @Column({ type: 'varchar', nullable: true })
  model?: string; // Modelo

  @Column({ type: 'date', nullable: true })
  installationDate?: Date; // Data de instalação

  @Column({ default: true })
  status: boolean;

  @OneToMany(() => Skill, (skill) => skill.machine)
  skills: Skill[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📥 DTOs

```typescript
// src/modules/machines/dto/create-machine.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 'Torno CNC 5 Eixos' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MAQ-001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^MAQ-\d{3,}$/, {
    message: 'Código deve seguir o formato MAQ-XXX',
  })
  code: string;

  @ApiProperty({ example: 'Torno CNC de 5 eixos para usinagem de precisão', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'team-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ example: 'Haas Automation', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 'VF-2SS', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: '2020-03-15', required: false })
  @IsDateString()
  @IsOptional()
  installationDate?: string;
}

// src/modules/machines/dto/update-machine.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMachineDto } from './create-machine.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMachineDto extends PartialType(CreateMachineDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}

// src/modules/machines/dto/query-machine.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class QueryMachineDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  status?: boolean;
}
```

---

## 🎮 Controller

```typescript
// src/modules/machines/machines.controller.ts
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
import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachineDto } from './dto/query-machine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Machines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar nova máquina' })
  @ApiResponse({ status: 201, description: 'Máquina criada com sucesso' })
  @ApiResponse({ status: 409, description: 'Código de máquina já existe' })
  create(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.create(createMachineDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar máquinas com filtros' })
  @ApiResponse({ status: 200, description: 'Lista de máquinas' })
  findAll(@Query() query: QueryMachineDto) {
    return this.machinesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar máquina por ID' })
  @ApiResponse({ status: 200, description: 'Máquina encontrada' })
  @ApiResponse({ status: 404, description: 'Máquina não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.machinesService.findOne(id);
  }

  @Get(':id/skills')
  @ApiOperation({ summary: 'Listar skills associadas à máquina' })
  getSkills(@Param('id', ParseUUIDPipe) id: string) {
    return this.machinesService.getSkills(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar máquina' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machinesService.update(id, updateMachineDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar máquina (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.machinesService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/machines/machines.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachineDto } from './dto/query-machine.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    // Verificar se código já existe
    const existingMachine = await this.machinesRepository.findOne({
      where: { code: createMachineDto.code },
    });

    if (existingMachine) {
      throw new ConflictException(
        `Máquina com código ${createMachineDto.code} já existe`,
      );
    }

    const machine = this.machinesRepository.create(createMachineDto);
    return this.machinesRepository.save(machine);
  }

  async findAll(query: QueryMachineDto): Promise<Machine[]> {
    const { search, teamId, status } = query;

    const queryBuilder = this.machinesRepository
      .createQueryBuilder('machine')
      .leftJoinAndSelect('machine.team', 'team')
      .leftJoinAndSelect('machine.skills', 'skills');

    if (search) {
      queryBuilder.andWhere(
        '(machine.name ILIKE :search OR machine.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (teamId) {
      queryBuilder.andWhere('machine.teamId = :teamId', { teamId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('machine.status = :status', { status });
    }

    queryBuilder.orderBy('machine.name', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Machine> {
    const machine = await this.machinesRepository.findOne({
      where: { id },
      relations: ['team', 'skills'],
    });

    if (!machine) {
      throw new NotFoundException(`Máquina com ID ${id} não encontrada`);
    }

    return machine;
  }

  async getSkills(id: string) {
    const machine = await this.findOne(id);
    return machine.skills;
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<Machine> {
    const machine = await this.findOne(id);

    // Verificar conflito de código se estiver sendo alterado
    if (updateMachineDto.code && updateMachineDto.code !== machine.code) {
      const existingMachine = await this.machinesRepository.findOne({
        where: { code: updateMachineDto.code },
      });

      if (existingMachine) {
        throw new ConflictException(
          `Máquina com código ${updateMachineDto.code} já existe`,
        );
      }
    }

    Object.assign(machine, updateMachineDto);
    return this.machinesRepository.save(machine);
  }

  async remove(id: string): Promise<{ message: string }> {
    const machine = await this.findOne(id);
    machine.status = false;
    await this.machinesRepository.save(machine);
    return { message: 'Máquina desativada com sucesso' };
  }
}
```

---

## 🗃️ Migration

```typescript
// src/database/migrations/CreateMachinesTable.ts
import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateMachinesTable1234567893 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'machines',
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
            name: 'code',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'teamId',
            type: 'uuid',
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'model',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'installationDate',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'boolean',
            default: true,
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

    await queryRunner.createForeignKey(
      'machines',
      new TableForeignKey({
        columnNames: ['teamId'],
        referencedTableName: 'teams',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createIndex(
      'machines',
      new TableIndex({
        name: 'IDX_MACHINE_CODE',
        columnNames: ['code'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('machines');
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/machines` | Criar máquina | Master |
| GET | `/machines` | Listar máquinas | Todos |
| GET | `/machines/:id` | Buscar por ID | Todos |
| GET | `/machines/:id/skills` | Listar skills | Todos |
| PATCH | `/machines/:id` | Atualizar | Master |
| DELETE | `/machines/:id` | Desativar | Master |

---

## ✅ Checklist

- [ ] Criar entidade Machine
- [ ] Implementar validação de código único
- [ ] Criar migration
- [ ] Implementar filtros de busca
- [ ] Testar CRUD completo
- [ ] Validar relacionamento com Teams
