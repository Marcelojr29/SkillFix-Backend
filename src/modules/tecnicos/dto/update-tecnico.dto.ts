import { PartialType } from '@nestjs/swagger';
import { CreateTecnicoDto } from './create-tecnico.dto';
import { IsBoolean, IsOptional, IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Senioridade } from '../entities/tecnico.entity';

export class UpdateTecnicoDto extends PartialType(CreateTecnicoDto) {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiProperty({
    example: 'supervisor@empresa.com',
    description: 'E-mail do supervisor/coordenador (obrigatório se senioridade = Supervisor ou Coordenador)',
    required: false,
  })
  @ValidateIf((o) => o.senioridade === Senioridade.SUPERVISOR || o.senioridade === Senioridade.COORDENADOR)
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do supervisor/coordenador (obrigatório ao promover para Supervisor/Coordenador pela primeira vez)',
    required: false,
  })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsOptional()
  password?: string;
}
