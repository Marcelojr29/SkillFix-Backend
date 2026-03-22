import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

/**
 * Helper service para validações de ownership
 * Usado para garantir isolamento de dados entre supervisores
 */
@Injectable()
export class OwnershipService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
  ) {}

  /**
   * Verifica se o usuário é admin (não tem tecnicoId)
   */
  async isAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'tecnicoId'],
    });
    
    return !user?.tecnicoId;
  }

  /**
   * Obtém o tecnicoId do usuário (para supervisores)
   */
  async getUserTecnicoId(userId: string): Promise<string | null> {
    if (!userId) return null;
    
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'tecnicoId'],
    });
    
    return user?.tecnicoId || null;
  }

  /**
   * Obtém IDs dos times supervisionados pelo usuário
   */
  async getSupervisorTeamIds(userId: string): Promise<string[]> {
    const tecnicoId = await this.getUserTecnicoId(userId);
    if (!tecnicoId) return [];

    const teams = await this.teamsRepository.find({
      where: { supervisorId: tecnicoId },
      select: ['id'],
    });

    return teams.map((t) => t.id);
  }

  /**
   * Valida se o supervisor tem acesso a um time específico
   */
  async validateTeamOwnership(
    teamId: string,
    userId: string,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const supervisorTeamIds = await this.getSupervisorTeamIds(userId);
    
    if (!supervisorTeamIds.includes(teamId)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este time',
      );
    }
  }

  /**
   * Valida se o supervisor tem acesso a um técnico específico
   */
  async validateTecnicoOwnership(
    tecnicoId: string,
    userId: string,
    tecnicosRepository: Repository<any>,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const tecnico = await tecnicosRepository.findOne({
      where: { id: tecnicoId },
      select: ['id', 'teamId'],
    });

    if (!tecnico) {
      throw new NotFoundException('Técnico não encontrado');
    }

    if (!tecnico.teamId) {
      throw new ForbiddenException(
        'Este técnico não está associado a nenhum time',
      );
    }

    await this.validateTeamOwnership(tecnico.teamId, userId);
  }

  /**
   * Valida se o supervisor pode criar/editar um técnico em um time específico
   */
  async validateTecnicoCreation(
    teamId: string | undefined,
    userId: string,
  ): Promise<void> {
    // Admin pode criar em qualquer time
    if (await this.isAdmin(userId)) {
      return;
    }

    // Supervisor precisa especificar um time
    if (!teamId) {
      throw new ForbiddenException(
        'Supervisores devem especificar um time ao criar técnicos',
      );
    }

    await this.validateTeamOwnership(teamId, userId);
  }

  /**
   * Valida se o supervisor tem acesso a uma máquina específica
   */
  async validateMachineOwnership(
    machineId: string,
    userId: string,
    machinesRepository: Repository<any>,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const machine = await machinesRepository.findOne({
      where: { id: machineId },
      select: ['id', 'teamId'],
    });

    if (!machine) {
      throw new NotFoundException('Máquina não encontrada');
    }

    if (!machine.teamId) {
      throw new ForbiddenException(
        'Esta máquina não está associada a nenhum time',
      );
    }

    await this.validateTeamOwnership(machine.teamId, userId);
  }

  /**
   * Valida se o supervisor tem acesso a um sub-time específico
   */
  async validateSubtimeOwnership(
    subtimeId: string,
    userId: string,
    subtimesRepository: Repository<any>,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const subtime = await subtimesRepository.findOne({
      where: { id: subtimeId },
      select: ['id', 'parentTeamId'],
    });

    if (!subtime) {
      throw new NotFoundException('Sub-time não encontrado');
    }

    if (!subtime.parentTeamId) {
      throw new ForbiddenException(
        'Este sub-time não está associado a nenhum time pai',
      );
    }

    await this.validateTeamOwnership(subtime.parentTeamId, userId);
  }

  /**
   * Valida se o supervisor tem acesso a uma skill específica
   */
  async validateSkillOwnership(
    skillId: string,
    userId: string,
    skillsRepository: Repository<any>,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const skill = await skillsRepository.findOne({
      where: { id: skillId },
      relations: ['team', 'machine'],
      select: ['id'],
    });

    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }

    // Skill pode estar associada a team ou machine
    const teamId = skill.team?.id || skill.machine?.teamId;

    if (!teamId) {
      throw new ForbiddenException(
        'Esta skill não está associada a nenhum time',
      );
    }

    await this.validateTeamOwnership(teamId, userId);
  }
}
