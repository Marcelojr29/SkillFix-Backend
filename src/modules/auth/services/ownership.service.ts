import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';

@Injectable()
export class OwnershipService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
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

  /**
   * Obtém o role do usuário
   */
  async getUserRole(userId: string): Promise<UserRole> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['role'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user.role;
  }

  /**
   * Verifica se usuário é coordenador
   */
  async isCoordenador(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === UserRole.COORDENADOR;
  }

  /**
   * Verifica se usuário é supervisor
   */
  async isSupervisor(userId: string): Promise<boolean> {
    const role = await this.getUserRole(userId);
    return role === UserRole.SUPERVISOR;
  }

  /**
   * Obtém o técnico vinculado ao usuário (para Supervisores e Coordenadores)
   */
  async getUserTecnico(userId: string): Promise<Tecnico | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['tecnico', 'tecnico.ledSubtime', 'tecnico.team'],
    });

    return user?.tecnico || null;
  }

  /**
   * Valida se coordenador tem acesso a um técnico específico
   * Regra: Coordenador só pode acessar técnicos do SUB-TIME que ele lidera
   */
  async validateCoordenadorTecnicoAccess(
    tecnicoId: string,
    userId: string,
  ): Promise<void> {
    // Admin sempre tem acesso
    if (await this.isAdmin(userId)) {
      return;
    }

    const role = await this.getUserRole(userId);
    
    // Se for supervisor, usar validação antiga (por createdById)
    if (role === UserRole.SUPERVISOR) {
      const tecnico = await this.tecnicosRepository.findOne({
        where: { id: tecnicoId },
        select: ['id', 'createdById'],
      });

      if (!tecnico) {
        throw new NotFoundException('Técnico não encontrado');
      }

      if (tecnico.createdById !== userId) {
        throw new ForbiddenException(
          'Você não tem permissão para acessar este técnico.',
        );
      }
      return;
    }

    // Se for coordenador, validar por sub-time
    if (role === UserRole.COORDENADOR) {
      const coordenadorTecnico = await this.tecnicosRepository.findOne({
        where: { user: { id: userId } },
        select: ['id', 'led_subtime_id'],
      });
      
      if (!coordenadorTecnico || !coordenadorTecnico.led_subtime_id) {
        throw new ForbiddenException(
          'Você não está vinculado a nenhum sub-time como coordenador',
        );
      }

      const tecnico = await this.tecnicosRepository.findOne({
        where: { id: tecnicoId },
        select: ['id', 'subtimeId'],
      });

      if (!tecnico) {
        throw new NotFoundException('Técnico não encontrado');
      }

      // Verificar se o técnico pertence ao sub-time liderado
      if (tecnico.subtimeId !== coordenadorTecnico.led_subtime_id) {
        throw new ForbiddenException(
          'Você só pode acessar técnicos do seu sub-time',
        );
      }
      return;
    }

    throw new ForbiddenException('Acesso não autorizado');
  }

  /**
   * Valida se coordenador/supervisor tem acesso para criar avaliação de um técnico
   */
  async validateCanEvaluateTecnico(
    tecnicoId: string,
    userId: string,
  ): Promise<void> {
    // Usar mesma lógica de acesso a técnico
    await this.validateCoordenadorTecnicoAccess(tecnicoId, userId);
  }

  /**
   * Filtra técnicos baseado no role do usuário
   * - Admin: vê todos
   * - Supervisor: vê os que criou
   * - Coordenador: vê apenas dos sub-times que lidera
   */
  async getAccessibleTecnicosSubtimeIds(userId: string): Promise<string[]> {
    const role = await this.getUserRole(userId);

    if (role === UserRole.COORDENADOR) {
      // Buscar o técnico vinculado ao usuário
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['tecnico'],
      });

      if (!user || !user.tecnico) {
        return [];
      }

      const coordenador = await this.tecnicosRepository.findOne({
        where: { id: user.tecnico.id },
        select: ['id', 'led_subtime_id'],
      });
      
      if (!coordenador?.led_subtime_id) {
        return [];
      }
      
      return [coordenador.led_subtime_id];
    }

    return []; // Admin e Supervisor usam outras lógicas
  }

  /**
   * Retorna o ID do sub-time liderado pelo coordenador (compatibilidade)
   */
  async getAccessibleTecnicosSubtimeId(userId: string): Promise<string | null> {
    const subtimeIds = await this.getAccessibleTecnicosSubtimeIds(userId);
    return subtimeIds.length > 0 ? subtimeIds[0] : null;
  }

  /**
   * Valida se coordenador não pode criar/deletar técnicos
   */
  async validateCanCreateTecnico(userId: string): Promise<void> {
    const role = await this.getUserRole(userId);

    if (role === UserRole.COORDENADOR) {
      throw new ForbiddenException(
        'Coordenadores não podem criar técnicos. Entre em contato com seu supervisor.',
      );
    }
  }

  /**
   * Valida se coordenador não pode deletar técnicos permanentemente
   */
  async validateCanDeleteTecnico(userId: string): Promise<void> {
    const role = await this.getUserRole(userId);

    if (role === UserRole.COORDENADOR) {
      throw new ForbiddenException(
        'Coordenadores não podem deletar técnicos permanentemente. Você pode apenas desativar.',
      );
    }
  }

  /**
   * Valida se coordenador não pode criar/editar times e sub-times
   */
  async validateCanManageTeams(userId: string): Promise<void> {
    const role = await this.getUserRole(userId);

    if (role === UserRole.COORDENADOR) {
      throw new ForbiddenException(
        'Coordenadores não podem gerenciar times ou sub-times.',
      );
    }
  }
}
