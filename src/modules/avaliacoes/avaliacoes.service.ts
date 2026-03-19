import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation, EvaluationStatus } from './entities/evaluation.entity';
import { EvaluationCriterion } from './entities/evaluation-criterion.entity';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';
import { QueryAvaliacaoDto } from './dto/query-avaliacao.dto';
import {
  SubmitAvaliacaoDto,
  ReviewAvaliacaoDto,
} from './dto/action-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
    @InjectRepository(EvaluationCriterion)
    private criteriaRepository: Repository<EvaluationCriterion>,
  ) {}

  private calculateTotalScore(criteria: EvaluationCriterion[]): number {
    if (!criteria || criteria.length === 0) return 0;

    const totalScore = criteria.reduce((sum, criterion) => {
      // Média ponderada mantendo a escala original (0-5)
      const normalized = criterion.score; // já está na escala 0-maxScore
      const weightedScore = (normalized * criterion.weight) / 100;
      return sum + weightedScore;
    }, 0);

    return Math.round(totalScore * 100) / 100;
  }

  async create(createAvaliacaoDto: CreateAvaliacaoDto): Promise<Evaluation> {
    const { criteria, ...evaluationData } = createAvaliacaoDto;

    const evaluation = this.evaluationsRepository.create({
      ...evaluationData,
      status: EvaluationStatus.DRAFT,
    });

    const savedEvaluation = await this.evaluationsRepository.save(evaluation);

    if (criteria && criteria.length > 0) {
      const evaluationCriteria = criteria.map((criterion) =>
        this.criteriaRepository.create({
          ...criterion,
          evaluationId: savedEvaluation.id,
        }),
      );
      await this.criteriaRepository.save(evaluationCriteria);

      savedEvaluation.totalScore = this.calculateTotalScore(evaluationCriteria);
      await this.evaluationsRepository.save(savedEvaluation);
    }

    return this.findOne(savedEvaluation.id);
  }

  async findAll(query: QueryAvaliacaoDto) {
    const {
      page = 1,
      limit = 10,
      tecnicoId,
      evaluatorId,
      type,
      status,
      quarter,
      year,
    } = query;

    const queryBuilder = this.evaluationsRepository
      .createQueryBuilder('evaluation')
      .leftJoinAndSelect('evaluation.tecnico', 'tecnico')
      .leftJoinAndSelect('evaluation.evaluator', 'evaluator')
      .leftJoinAndSelect('evaluation.reviewer', 'reviewer')
      .leftJoinAndSelect('evaluation.criteria', 'criteria');

    if (tecnicoId) {
      queryBuilder.andWhere('evaluation.tecnicoId = :tecnicoId', { tecnicoId });
    }

    if (evaluatorId) {
      queryBuilder.andWhere('evaluation.evaluatorId = :evaluatorId', {
        evaluatorId,
      });
    }

    if (type) {
      queryBuilder.andWhere('evaluation.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('evaluation.status = :status', { status });
    }

    if (quarter) {
      queryBuilder.andWhere('evaluation.quarter = :quarter', { quarter });
    }

    if (year) {
      queryBuilder.andWhere('evaluation.year = :year', { year });
    }

    const [evaluations, total] = await queryBuilder
      .orderBy('evaluation.evaluationDate', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: evaluations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByTecnico(tecnicoId: string) {
    const evaluations = await this.evaluationsRepository.find({
      where: { tecnicoId },
      relations: ['tecnico', 'evaluator', 'reviewer', 'criteria'],
      order: { evaluationDate: 'DESC' },
    });

    return evaluations;
  }

  async findOne(id: string): Promise<Evaluation> {
    const evaluation = await this.evaluationsRepository.findOne({
      where: { id },
      relations: ['tecnico', 'evaluator', 'reviewer', 'criteria'],
    });

    if (!evaluation) {
      throw new NotFoundException(`Avaliação com ID ${id} não encontrada`);
    }

    return evaluation;
  }

  async update(
    id: string,
    updateAvaliacaoDto: UpdateAvaliacaoDto,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.DRAFT) {
      throw new BadRequestException(
        'Apenas avaliações em rascunho podem ser editadas',
      );
    }

    const { criteria, ...evaluationData } = updateAvaliacaoDto;

    Object.assign(evaluation, evaluationData);
    await this.evaluationsRepository.save(evaluation);

    if (criteria) {
      await this.criteriaRepository.delete({ evaluationId: id });
      if (criteria.length > 0) {
        const evaluationCriteria = criteria.map((criterion) =>
          this.criteriaRepository.create({
            ...criterion,
            evaluationId: id,
          }),
        );
        await this.criteriaRepository.save(evaluationCriteria);
        evaluation.totalScore = this.calculateTotalScore(evaluationCriteria);
        await this.evaluationsRepository.save(evaluation);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const evaluation = await this.findOne(id);
    
    if (evaluation.status !== EvaluationStatus.DRAFT) {
      throw new BadRequestException(
        'Apenas avaliações em rascunho podem ser removidas',
      );
    }

    await this.evaluationsRepository.remove(evaluation);
    return { message: 'Avaliação removida com sucesso' };
  }

  async submit(
    id: string,
    submitDto: SubmitAvaliacaoDto,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.DRAFT) {
      throw new BadRequestException(
        'Apenas avaliações em rascunho podem ser submetidas',
      );
    }

    evaluation.status = EvaluationStatus.SUBMITTED;
    evaluation.submittedAt = new Date();
    if (submitDto.comments) {
      evaluation.generalComments = evaluation.generalComments
        ? `${evaluation.generalComments}\n\n[Submissão]: ${submitDto.comments}`
        : `[Submissão]: ${submitDto.comments}`;
    }

    return this.evaluationsRepository.save(evaluation);
  }

  async approve(
    id: string,
    reviewDto: ReviewAvaliacaoDto,
    reviewerId: string,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Apenas avaliações submetidas podem ser aprovadas',
      );
    }

    evaluation.status = EvaluationStatus.APPROVED;
    evaluation.reviewerId = reviewerId;
    evaluation.reviewedAt = new Date();
    evaluation.reviewComments = reviewDto.reviewComments;

    return this.evaluationsRepository.save(evaluation);
  }

  async reject(
    id: string,
    reviewDto: ReviewAvaliacaoDto,
    reviewerId: string,
  ): Promise<Evaluation> {
    const evaluation = await this.findOne(id);

    if (evaluation.status !== EvaluationStatus.SUBMITTED) {
      throw new BadRequestException(
        'Apenas avaliações submetidas podem ser rejeitadas',
      );
    }

    evaluation.status = EvaluationStatus.REJECTED;
    evaluation.reviewerId = reviewerId;
    evaluation.reviewedAt = new Date();
    evaluation.reviewComments = reviewDto.reviewComments;

    return this.evaluationsRepository.save(evaluation);
  }
}
