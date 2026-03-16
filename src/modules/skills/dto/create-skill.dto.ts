import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

export enum SkillLevel {
  BASICO = 'Básico',
  INTERMEDIARIO = 'Intermediário',
  AVANCADO = 'Avançado',
  ESPECIALISTA = 'Especialista',
}

export class CreateSkillDto {
  @ApiProperty({ example: 'Operação de Torno CNC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Usinagem CNC' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 'Capacidade de operar torno CNC com programação básica',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'machine-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  machineId: string;

  @ApiProperty({ example: 'team-uuid-456' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ example: 'subtime-uuid-789' })
  @IsUUID()
  @IsNotEmpty()
  subtimeId: string;

  @ApiProperty({ enum: SkillLevel, required: false })
  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @ApiProperty({
    example: [
      'Conhecimento em programação G-code',
      'Leitura de desenho técnico',
    ],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requirements?: string[];
}
