# ⭐ EVALUATIONS API - Sistema de Avaliações

## 📋 Visão Geral

Sistema completo de avaliações periódicas dos colaboradores técnicos com múltiplos critérios, comentários e workflow de aprovação.

---

## 🗄️ Entidade: Evaluation (TypeORM)

```typescript
// src/modules/evaluations/entities/evaluation.entity.ts
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
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';
import { User } from '../../users/entities/user.entity';
import { EvaluationCriterion } from './evaluation-criterion.entity';

export enum EvaluationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum EvaluationType {
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  PROBATION = 'probation',
  SPECIAL = 'special',
}

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EvaluationType,
    default: EvaluationType.QUARTERLY,
  })
  type: EvaluationType;

  @Column({ type: 'int' })
  quarter: number; // 1, 2, 3 ou 4

  @Column({ type: 'int' })
  year: number;

  @Column()
  tecnicoId: string;

  @ManyToOne(() => Tecnico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: Tecnico;

  @Column()
  evaluatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'evaluatorId' })
  evaluator: User;

  @Column({ nullable: true })
  approverId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approverId' })
  approver?: User;

  @Column({
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.DRAFT,
  })
  status: EvaluationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalScore: number;

  @Column({ type: 'text', nullable: true })
  generalComments?: string;

  @Column({ type: 'text', nullable: true })
  strengths?: string; // Pontos fortes

  @Column({ type: 'text', nullable: true })
  improvements?: string; // Pontos de melhoria

  @Column({ type: 'text', nullable: true })
  goals?: string; // Metas para próximo período

  @Column({ type: 'date', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'date', nullable: true })
  approvedAt?: Date;

  @OneToMany(() => EvaluationCriterion, (criterion) => criterion.evaluation, {
    cascade: true,
  })
  criteria: EvaluationCriterion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Entidade: EvaluationCriterion (Critérios de Avaliação)

```typescript
// src/modules/evaluations/entities/evaluation-criterion.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Evaluation } from './evaluation.entity';

@Entity('evaluation_criteria')
export class EvaluationCriterion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  evaluationId: string;

  @ManyToOne(() => Evaluation, (evaluation) => evaluation.criteria, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'evaluationId' })
  evaluation: Evaluation;

  @Column()
  name: string; // Ex: "Qualidade do Trabalho", "Produtividade", "Segurança"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // Peso percentual (ex: 25 = 25%)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number; // Pontuação obtida (0-100)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number; // Pontuação máxima

  @Column({ type: 'text', nullable: true })
  comments?: string;
}
```

---

## 📥 DTOs

### Create Evaluation DTO

```typescript
// src/modules/evaluations/dto/create-evaluation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsString,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationType } from '../entities/evaluation.entity';

