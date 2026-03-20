import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['tecnico'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.generateTokens(user);

    // Salvar refresh token hashado
    user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.usersRepository.save(user);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workday: user.workday,
        tecnicoId: user.tecnicoId,
        tecnico: user.tecnico
          ? {
              id: user.tecnico.id,
              name: user.tecnico.name,
              senioridade: user.tecnico.senioridade,
              area: user.tecnico.area,
            }
          : undefined,
      },
    };
  }

  async refreshTokens(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub, isActive: true },
        relations: ['tecnico'],
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Token inválido');
      }

      const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isTokenValid) {
        throw new UnauthorizedException('Token inválido');
      }

      const tokens = await this.generateTokens(user);

      // Atualizar refresh token
      user.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
      await this.usersRepository.save(user);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workday: user.workday,
          tecnicoId: user.tecnicoId,
          tecnico: user.tecnico
            ? {
                id: user.tecnico.id,
                name: user.tecnico.name,
                senioridade: user.tecnico.senioridade,
                area: user.tecnico.area,
              }
            : undefined,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken: undefined });
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['tecnico'],
    });

    if (user && (await user.validatePassword(password))) {
      return user;
    }

    return null;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['tecnico'],
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tecnicoId: user.tecnicoId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: this.configService.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
