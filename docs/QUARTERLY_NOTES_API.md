# 📝 QUARTERLY NOTES API - Notas Trimestrais

## 📋 Visão Geral

Sistema de registro e gestão de notas/avaliações trimestrais dos colaboradores técnicos.

---

## 🗄️ Entidade: QuarterlyNote (TypeORM)

```typescript
// src/modules/quarterly-notes/entities/quarterly-note.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quarterly_notes')
export class QuarterlyNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  quarter: number; // 1, 2, 3 ou 4

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number; // Pontuação final (0-100)

  @Column({ type: 'date' })
  evaluatedDate: Date;

  @Column({ type: 'text' })
  notes: string; // Observações/comentários

  @Column()
  tecnicoId: string;

  @ManyToOne(() => Tecnico, (tecnico) => tecnico.quarterlyNotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: Tecnico;

  @Column({ nullable: true })
  evaluatorId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'evaluatorId' })
  evaluator?: User; // Supervisor que fez a avaliação

  @Column({ type: 'jsonb', default: {} })
  breakdown?: {
    [criterion: string]: number; // Detalhamento por critério
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📥 DTOs

```typescript
// src/modules/quarterly-notes/dto/create-quarterly-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  IsDateString,
  IsString,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateQuarterlyNoteDto {
  @ApiProperty({ example: 1, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  @IsNotEmpty()
  quarter: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 85.5, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  score: number;

  @ApiProperty({ example: '2024-03-31' })
  @IsDateString()
  @IsNotEmpty()
  evaluatedDate: string;

  @ApiProperty({ example: 'Excelente desempenho neste trimestre' })
  @IsString()
  @IsNotEmpty()
  notes: string;

  @ApiProperty({ example: 'tecnico-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  tecnicoId: string;

  @ApiProperty({ example: 'user-uuid-456', required: false })
  @IsUUID()
  @IsOptional()
  evaluatorId?: string;

  @ApiProperty({
    example: { quality: 90, productivity: 85, safety: 80 },
    required: false,
  })
  @IsObject()
  @IsOptional()
  breakdown?: Record<string, number>;
}

// src/modules/quarterly-notes/dto/update-quarterly-note.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateQuarterlyNoteDto } from './create-quarterly-note.dto';

export class UpdateQuarterlyNoteDto extends PartialType(CreateQuarterlyNoteDto) {}

// src/modules/quarterly-notes/dto/query-quarterly-note.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryQuarterlyNoteDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  tecnicoId?: string;

  @ApiProperty({ required: false, minimum: 1, maximum: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  quarter?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  evaluatorId?: string;
}
```

---

## 🎮 Controller

```typescript
// src/modules/quarterly-notes/quarterly-notes.controller.ts
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
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuarterlyNotesService } from './quarterly-notes.service';
import { CreateQuarterlyNoteDto } from './dto/create-quarterly-note.dto';
import { UpdateQuarterlyNoteDto } from './dto/update-quarterly-note.dto';
import { QueryQuarterlyNoteDto } from './dto/query-quarterly-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Quarterly Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quarterly-notes')
export class QuarterlyNotesController {
  constructor(private readonly quarterlyNotesService: QuarterlyNotesService) {}

  @Post()
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Criar nova nota trimestral' })
  create(@Body() createQuarterlyNoteDto: CreateQuarterlyNoteDto) {
    return this.quarterlyNotesService.create(createQuarterlyNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas trimestrais com filtros' })
  findAll(@Query() query: QueryQuarterlyNoteDto) {
    return this.quarterlyNotesService.findAll(query);
  }

  @Get('tecnico/:tecnicoId')
  @ApiOperation({ summary: 'Listar notas de um técnico específico' })
  findByTecnico(@Param('tecnicoId', ParseUUIDPipe) tecnicoId: string) {
    return this.quarterlyNotesService.findByTecnico(tecnicoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar nota trimestral por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.quarterlyNotesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Atualizar nota trimestral' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuarterlyNoteDto: UpdateQuarterlyNoteDto,
  ) {
    return this.quarterlyNotesService.update(id, updateQuarterlyNoteDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar nota trimestral' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.quarterlyNotesService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/quarterly-notes/quarterly-notes.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuarterlyNote } from './entities/quarterly-note.entity';
import { CreateQuarterlyNoteDto } from './dto/create-quarterly-note.dto';
import { UpdateQuarterlyNoteDto } from './dto/update-quarterly-note.dto';
import { QueryQuarterlyNoteDto } from './dto/query-quarterly-note.dto';

@Injectable()
export class QuarterlyNotesService {
  constructor(
    @InjectRepository(QuarterlyNote)
    private quarterlyNotesRepository: Repository<QuarterlyNote>,
  ) {}

  async create(createQuarterlyNoteDto: CreateQuarterlyNoteDto): Promise<QuarterlyNote> {
    // Verificar se já existe nota para este técnico/trimestre/ano
    const existing = await this.quarterlyNotesRepository.findOne({
      where: {
        tecnicoId: createQuarterlyNoteDto.tecnicoId,
        quarter: createQuarterlyNoteDto.quarter,
        year: createQuarterlyNoteDto.year,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe uma nota para este técnico neste trimestre',
      );
    }

    const note = this.quarterlyNotesRepository.create(createQuarterlyNoteDto);
    return this.quarterlyNotesRepository.save(note);
  }

  async findAll(query: QueryQuarterlyNoteDto): Promise<QuarterlyNote[]> {
    const { tecnicoId, quarter, year, evaluatorId } = query;

    const queryBuilder = this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.tecnico', 'tecnico')
      .leftJoinAndSelect('note.evaluator', 'evaluator');

    if (tecnicoId) {
      queryBuilder.andWhere('note.tecnicoId = :tecnicoId', { tecnicoId });
    }

    if (quarter) {
      queryBuilder.andWhere('note.quarter = :quarter', { quarter });
    }

    if (year) {
      queryBuilder.andWhere('note.year = :year', { year });
    }

    if (evaluatorId) {
      queryBuilder.andWhere('note.evaluatorId = :evaluatorId', { evaluatorId });
    }

    queryBuilder
      .orderBy('note.year', 'DESC')
      .addOrderBy('note.quarter', 'DESC');

    return queryBuilder.getMany();
  }

  async findByTecnico(tecnicoId: string): Promise<QuarterlyNote[]> {
    return this.quarterlyNotesRepository.find({
      where: { tecnicoId },
      relations: ['evaluator'],
      order: { year: 'DESC', quarter: 'DESC' },
    });
  }

  async findOne(id: string): Promise<QuarterlyNote> {
    const note = await this.quarterlyNotesRepository.findOne({
      where: { id },
      relations: ['tecnico', 'evaluator'],
    });

    if (!note) {
      throw new NotFoundException(`Nota trimestral com ID ${id} não encontrada`);
    }

    return note;
  }

  async update(
    id: string,
    updateQuarterlyNoteDto: UpdateQuarterlyNoteDto,
  ): Promise<QuarterlyNote> {
    const note = await this.findOne(id);
    Object.assign(note, updateQuarterlyNoteDto);
    return this.quarterlyNotesRepository.save(note);
  }

  async remove(id: string): Promise<{ message: string }> {
    const note = await this.findOne(id);
    await this.quarterlyNotesRepository.remove(note);
    return { message: 'Nota trimestral deletada com sucesso' };
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/quarterly-notes` | Criar nota | Master |
| GET | `/quarterly-notes` | Listar notas | Todos |
| GET | `/quarterly-notes/tecnico/:id` | Notas de técnico | Todos |
| GET | `/quarterly-notes/:id` | Buscar por ID | Todos |
| PATCH | `/quarterly-notes/:id` | Atualizar | Master |
| DELETE | `/quarterly-notes/:id` | Deletar | Master |