export class CriterionInput {
  @ApiProperty({ example: 'Qualidade do Trabalho' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiProperty({ example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreateEvaluationDto {
  @ApiProperty({ enum: EvaluationType })
  @IsEnum(EvaluationType)
  @IsNotEmpty()
  type: EvaluationType;

  @ApiProperty({ example: 1, minimum: 1, maximum: 4 })
  @IsInt()
  @Min(1)
  @Max(4)
  @IsNotEmpty()
  quarter: number;

  @ApiProperty({ example: 2024 })
  @IsInt()
  @Min(2020)
  @IsNotEmpty()
  year: number;

  @ApiProperty({ example: 'tecnico-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  tecnicoId: string;

  @ApiProperty({ example: 'user-uuid-456' })
  @IsUUID()
  @IsNotEmpty()
  evaluatorId: string;

  @ApiProperty({ type: [CriterionInput] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionInput)
  criteria: CriterionInput[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  generalComments?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  strengths?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  improvements?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  goals?: string;
}

// src/modules/evaluations/dto/update-evaluation.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEvaluationDto } from './create-evaluation.dto';

export class UpdateEvaluationDto extends PartialType(CreateEvaluationDto) {}

// src/modules/evaluations/dto/query-evaluation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationStatus, EvaluationType } from '../entities/evaluation.entity';

export class QueryEvaluationDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  tecnicoId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  evaluatorId?: string;

  @ApiProperty({ required: false, enum: EvaluationStatus })
  @IsEnum(EvaluationStatus)
  @IsOptional()
  status?: EvaluationStatus;

  @ApiProperty({ required: false, enum: EvaluationType })
  @IsEnum(EvaluationType)
  @IsOptional()
  type?: EvaluationType;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  quarter?: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  year?: number;
}

// src/modules/evaluations/dto/submit-evaluation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitEvaluationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  finalComments: string;
}

// src/modules/evaluations/dto/approve-evaluation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ApproveEvaluationDto {
  @ApiProperty()
  @IsBoolean()
  approved: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comments?: string;
}
```

---

## 🎮 Controller

```typescript
// src/modules/evaluations/evaluations.controller.ts
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
import { EvaluationsService } from './evaluations.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { QueryEvaluationDto } from './dto/query-evaluation.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { ApproveEvaluationDto } from './dto/approve-evaluation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post()
  @Roles(UserRole.MASTER, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Criar nova avaliação' })
  create(@Body() createEvaluationDto: CreateEvaluationDto) {
    return this.evaluationsService.create(createEvaluationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar avaliações com filtros' })
  findAll(@Query() query: QueryEvaluationDto) {
    return this.evaluationsService.findAll(query);
  }

  @Get('tecnico/:tecnicoId')
  @ApiOperation({ summary: 'Listar avaliações de um técnico' })
  findByTecnico(@Param('tecnicoId', ParseUUIDPipe) tecnicoId: string) {
    return this.evaluationsService.findByTecnico(tecnicoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.evaluationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.MASTER, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Atualizar avaliação (apenas draft)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEvaluationDto: UpdateEvaluationDto,
  ) {
    return this.evaluationsService.update(id, updateEvaluationDto);
  }

  @Post(':id/submit')
  @Roles(UserRole.MASTER, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'Submeter avaliação para aprovação' })
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() submitDto: SubmitEvaluationDto,
  ) {
    return this.evaluationsService.submit(id, submitDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Aprovar ou rejeitar avaliação' })
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() approveDto: ApproveEvaluationDto,
  ) {
    return this.evaluationsService.approve(id, approveDto);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Deletar avaliação' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.evaluationsService.remove(id);
  }
}
```

---

## ⚙️ Service

```typescript
// src/modules/evaluations/evaluations.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation, EvaluationStatus } from './entities/evaluation.entity';
import { EvaluationCriterion } from './entities/evaluation-criterion.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { UpdateEvaluationDto } from './dto/update-evaluation.dto';
import { QueryEvaluationDto } from './dto/query-evaluation.dto';
import { SubmitEvaluationDto } from './dto/submit-evaluation.dto';
import { ApproveEvaluationDto } from './dto/approve-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationCriterion)
    private criteriaRepository: Repository<EvaluationCriterion>,
  ) {}

  async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
    // Verificar se já existe avaliação para este técnico/período
    const existing = await this.evaluationsRepository.findOne({
      where: {
        tecnicoId: createEvaluationDto.tecnicoId,
        quarter: createEvaluationDto.quarter,
        year: createEvaluationDto.year,
        type: createEvaluationDto.type,
      },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe uma avaliação para este técnico neste período',
      );
    }

    // Calcular score total baseado nos critérios
    const totalScore = this.calculateTotalScore(createEvaluationDto.criteria);

    const evaluation = this.evaluationsRepository.create({
      ...createEvaluationDto,
      totalScore,
      status: EvaluationStatus.DRAFT,
    });

    const savedEvaluation = await this.evaluationsRepository.save(evaluation);

    // Criar critérios
    const criteria = createEvaluationDto.criteria.map((criterion) =>
      this.criteriaRepository.create({
        ...criterion,
        evaluationId: savedEvaluation.id,
      }),
    );

    await this.criteriaRepository.save(criteria);

    return this.findOne(savedEvaluation.id);
  }

  async findAll(query: QueryEvaluationDto): Promise<Evaluation[]> {
    const { tecnicoId, evaluatorId, status, type, quarter, year } = query;

    const queryBuilder = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.tecnico', 'tecnico')
      .leftJoinAndSelect('evaluation.evaluator', 'evaluator')
      .leftJoinAndSelect('evaluation.approver', 'approver')
      .leftJoinAndSelect('evaluation.criteria', 'criteria');

    if (tecnicoId) {
      queryBuilder.andWhere('evaluation.tecnicoId = :tecnicoId', { tecnicoId });
    }

    if (evaluatorId) {
      queryBuilder.andWhere('evaluation.evaluatorId = :evaluatorId', {
        evaluatorId,
      });
    }

    if (status) {
      queryBuilder.andWhere('evaluation.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('evaluation.type = :type', { type });
    }

    if (quarter) {
      queryBuilder.andWhere('evaluation.quarter = :quarter', { quarter });
    }

    if (year) {
      queryBuilder.andWhere('evaluation.year = :year', { year });
    }

    queryBuilder
      .orderBy('evaluation.year', 'DESC')
      .addOrderBy('evaluation.quarter', 'DESC');

    return queryBuilder.getMany();
  }

  async findByTecnico(tecnicoId: string): Promise<Evaluation[]> {
    return this.evaluationsRepository.find({
      where: { tecnicoId },
      relations: ['evaluator', 'approver', 'criteria'],
      order: { year: 'DESC', quarter: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Evaluation> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
      relations: ['tecnico', 'evaluator', 'approver', 'criteria'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    return evaluation;
  }

  async update(
    id: string,
    updateEvaluationDto: UpdateEvaluationDto,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.DRAFT) {
      throw new BadRequestException(
        'Apenas avaliações em rascunho podem ser editadas',
      );
    }

    // Recalcular score se critérios mudaram
    if (updateEvaluationDto.criteria) {
      updateEvaluationDto['totalScore'] = this.calculateTotalScore(
        updateEvaluationDto.criteria,
      );

      // Atualizar critérios
      await this.criteriaRepository.delete({ evaluationId: id });
      const criteria = updateEvaluationDto.criteria.map((criterion) =>
        this.criteriaRepository.create({
          ...criterion,
          evaluationId: id,
        }),
      );
      await this.criteriaRepository.save(criteria);
    }

    Object.assign(evaluation, updateEvaluationDto);
    return this.evaluationsRepository.save(evaluation);
  }

  async submit(
    id: string,
    submitDto: SubmitEvaluationDto,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.DRAFT) {
      throw new BadRequestException('Avaliação já foi submetida');
    }

    evaluation.status = EvaluationStatus.SUBMITTED;
    evaluation.submittedAt = new Date();
    evaluation.generalComments = submitDto.finalComments;

    return this.evaluationsRepository.save(evaluation);
  }

  async approve(
    id: string,
    approveDto: ApproveEvaluationDto,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.SUBMITTED) {
      throw new BadRequestException('Avaliação não está pendente de aprovação');
    }

    evaluation.status = approveDto.approved
      ? EvaluationStatus.APPROVED
      : EvaluationStatus.REJECTED;
    evaluation.approvedAt = new Date();

    if (approveDto.comments) {
      evaluation.generalComments += `\n\n[Aprovador] ${approveDto.comments}`;
    }

    return this.evaluationsRepository.save(evaluation);
  }

  async remove(id: string): Promise<{ message: string }> {
    const evaluation = await this.findOne(id);
    await this.evaluationsRepository.remove(evaluation);
    return { message: 'Avaliação deletada com sucesso' };
  }

  private calculateTotalScore(criteria: any[]): number {
    let totalScore = 0;
    criteria.forEach((criterion) => {
      const weightedScore = (criterion.score / criterion.maxScore) * criterion.weight;
      totalScore += weightedScore;
    });
    return totalScore;
  }
}
```

---

## 📍 Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/evaluations` | Criar avaliação | Master/Supervisor |
| GET | `/evaluations` | Listar avaliações | Todos |
| GET | `/evaluations/tecnico/:id` | Avaliações de técnico | Todos |
| GET | `/evaluations/:id` | Buscar por ID | Todos |
| PATCH | `/evaluations/:id` | Atualizar (draft) | Master/Supervisor |
| POST | `/evaluations/:id/submit` | Submeter para aprovação | Master/Supervisor |
| POST | `/evaluations/:id/approve` | Aprovar/Rejeitar | Master |
| DELETE | `/evaluations/:id` | Deletar | Master |

---

## 🔄 Workflow de Avaliação

```
DRAFT → SUBMITTED → APPROVED
           ↓
       REJECTED (volta para DRAFT se necessário)
```

---

## ✅ Checklist de Implementação

- [ ] Criar entidades Evaluation e EvaluationCriterion
- [ ] Implementar DTOs com validação
- [ ] Criar controller com guards
- [ ] Implementar service com cálculos
- [ ] Adicionar workflow de aprovação
- [ ] Criar migration com foreign keys
- [ ] Integrar com QuarterlyNote após aprovação
- [ ] Adicionar notificações de status
- [ ] Implementar logs de auditoria
- [ ] Testes unitários e e2e
