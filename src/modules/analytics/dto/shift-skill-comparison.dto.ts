import { ApiProperty } from '@nestjs/swagger';

export class ShiftScoresDto {
  @ApiProperty({ example: 85.5, description: 'Score médio do 1º turno' })
  '1T': number;

  @ApiProperty({ example: 88.2, description: 'Score médio do 2º turno' })
  '2T': number;

  @ApiProperty({ example: 82.0, description: 'Score médio do 3º turno' })
  '3T': number;

  @ApiProperty({ example: 90.0, description: 'Score médio do turno administrativo' })
  'ADM': number;
}

export class ShiftSkillComparisonDto {
  @ApiProperty({ example: 'uuid-da-skill' })
  skillId: string;

  @ApiProperty({ example: 'LASER' })
  skillName: string;

  @ApiProperty({ example: 'EQUIPAMENTO' })
  skillCategory: string;

  @ApiProperty({ type: ShiftScoresDto })
  shifts: ShiftScoresDto;

  @ApiProperty({ example: 86.4, description: 'Média geral da skill' })
  overallAverage: number;

  @ApiProperty({ example: 45, description: 'Quantidade de técnicos que possuem essa skill' })
  totalTecnicos: number;
}
