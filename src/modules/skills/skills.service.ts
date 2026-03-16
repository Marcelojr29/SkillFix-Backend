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
    const { search, machineId, teamId, subtimeId, level, status = true } =
      query;
    const queryBuilder = this.skillsRepository.createQueryBuilder('skill');

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

    return queryBuilder
      .leftJoinAndSelect('skill.machine', 'machine')
      .leftJoinAndSelect('skill.team', 'team')
      .leftJoinAndSelect('skill.subtime', 'subtime')
      .orderBy('skill.name', 'ASC')
      .getMany();
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
