import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class OwnershipService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Verifica se o usuário é admin (não tem tecnicoId)
   * Admin vê tudo, outros usuários só veem seus próprios dados
   */
  async isAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'tecnicoId'],
    });
    
    // Se não tem tecnicoId, é admin (acesso total)
    // Se tem tecnicoId, é supervisor (acesso restrito)
    return !user?.tecnicoId;
  }

  /**
   * Valida se o usuário tem acesso a um time
   * Regra: Admin vê tudo, outros só veem times que CRIARAM
   */
  async validateTeamOwnership(
    teamId: string,
    userId: string,
    teamRepository: Repository<any>,
  ): Promise<void> {
    // Admin pode tudo
    if (await this.isAdmin(userId)) {
      return;
    }

    const team = await teamRepository.findOne({
      where: { id: teamId },
      select: ['id', 'createdById'],
    });

    if (!team) {
      throw new NotFoundException('Time não encontrado');
    }

    // Supervisor só pode acessar times que ele criou
    if (team.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este time. Apenas o criador do time pode visualizá-lo e editá-lo.',
      );
    }
  }

  /**
   * Valida se o supervisor tem acesso a um técnico específico
   * Regra: Admin vê tudo, outros só veem técnicos que CRIARAM
   */
  async validateTecnicoOwnership(
    tecnicoId: string,
    userId: string,
    tecnicosRepository: Repository<any>,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    const tecnico = await tecnicosRepository.findOne({
      where: { id: tecnicoId },
      select: ['id', 'createdById'],
    });

    if (!tecnico) {
      throw new NotFoundException('Técnico não encontrado');
    }

    if (tecnico.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este técnico. Apenas o criador pode visualizá-lo e editá-lo.',
      );
    }
  }

  /**
   * Valida se o supervisor pode criar/editar um técnico
   */
  async validateTecnicoCreation(
    teamId: string | undefined,
    userId: string,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    // Supervisor precisa especificar um time
    if (!teamId) {
      throw new ForbiddenException(
        'Supervisores devem especificar um time ao criar técnicos',
      );
    }

    // Aqui você pode adicionar lógica adicional se necessário
  }

  /**
   * Valida se o usuário tem acesso a um sub-time
   */
  async validateSubtimeOwnership(
    subtimeId: string,
    userId: string,
    subtimesRepository: Repository<any>,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    const subtime = await subtimesRepository.findOne({
      where: { id: subtimeId },
      select: ['id', 'createdById'],
    });

    if (!subtime) {
      throw new NotFoundException('Sub-time não encontrado');
    }

    if (subtime.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este sub-time. Apenas o criador pode visualizá-lo e editá-lo.',
      );
    }
  }

  /**
   * Valida se o usuário tem acesso a uma skill
   */
  async validateSkillOwnership(
    skillId: string,
    userId: string,
    skillsRepository: Repository<any>,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    const skill = await skillsRepository.findOne({
      where: { id: skillId },
      select: ['id', 'createdById'],
    });

    if (!skill) {
      throw new NotFoundException('Skill não encontrada');
    }

    if (skill.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta skill. Apenas o criador pode visualizá-la e editá-la.',
      );
    }
  }

  /**
   * Valida se o usuário tem acesso a uma máquina
   */
  async validateMachineOwnership(
    machineId: string,
    userId: string,
    machinesRepository: Repository<any>,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    const machine = await machinesRepository.findOne({
      where: { id: machineId },
      select: ['id', 'createdById'],
    });

    if (!machine) {
      throw new NotFoundException('Máquina não encontrada');
    }

    if (machine.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta máquina. Apenas o criador pode visualizá-la e editá-la.',
      );
    }
  }

  /**
   * Valida se o usuário tem acesso a uma avaliação
   */
  async validateEvaluationOwnership(
    evaluationId: string,
    userId: string,
    evaluationsRepository: Repository<any>,
  ): Promise<void> {
    if (await this.isAdmin(userId)) {
      return;
    }

    const evaluation = await evaluationsRepository.findOne({
      where: { id: evaluationId },
      select: ['id', 'createdById'],
    });

    if (!evaluation) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    if (evaluation.createdById !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar esta avaliação. Apenas o criador pode visualizá-la e editá-la.',
      );
    }
  }
}
