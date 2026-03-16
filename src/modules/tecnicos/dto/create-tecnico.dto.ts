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

  @ApiProperty({ enum: Shift, example: '1T' })
  @IsEnum(Shift)
  @IsNotEmpty()
  workday: Shift;

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

  @ApiProperty({ enum: Shift, example: '1T' })
  @IsEnum(Shift)
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

  @ApiProperty({ type: [SkillInput], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillInput)
  @IsOptional()
  skills?: SkillInput[];
}
