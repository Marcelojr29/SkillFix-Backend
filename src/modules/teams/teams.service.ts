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

  async create(createTeamDto: CreateTeamDto, userId: string): Promise<Team> {
    const team = this.teamsRepository.create({
      ...createTeamDto,
      createdById: userId,
    });
    return this.teamsRepository.save(team);
  }

  async findAll(userId: string): Promise<Team[]> {
    const queryBuilder = this.teamsRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.supervisor', 'supervisor')
      .leftJoinAndSelect('team.manager', 'manager')
      .leftJoinAndSelect('team.subtimes', 'subtimes')
      .leftJoinAndSelect('team.tecnicos', 'tecnicos')
      .where('team.status = :status', { status: true });

    const isAdmin = await this.ownershipService.isAdmin(userId);
    if (!isAdmin) {
      queryBuilder.andWhere('team.createdById = :userId', { userId });
    }

    return queryBuilder.orderBy('team.name', 'ASC').getMany();
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
    await this.ownershipService.validateTeamOwnership(id, userId, this.teamsRepository);

    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Validar ownership antes de deletar
    await this.ownershipService.validateTeamOwnership(id, userId, this.teamsRepository);

    const team = await this.findOne(id);
    team.status = false;
    await this.teamsRepository.save(team);
    return { message: 'Time desativado com sucesso' };
  }
}
