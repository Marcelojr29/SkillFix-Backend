import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tecnico, Senioridade } from './entities/tecnico.entity';
import { TecnicoSkill } from './entities/tecnico-skill.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { OwnershipService } from '../auth/services/ownership.service';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private ownershipService: OwnershipService,
  ) {}

  async create(createTecnicoDto: CreateTecnicoDto): Promise<Tecnico> {
    const { skills, email, password, ...tecnicoData } = createTecnicoDto;

    // Validação: se é Supervisor, email e password são obrigatórios
    if (tecnicoData.senioridade === Senioridade.SUPERVISOR) {
      if (!email || !password) {
        throw new BadRequestException(
          'E-mail e senha são obrigatórios para cadastrar um Supervisor',
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
      });
      const savedTecnico = await queryRunner.manager.save(tecnico);

      // Se for supervisor, criar conta de usuário
      if (
        tecnicoData.senioridade === Senioridade.SUPERVISOR &&
        email &&
        password
      ) {
        const user = queryRunner.manager.create(User, {
          email,
          password, // Será hasheado pelo @BeforeInsert no User.entity
          name: tecnicoData.name,
          role: UserRole.MASTER,
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

    // Validar se é Supervisor e tem email/password
    if (body.senioridade === Senioridade.SUPERVISOR) {
      if (!body.email || !body.password) {
        throw new BadRequestException(
          'E-mail e senha são obrigatórios para cadastrar um Supervisor',
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
      const savedTecnico = await queryRunner.manager.save(tecnico);

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

      // Se for supervisor, criar conta de usuário
      if (
        body.senioridade === Senioridade.SUPERVISOR &&
        body.email &&
        body.password
      ) {
        const user = queryRunner.manager.create(User, {
          email: body.email,
          password: body.password,
          name: body.name,
          role: UserRole.MASTER,
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
      relations: [
        'team',
        'subtime',
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
    // Validar ownership antes de atualizar
    await this.ownershipService.validateTecnicoOwnership(
      id,
      userId,
      this.tecnicosRepository,
    );

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

  async remove(id: string, userId: string): Promise<{ message: string }> {
    // Validar ownership antes de deletar
    await this.ownershipService.validateTecnicoOwnership(
      id,
      userId,
      this.tecnicosRepository,
    );

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
