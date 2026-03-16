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
    private subteamsRepository: Repository<SubTeam>,
  ) {}

  async create(createSubTeamDto: CreateSubTeamDto): Promise<SubTeam> {
    const subteam = this.subteamsRepository.create(createSubTeamDto);
    return this.subteamsRepository.save(subteam);
  }

  async findAll(): Promise<SubTeam[]> {
    return this.subteamsRepository.find({
      relations: ['team', 'coordenador', 'tecnicos'],
      where: { status: true },
      order: { name: 'ASC' },
    });
  }

  async findByTeam(teamId: string): Promise<SubTeam[]> {
    return this.subteamsRepository.find({
      where: { parentTeamId: teamId, status: true },
      relations: ['coordenador', 'tecnicos'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SubTeam> {
    const subteam = await this.subteamsRepository.findOne({
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
    return this.subteamsRepository.save(subteam);
  }

  async remove(id: string): Promise<{ message: string }> {
    const subteam = await this.findOne(id);
    subteam.status = false;
    await this.subteamsRepository.save(subteam);
    return { message: 'Sub-time desativado com sucesso' };
  }
}
