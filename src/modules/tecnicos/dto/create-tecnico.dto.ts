import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  IsEmail,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Shift, Gender, Area, Senioridade } from '../entities/tecnico.entity';

export class SkillInput {
  @ApiProperty({ example: 'skill-id-123' })
  @IsUUID()
  skillId: string;

  @ApiProperty({ example: 85.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: 'Experiência em manutenção preventiva', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateTecnicoDto {
  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string;

  @ApiProperty({ example: 'WDC00001', description: 'Matrícula do colaborador' })
  @IsString()
  @IsNotEmpty({ message: 'Matrícula (workday) é obrigatória' })
  workday: string;

  @ApiProperty({ example: 'Técnico de Manutenção Elétrica' })
  @IsString()
  @IsNotEmpty()
  cargo: string;

  @ApiProperty({ enum: Senioridade, example: 'Pleno' })
  @IsEnum(Senioridade)
  @IsNotEmpty()
  senioridade: Senioridade;

  @ApiProperty({ enum: Area, example: 'Manutenção' })
  @IsEnum(Area)
  @IsNotEmpty()
  area: Area;

  @ApiProperty({ enum: Shift, example: '1T', description: 'Turno de trabalho' })
  @IsEnum(Shift, { message: 'Turno deve ser um dos seguintes valores: 1T, 2T, 3T, ADM' })
  @IsNotEmpty()
  shift: Shift;

  @ApiProperty({ example: 'Manutenção Elétrica' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ enum: Gender, example: 'M' })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @ApiProperty({ example: '2020-01-15' })
  @IsDateString()
  @IsNotEmpty()
  joinDate: string;

  @ApiProperty({ example: 'team-id-123', required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ example: 'subtime-id-456', required: false })
  @IsUUID()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({
    example: 'supervisor@empresa.com',
    description: 'E-mail do supervisor (obrigatório se senioridade = Supervisor)',
    required: false,
  })
  @ValidateIf((o) => o.senioridade === Senioridade.SUPERVISOR)
  @IsNotEmpty({ message: 'E-mail é obrigatório para Supervisores' })
  @IsEmail({}, { message: 'E-mail inválido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do supervisor (obrigatório se senioridade = Supervisor)',
    required: false,
  })
  @ValidateIf((o) => o.senioridade === Senioridade.SUPERVISOR)
  @IsNotEmpty({ message: 'Senha é obrigatória para Supervisores' })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @IsOptional()
  password?: string;

  @ApiProperty({ type: [SkillInput], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @IsOptional()
  skills?: SkillInput[];
}
