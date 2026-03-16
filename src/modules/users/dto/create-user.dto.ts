import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole, Workday } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'joao.silva@empresa.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    example: 'Senha@123', 
    minLength: 8,
    required: false,
    description: 'Senha do usuário. Se não informada, será gerada uma senha temporária automaticamente.'
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: UserRole, default: UserRole.SUPERVISOR })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ enum: Workday, required: false })
  @IsEnum(Workday)
  @IsOptional()
  workday?: Workday;
}
