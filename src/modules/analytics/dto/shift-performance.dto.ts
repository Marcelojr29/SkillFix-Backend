import { ApiProperty } from '@nestjs/swagger';

export class ShiftPerformanceDataDto {
  @ApiProperty({ 
    example: 'Jan', 
    description: 'Nome do mês abreviado' 
  })
  month: string;

  @ApiProperty({ 
    example: 1, 
    description: 'Número do mês (1-12)' 
  })
  monthNumber: number;

  @ApiProperty({ 
    example: 85.5, 
    description: 'Pontuação média do 1º Turno (0-100)' 
  })
  '1T': number;

  @ApiProperty({ 
    example: 82.3, 
    description: 'Pontuação média do 2º Turno (0-100)' 
  })
  '2T': number;

  @ApiProperty({ 
    example: 78.9, 
    description: 'Pontuação média do 3º Turno (0-100)' 
  })
  '3T': number;

  @ApiProperty({ 
    example: 86.2, 
    description: 'Pontuação média do Turno Administrativo (0-100)' 
  })
  'ADM': number;

  @ApiProperty({ 
    example: 84.1, 
    description: 'Pontuação média de turnos especiais (0-100)',
    required: false 
  })
  'Especial'?: number;
}
