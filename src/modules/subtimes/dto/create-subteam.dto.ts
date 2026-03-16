import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TeamFunctionDto {
  @ApiProperty({ example: 'func-123' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Operador de Linha' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Responsável pela operação da linha de produção' })
  @IsString()
  description: string;

  @ApiProperty({ example: ['Operar máquinas', 'Registrar produção'] })
  @IsArray()
  responsibilities: string[];
}

export class EvaluationCriteriaDto {
  @ApiProperty({ example: 'crit-456' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Qualidade' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Avaliação da qualidade do trabalho' })
  @IsString()
  description: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxScore: number;
}

export class CreateSubTeamDto {
  @ApiProperty({ example: 'Sub-time A - Linha 1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Responsável pela linha de produção 1' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'team-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  parentTeamId: string;

  @ApiProperty({ example: 'tecnico-uuid-456', required: false })
  @IsUUID()
  @IsOptional()
  coordenadorId?: string;

  @ApiProperty({ type: [TeamFunctionDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamFunctionDto)
  @IsOptional()
  functions?: TeamFunctionDto[];

  @ApiProperty({ type: [EvaluationCriteriaDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvaluationCriteriaDto)
  @IsOptional()
  evaluationCriteria?: EvaluationCriteriaDto[];
}
