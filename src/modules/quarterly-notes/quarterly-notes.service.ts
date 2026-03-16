import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createQuarterlyNoteDto: CreateQuarterlyNoteDto,
  ): Promise<QuarterlyNote> {
    const quarterlyNote = this.quarterlyNotesRepository.create(
      createQuarterlyNoteDto,
    );
    return this.quarterlyNotesRepository.save(quarterlyNote);
  }

  async findAll(query: QueryQuarterlyNoteDto) {
    const {
      page = 1,
      limit = 10,
      tecnicoId,
      evaluatorId,
      quarter,
      year,
      status = true,
    } = query;

    const queryBuilder = this.quarterlyNotesRepository
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.tecnico', 'tecnico')
      .leftJoinAndSelect('note.evaluator', 'evaluator');

    if (tecnicoId) {
      queryBuilder.andWhere('note.tecnicoId = :tecnicoId', { tecnicoId });
    }

    if (evaluatorId) {
      queryBuilder.andWhere('note.evaluatorId = :evaluatorId', { evaluatorId });
    }

    if (quarter) {
      queryBuilder.andWhere('note.quarter = :quarter', { quarter });
    }

    if (year) {
      queryBuilder.andWhere('note.year = :year', { year });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('note.status = :status', { status });
    }

    const [notes, total] = await queryBuilder
      .orderBy('note.year', 'DESC')
      .addOrderBy('note.quarter', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: notes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
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
    return { message: 'Nota trimestral removida com sucesso' };
  }

  async findByTecnicoAndPeriod(
    tecnicoId: string,
    quarter: number,
    year: number,
  ): Promise<QuarterlyNote | null> {
    return this.quarterlyNotesRepository.findOne({
      where: { tecnicoId, quarter, year },
      relations: ['tecnico', 'evaluator'],
    });
  }
}
