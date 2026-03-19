import { ApiProperty } from '@nestjs/swagger';

export class ShiftMachineScoresDto {
  @ApiProperty({ example: 82.0, description: 'Score médio do 1º turno' })
  '1T': number;

  @ApiProperty({ example: 85.5, description: 'Score médio do 2º turno' })
  '2T': number;

  @ApiProperty({ example: 78.0, description: 'Score médio do 3º turno' })
  '3T': number;

  @ApiProperty({ example: 88.0, description: 'Score médio do turno administrativo' })
  'ADM': number;
}

export class ShiftMachineComparisonDto {
  @ApiProperty({ example: 'uuid-da-maquina' })
  machineId: string;

  @ApiProperty({ example: 'MAQ-001' })
  machineCode: string;

  @ApiProperty({ example: 'LASER XYZ Modelo A' })
  machineName: string;

  @ApiProperty({ type: ShiftMachineScoresDto })
  shifts: ShiftMachineScoresDto;

  @ApiProperty({ example: 83.4, description: 'Média geral da máquina' })
  overallAverage: number;

  @ApiProperty({ example: 5, description: 'Quantidade de skills relacionadas à máquina' })
  totalSkills: number;

  @ApiProperty({ example: 20, description: 'Quantidade de técnicos que trabalham com essa máquina' })
  totalTecnicos: number;

  @ApiProperty({ example: 'ADM', description: 'Turno com melhor performance' })
  bestShift: string;
}
