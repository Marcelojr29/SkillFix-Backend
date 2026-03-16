import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    const tecnico = this.tecnicosRepository.create(tecnicoData);
    const savedTecnico = await this.tecnicosRepository.save(tecnico);

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
      page = 1,
      limit = 10,
      search,
      shift,
      area,
      senioridade,
      teamId,
      subtimeId,
      status = true,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.tecnicosRepository
      .createQueryBuilder('tecnico')
      .leftJoinAndSelect('tecnico.team', 'team')
      .leftJoinAndSelect('tecnico.subtime', 'subtime')
      .leftJoinAndSelect('tecnico.skills', 'skills')
      .leftJoinAndSelect('skills.skill', 'skill');

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
      queryBuilder.andWhere('tecnico.senioridade = :senioridade', {
        senioridade,
      });
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

    const [tecnicos, total] = await queryBuilder
      .orderBy(`tecnico.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: tecnicos,
      meta: {
        total,
        page,
        limit,
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
    const { skills, ...tecnicoData } = updateTecnicoDto;
    const tecnico = await this.findOne(id);

    Object.assign(tecnico, tecnicoData);
    await this.tecnicosRepository.save(tecnico);

    if (skills) {
      await this.tecnicoSkillsRepository.delete({ tecnicoId: id });
      if (skills.length > 0) {
        const tecnicoSkills = skills.map((skill) =>
          this.tecnicoSkillsRepository.create({
            tecnicoId: id,
            skillId: skill.skillId,
            score: skill.score,
            notes: skill.notes,
          }),
        );
        await this.tecnicoSkillsRepository.save(tecnicoSkills);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const tecnico = await this.findOne(id);
    tecnico.status = false;
    await this.tecnicosRepository.save(tecnico);
    return { message: 'Técnico desativado com sucesso' };
  }

  async uploadPhoto(id: string, file: any): Promise<{ photoUrl: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const tecnico = await this.findOne(id);
    const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${id}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    tecnico.photo = `uploads/photos/${fileName}`;
    await this.tecnicosRepository.save(tecnico);

    return { photoUrl: tecnico.photo };
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
  ): Promise<TecnicoSkill> {
    const tecnicoSkill = await this.tecnicoSkillsRepository.findOne({
      where: { tecnicoId, skillId },
    });

    if (!tecnicoSkill) {
      throw new NotFoundException('Skill não encontrada para este técnico');
    }

    tecnicoSkill.score = score;
    if (notes) {
      tecnicoSkill.notes = notes;
    }

    return this.tecnicoSkillsRepository.save(tecnicoSkill);
  }
}
