import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { OwnershipService } from '../auth/services/ownership.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private ownershipService: OwnershipService,
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

  async update(id: string, updateTeamDto: UpdateTeamDto, userId: string): Promise<Team> {
    // Validar ownership antes de atualizar
    await this.ownershipService.validateTeamOwnership(id, userId);

    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Validar ownership antes de deletar
    await this.ownershipService.validateTeamOwnership(id, userId);

    const team = await this.findOne(id);
    team.status = false;
    await this.teamsRepository.save(team);
    return { message: 'Time desativado com sucesso' };
  }
}
