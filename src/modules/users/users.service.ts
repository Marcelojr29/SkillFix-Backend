import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  workday?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserResponse = UserResponse & {
  temporaryPassword?: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const existing = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    // Se senha não foi fornecida, gera uma senha temporária
    let temporaryPassword: string | undefined;
    if (!createUserDto.password) {
      temporaryPassword = this.generateTemporaryPassword();
      createUserDto.password = temporaryPassword;
    }

    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    const { password, refreshToken, ...result } = savedUser;
    
    // Retorna a senha temporária apenas se foi gerada automaticamente
    if (temporaryPassword) {
      return {
        ...result,
        temporaryPassword,
      };
    }

    return result;
  }

  async findAll(query: QueryUserDto) {
    const { page = 1, limit = 20, search, role, isActive } = query;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive });
    }

    const [users, total] = await queryBuilder
      .orderBy('user.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const sanitizedUsers = users.map(
      ({ password, refreshToken, ...user }) => user,
    );

    return {
      data: sanitizedUsers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existing) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    Object.assign(user, updateUserDto);
    const updated = await this.usersRepository.save(user);

    const { password, refreshToken, ...result } = updated;
    return result;
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const passwordMatches = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      throw new BadRequestException('Senha atual incorreta');
    }

    user.password = changePasswordDto.newPassword;
    await this.usersRepository.save(user);

    return { message: 'Senha alterada com sucesso' };
  }

  // async resetPassword(
  //   resetPasswordDto: ResetPasswordDto,
  // ): Promise<{ message: string; temporaryPassword: string }> {
  //   const user = await this.usersRepository.findOne({
  //     where: { email: resetPasswordDto.email },
  //   });

  //   if (!user) {
  //     throw new NotFoundException('Usuário não encontrado');
  //   }

  //   const temporaryPassword = this.generateTemporaryPassword();
  //   user.password = temporaryPassword;
  //   await this.usersRepository.save(user);

  //   return {
  //     message: 'Senha resetada com sucesso',
  //     temporaryPassword,
  //   };
  // }

  async toggleStatus(id: string): Promise<UserResponse> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    user.isActive = !user.isActive;
    const updated = await this.usersRepository.save(user);

    const { password, refreshToken, ...result } = updated;
    return result;
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    await this.usersRepository.remove(user);
    return { message: 'Usuário deletado com sucesso' };
  }

  /**
   * Solicita reset de senha (esqueci minha senha)
   * Gera uma senha temporária e retorna (ou enviaria por email)
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
    message: string;
    temporaryPassword?: string;
    email: string
  }> {
    const { email } = forgotPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado ou inativo');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    user.password = temporaryPassword;
    user.refreshToken = undefined;
    await this.usersRepository.save(user);

    return {
      message: 'Senha temporária gerada com sucesso',
      temporaryPassword,
      email: user.email,
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { email, newPassword } = resetPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('A nova senha deve ser diferente da atual');
    }

    user.password = newPassword;
    user.refreshToken = undefined;
    await this.usersRepository.save(user);

    return {
      message: 'Senha resetada com sucesso!',
    };
  }

  async adminResetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
    message: string;
    temporaryPassword: string;
  }> {
    const { email } = resetPasswordDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const temporaryPassword = this.generateTemporaryPassword();
    user.password = temporaryPassword;
    user.refreshToken = undefined;
    await this.usersRepository.save(user);

    return {
      message: 'Senha resetada com sucesso!',
      temporaryPassword,
    };
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
