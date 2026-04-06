import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { Tecnico, Senioridade } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { SubTeam } from '../subtimes/entities/subteam.entity';
import { Evaluation } from '../avaliacoes/entities/evaluation.entity';
import { OwnershipService } from '../auth/services/ownership.service';
import { CreateTecnicoDto } from './dto/create-tecnico.dto';
import { UpdateTecnicoDto } from './dto/update-tecnico.dto';
import { QueryTecnicoDto } from './dto/query-tecnico.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import { Multer } from 'multer';

// Adicione a definição do tipo PaginatedResponse
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TecnicosService {
  constructor(
    @InjectRepository(Tecnico)
    private tecnicosRepository: Repository<Tecnico>,
    @InjectRepository(TecnicoSkill)
    private tecnicoSkillsRepository: Repository<TecnicoSkill>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(SubTeam)
    private subTeamsRepository: Repository<SubTeam>,
    @InjectRepository(Evaluation)
    private evaluationsRepository: Repository<Evaluation>,
    private dataSource: DataSource,
    private ownershipService: OwnershipService,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto, userId: string): Promise<Tecnico> {
    await this.ownershipService.validateTecnicoCreation(createTecnicoDto.teamId, userId);

    const { skills, email, password, ledSubtimeId, ...tecnicoData } = createTecnicoDto;

    // Validação: se é Supervisor ou Coordenador, email e password são obrigatórios
    if (
      tecnicoData.senioridade === Senioridade.SUPERVISOR ||
      tecnicoData.senioridade === Senioridade.COORDENADOR
    ) {
      if (!email || !password) {
        throw new BadRequestException(
          'E-mail e senha são obrigatórios para cadastrar um Supervisor ou Coordenador',
        );
      }

      // Verificar se e-mail já existe
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('Este e-mail já está em uso');
      }
    }

    // Validação: se é Coordenador, ledSubtimeId é obrigatório
    if (tecnicoData.senioridade === Senioridade.COORDENADOR) {
      if (!ledSubtimeId) {
        throw new BadRequestException(
          'É obrigatório vincular um sub-time ao cadastrar um Coordenador (ledSubtimeId)',
        );
      }

      // Verificar se o sub-time existe
      const subtime = await this.subTeamsRepository.findOne({
        where: { id: ledSubtimeId },
      });
      if (!subtime) {
        throw new BadRequestException(`Sub-time ${ledSubtimeId} não encontrado`);
      }
    }

    // Usar transaction para garantir atomicidade
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Criar técnico
      const tecnico = queryRunner.manager.create(Tecnico, {
        ...tecnicoData,
        email: email || null,
        hasUserAccount: false,
        createdById: userId,
      });
      const savedTecnico = await queryRunner.manager.save(tecnico);

      // Se for Coordenador, associar ao sub-time liderado
      if (tecnicoData.senioridade === Senioridade.COORDENADOR && ledSubtimeId) {
        savedTecnico.led_subtime_id = ledSubtimeId;
        await queryRunner.manager.save(savedTecnico);
      }

      // Se for supervisor ou coordenador, criar conta de usuário
      if (
        (tecnicoData.senioridade === Senioridade.SUPERVISOR ||
          tecnicoData.senioridade === Senioridade.COORDENADOR) &&
        email &&
        password
      ) {
        // Determinar role baseado na senioridade
        const userRole =
          tecnicoData.senioridade === Senioridade.SUPERVISOR
            ? UserRole.SUPERVISOR
            : UserRole.COORDENADOR;

        const user = queryRunner.manager.create(User, {
          email,
          password, // Será hasheado pelo @BeforeInsert no User.entity
          name: tecnicoData.name,
          role: userRole,
          tecnicoId: savedTecnico.id,
        });
        await queryRunner.manager.save(user);

        // Atualizar flag no técnico
        savedTecnico.hasUserAccount = true;
        await queryRunner.manager.save(savedTecnico);
      }

      // Criar skills se fornecidas
      if (skills && skills.length > 0) {
        const tecnicoSkills = skills.map((skill) =>
          queryRunner.manager.create(TecnicoSkill, {
            tecnicoId: savedTecnico.id,
            skillId: skill.skillId,
            score: skill.score,
            notes: skill.notes,
          }),
        );
        await queryRunner.manager.save(tecnicoSkills);
      }

      await queryRunner.commitTransaction();

      // Retornar técnico com todas as relações
      return this.findOne(savedTecnico.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async createWithPhoto(body: any, file?: any): Promise<Tecnico> {
    // Validação de campos obrigatórios
    const requiredFields = ['name', 'workday', 'cargo', 'senioridade', 'area', 'shift', 'department', 'gender', 'joinDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new BadRequestException(`Campo obrigatório ausente: ${field}`);
      }
    }

    // Validar se é Supervisor ou Coordenador e tem email/password
    if (
      body.senioridade === Senioridade.SUPERVISOR ||
      body.senioridade === Senioridade.COORDENADOR
    ) {
      if (!body.email || !body.password) {
        throw new BadRequestException(
          'E-mail e senha são obrigatórios para cadastrar um Supervisor ou Coordenador',
        );
      }

      // Verificar se e-mail já existe
      const existingUser = await this.usersRepository.findOne({
        where: { email: body.email },
      });
      if (existingUser) {
        throw new BadRequestException('Este e-mail já está em uso');
      }
    }

    // Parsear skills se fornecidas como string JSON
    let skillsArray = [];
    if (body.skills) {
      try {
        skillsArray = typeof body.skills === 'string' ? JSON.parse(body.skills) : body.skills;
      } catch (error) {
        throw new BadRequestException('Campo skills deve ser um JSON válido');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Processar arquivo de foto se fornecido
      let photoPath = null;
      if (file) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }

        const fileExtension = path.extname(file.originalname);
        const tempFileName = `temp-${Date.now()}${fileExtension}`;
        const tempFilePath = path.join(uploadDir, tempFileName);
        
        await fs.writeFile(tempFilePath, file.buffer);
        photoPath = tempFilePath; // Caminho temporário, será renomeado depois
      }

      // Criar técnico
      const tecnico = queryRunner.manager.create(Tecnico, {
        name: body.name,
        workday: body.workday,
        cargo: body.cargo,
        senioridade: body.senioridade,
        area: body.area,
        shift: body.shift,
        department: body.department,
        gender: body.gender,
        joinDate: body.joinDate,
        teamId: body.teamId || null,
        subtimeId: body.subtimeId || null,
        email: body.email || null,
        hasUserAccount: false,
        photo: null, // Será atualizado depois
      });
      let savedTecnico = await queryRunner.manager.save(tecnico);

      // Se for Coordenador, associar ao sub-time liderado
      if (body.senioridade === Senioridade.COORDENADOR && body.ledSubtimeId) {
        savedTecnico.led_subtime_id = body.ledSubtimeId;
        savedTecnico = await queryRunner.manager.save(savedTecnico);
      }

      // Se foto foi fornecida, renomear com ID do técnico
      if (photoPath) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
        const fileExtension = path.extname(file.originalname);
        const finalFileName = `${savedTecnico.id}${fileExtension}`;
        const finalFilePath = path.join(uploadDir, finalFileName);
        
        await fs.rename(photoPath, finalFilePath);
        savedTecnico.photo = `uploads/photos/${finalFileName}`;
        await queryRunner.manager.save(savedTecnico);
      }

      // Se for supervisor ou coordenador, criar conta de usuário
      if (
        (body.senioridade === Senioridade.SUPERVISOR ||
          body.senioridade === Senioridade.COORDENADOR) &&
        body.email &&
        body.password
      ) {
        const userRole =
          body.senioridade === Senioridade.SUPERVISOR
            ? UserRole.SUPERVISOR
            : UserRole.COORDENADOR;

        const user = queryRunner.manager.create(User, {
          email: body.email,
          password: body.password,
          name: body.name,
          role: userRole,
          tecnicoId: savedTecnico.id,
        });
        await queryRunner.manager.save(user);

        savedTecnico.hasUserAccount = true;
        await queryRunner.manager.save(savedTecnico);
      }

      // Criar skills se fornecidas
      if (skillsArray && skillsArray.length > 0) {
        const tecnicoSkills = skillsArray.map((skill) =>
          queryRunner.manager.create(TecnicoSkill, {
            tecnicoId: savedTecnico.id,
            skillId: skill.skillId,
            score: skill.score,
            notes: skill.notes,
          }),
        );
        await queryRunner.manager.save(tecnicoSkills);
      }

      await queryRunner.commitTransaction();

      // Retornar técnico com todas as relações
      return this.findOne(savedTecnico.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      // Se erro ocorrer e foto foi salva, remover
      if (file) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'photos');
        const files = await fs.readdir(uploadDir);
        const tempFiles = files.filter(f => f.startsWith('temp-'));
        for (const tempFile of tempFiles) {
          try {
            await fs.unlink(path.join(uploadDir, tempFile));
          } catch {}
        }
      }
      
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: QueryTecnicoDto, userId: string): Promise<PaginatedResponse<Tecnico>> {
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
      .leftJoinAndSelect('tecnico.ledSubtime', 'ledSubtime')
      .leftJoinAndSelect('tecnico.skills', 'skills')
      .leftJoinAndSelect('skills.skill', 'skill')
      .where('tecnico.status = :status', { status });

    const isAdmin = await this.ownershipService.isAdmin(userId);
    const role = await this.ownershipService.getUserRole(userId);

    if (!isAdmin) {
      // Se for coordenador, filtrar apenas técnicos dos sub-times que lidera
      if (role === UserRole.COORDENADOR) {
        const coordenadorSubtimeIds = await this.ownershipService.getAccessibleTecnicosSubtimeIds(userId);
        if (coordenadorSubtimeIds && coordenadorSubtimeIds.length > 0) {
          queryBuilder.andWhere('tecnico.subtimeId IN (:...coordenadorSubtimeIds)', {
            coordenadorSubtimeIds,
          });
        } else {
          // Coordenador sem sub-times atribuídos não vê nada
          queryBuilder.andWhere('1 = 0');
        }
      } else {
        // Supervisor: vê apenas técnicos que criou
        queryBuilder.andWhere('tecnico.createdById = :userId', { userId });
      }
    }

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
      relations: [
        'team',
        'subtime',
        'ledSubtime',
        'skills',
        'skills.skill',
        'quarterlyNotes',
        'evaluations',
        'evaluations.criteria',
      ],
      order: {
        evaluations: {
          evaluationDate: 'DESC',
        },
      },
    });

    if (!tecnico) {
      throw new NotFoundException(`Técnico com ID ${id} não encontrado`);
    }

    return tecnico;
  }

  async update(id: string, updateTecnicoDto: UpdateTecnicoDto, userId: string): Promise<Tecnico> {
    // Validar acesso (Admin, Supervisor ou Coordenador do sub-time)
    await this.ownershipService.validateCoordenadorTecnicoAccess(id, userId);

    const { skills, email, password, ...tecnicoData } = updateTecnicoDto;
    const tecnico = await this.findOne(id);

    // ===== VALIDAÇÃO 1: Workday não pode ser alterado se há avaliações vinculadas =====
    if (updateTecnicoDto.workday && updateTecnicoDto.workday !== tecnico.workday) {
      const hasEvaluations = await this.evaluationsRepository.count({
        where: { tecnicoId: id },
      });

      if (hasEvaluations > 0) {
        throw new BadRequestException(
          'Não é possível alterar o workday (matrícula) pois o técnico possui avaliações vinculadas',
        );
      }

      // Validar se o novo workday já existe
      const existingWorkday = await this.tecnicosRepository.findOne({
        where: { workday: updateTecnicoDto.workday },
      });

      if (existingWorkday && existingWorkday.id !== id) {
        throw new ConflictException('Este workday (matrícula) já está em uso');
      }
    }

    // ===== VALIDAÇÃO 2: Email único (se alterado) =====
    if (email && email !== tecnico.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException('Este e-mail já está em uso');
      }
    }

    // ===== VALIDAÇÃO 3: Validar se teamId existe =====
    if (updateTecnicoDto.teamId) {
      const teamExists = await this.teamsRepository.findOne({
        where: { id: updateTecnicoDto.teamId },
      });

      if (!teamExists) {
        throw new BadRequestException(`Time com ID ${updateTecnicoDto.teamId} não encontrado`);
      }
    }

    // ===== VALIDAÇÃO 4: Validar se subtimeId pertence ao teamId =====
    if (updateTecnicoDto.subtimeId) {
      const currentTeamId = updateTecnicoDto.teamId || tecnico.teamId;

      if (!currentTeamId) {
        throw new BadRequestException('É necessário informar um time antes de atribuir um subtime');
      }

      const subTeam = await this.subTeamsRepository.findOne({
        where: { id: updateTecnicoDto.subtimeId },
      });

      if (!subTeam) {
        throw new BadRequestException(`Subtime com ID ${updateTecnicoDto.subtimeId} não encontrado`);
      }

      if (subTeam.parentTeamId !== currentTeamId) {
        throw new BadRequestException('O subtime selecionado não pertence ao time informado');
      }
    }

    // ===== VALIDAÇÃO 5: Se senioridade = Supervisor ou Coordenador, validar email obrigatório =====
    if (
      updateTecnicoDto.senioridade === Senioridade.SUPERVISOR ||
      updateTecnicoDto.senioridade === Senioridade.COORDENADOR
    ) {
      const finalEmail = email || tecnico.email;

      if (!finalEmail) {
        throw new BadRequestException(
          'E-mail é obrigatório para técnicos com senioridade Supervisor ou Coordenador',
        );
      }

      // Se não tem conta de usuário ainda e senha foi fornecida, criar
      if (!tecnico.hasUserAccount && password) {
        // Verificar se email já está em uso
        const existingUser = await this.usersRepository.findOne({
          where: { email: finalEmail },
        });

        if (existingUser) {
          throw new BadRequestException('Este e-mail já está em uso');
        }

        // Determinar role baseado na senioridade
        const userRole =
          updateTecnicoDto.senioridade === Senioridade.SUPERVISOR
            ? UserRole.SUPERVISOR
            : UserRole.COORDENADOR;

        const user = this.usersRepository.create({
          email: finalEmail,
          password, // Será hasheado pelo @BeforeInsert
          name: tecnico.name,
          role: userRole,
          tecnicoId: id,
        });
        await this.usersRepository.save(user);
        tecnico.hasUserAccount = true;
      }

      // Se já tem conta, atualizar email se fornecido
      if (tecnico.hasUserAccount && email && email !== tecnico.email) {
        const existingUser = await this.usersRepository.findOne({
          where: { email },
        });

        if (existingUser && existingUser.tecnicoId !== id) {
          throw new BadRequestException('Este e-mail já está em uso');
        }

        const userAccount = await this.usersRepository.findOne({
          where: { tecnicoId: id },
        });

        if (userAccount) {
          userAccount.email = email;
          await this.usersRepository.save(userAccount);
        }
      }

      // Validar ledSubtimeId para Coordenador
      if (updateTecnicoDto.senioridade === Senioridade.COORDENADOR) {
        const ledSubtimeId = updateTecnicoDto.ledSubtimeId || tecnico.led_subtime_id;

        if (!ledSubtimeId) {
          throw new BadRequestException(
            'É obrigatório vincular um sub-time ao Coordenador (ledSubtimeId)',
          );
        }

        // Validar se o sub-time existe
        if (updateTecnicoDto.ledSubtimeId) {
          const subtime = await this.subTeamsRepository.findOne({
            where: { id: updateTecnicoDto.ledSubtimeId },
          });

          if (!subtime) {
            throw new BadRequestException(`Sub-time ${updateTecnicoDto.ledSubtimeId} não encontrado`);
          }
        }
      }
    }

    // ===== VALIDAÇÃO 6: Se tinha conta de Supervisor/Coordenador e mudou senioridade, atualizar =====
    if (
      (tecnico.senioridade === Senioridade.SUPERVISOR ||
        tecnico.senioridade === Senioridade.COORDENADOR) &&
      updateTecnicoDto.senioridade &&
      updateTecnicoDto.senioridade !== Senioridade.SUPERVISOR &&
      updateTecnicoDto.senioridade !== Senioridade.COORDENADOR
    ) {
      // Remover conta de usuário se necessário (soft delete ou apenas marcar)
      const userAccount = await this.usersRepository.findOne({
        where: { tecnicoId: id },
      });

      if (userAccount) {
        // Opcional: você pode deletar ou desativar a conta
        // await this.usersRepository.remove(userAccount);
        // Ou apenas limpar a relação:
        tecnico.hasUserAccount = false;
      }
    }

    // Atualizar dados do técnico
    Object.assign(tecnico, tecnicoData);

    // Se email foi fornecido, atualizar também
    if (email) {
      tecnico.email = email;
    }

    // Se ledSubtimeId foi fornecido, atualizar o sub-time liderado
    if (updateTecnicoDto.ledSubtimeId !== undefined) {
      tecnico.led_subtime_id = updateTecnicoDto.ledSubtimeId || null;
    }

    await this.tecnicosRepository.save(tecnico);

    // Atualizar skills se fornecidas
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

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Validar acesso (Admin, Supervisor ou Coordenador do sub-time)
    await this.ownershipService.validateCoordenadorTecnicoAccess(id, userId);

    const tecnico = await this.findOne(id);
    tecnico.status = false;
    await this.tecnicosRepository.save(tecnico);
    return { message: 'Técnico desativado com sucesso' };
  }

  async uploadPhoto(id: string, file: Express.Multer.File): Promise<{ photoUrl: string }> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    const allowedMimes = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Formato de imagem inválido. Use JPG, PNG, WEBP ou GIF'
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('Imagem muito grande. Tamanho máximo: 5MB');
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

    const photoPath = `uploads/photos/${fileName}`;
    tecnico.photo = photoPath;
    await this.tecnicosRepository.save(tecnico);

    return { photoUrl: photoPath };
  }

  async deletePhoto(id: string): Promise<{ message: string }> {
    const tecnico = await this.findOne(id);

    if (!tecnico.photo) {
      throw new BadRequestException('Este técnico não possui foto');
    }

    // Remover arquivo físico
    const filePath = path.join(process.cwd(), tecnico.photo);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Se o arquivo não existir fisicamente, ignorar erro
      console.warn(`Arquivo não encontrado: ${filePath}`);
    }

    // Remover referência no banco
    tecnico.photo = null;
    await this.tecnicosRepository.save(tecnico);

    return { message: 'Foto removida com sucesso' };
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
