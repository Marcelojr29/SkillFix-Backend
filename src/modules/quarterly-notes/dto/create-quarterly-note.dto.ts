import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BreakdownItemDto {
  @ApiProperty({ example: 'uuid', description: 'ID da categoria' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Produtividade', description: 'Nome da categoria' })
  @IsString()
  categoryName: string;

  @ApiProperty({ example: 85, description: 'Pontuação obtida' })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({ example: 100, description: 'Pontuação máxima' })
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiProperty({ example: 30, description: 'Peso da categoria (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;
}

export class CreateQuarterlyNoteDto {
  @ApiProperty({ example: 'uuid', description: 'ID do técnico' })
  @IsNotEmpty()
  @IsUUID()
  tecnicoId: string;

  @ApiProperty({ example: 'uuid', description: 'ID do avaliador' })
  @IsNotEmpty()
  @IsUUID()
  evaluatorId: string;

  @ApiProperty({ example: 1, description: 'Trimestre (1-4)' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(4)
  quarter: number;

  @ApiProperty({ example: 2024, description: 'Ano' })
  @IsNotEmpty()
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 87.5, description: 'Pontuação total (0-100)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ example: '2024-03-31', description: 'Data da avaliação' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    example: 'Ótimo desempenho no trimestre',
    description: 'Observações',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [BreakdownItemDto],
    description: 'Detalhamento por categoria',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakdownItemDto)
  breakdown?: BreakdownItemDto[];
}
