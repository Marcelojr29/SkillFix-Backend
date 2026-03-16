import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EvaluationType } from '../entities/evaluation.entity';

export class CriterionInput {
  @ApiProperty({ example: 'Produtividade', description: 'Nome do critério' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Mede a capacidade de produção',
    description: 'Descrição do critério',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30, description: 'Peso do critério (%)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @ApiProperty({ example: 85, description: 'Pontuação obtida' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ example: 100, description: 'Pontuação máxima' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiPropertyOptional({
    example: 'Bom desempenho neste critério',
    description: 'Comentários sobre o critério',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class CreateAvaliacaoDto {
  @ApiProperty({ example: 'uuid', description: 'ID do técnico avaliado' })
  @IsNotEmpty()
  @IsUUID()
  tecnicoId: string;

  @ApiProperty({ example: 'uuid', description: 'ID do avaliador' })
  @IsNotEmpty()
  @IsUUID()
  evaluatorId: string;

  @ApiProperty({
    enum: EvaluationType,
    example: EvaluationType.QUARTERLY,
    description: 'Tipo de avaliação',
  })
  @IsNotEmpty()
  @IsEnum(EvaluationType)
  type: EvaluationType;

  @ApiPropertyOptional({ example: 1, description: 'Trimestre (1-4)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter?: number;

  @ApiPropertyOptional({ example: 2024, description: 'Ano' })
  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2100)
  year?: number;

  @ApiProperty({ example: '2024-03-31', description: 'Data da avaliação' })
  @IsNotEmpty()
  @IsDateString()
  evaluationDate: string;

  @ApiPropertyOptional({
    example: 'Bom desempenho geral',
    description: 'Comentários gerais',
  })
  @IsOptional()
  @IsString()
  generalComments?: string;

  @ApiPropertyOptional({
    example: 'Proatividade e liderança',
    description: 'Pontos fortes',
  })
  @IsOptional()
  @IsString()
  strengths?: string;

  @ApiPropertyOptional({
    example: 'Melhorar comunicação',
    description: 'Pontos de melhoria',
  })
  @IsOptional()
  @IsString()
  improvements?: string;

  @ApiPropertyOptional({
    example: 'Aumentar produtividade em 10%',
    description: 'Metas estabelecidas',
  })
  @IsOptional()
  @IsString()
  goals?: string;

  @ApiProperty({
    type: [CriterionInput],
    description: 'Critérios de avaliação',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriterionInput)
  criteria: CriterionInput[];
}
