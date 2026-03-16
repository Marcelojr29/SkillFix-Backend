import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Time de Manutenção A' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Responsável pela manutenção preventiva' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Manutenção' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ example: 'user-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  supervisorId: string;

  @ApiProperty({ example: 'user-uuid-456', required: false })
  @IsUUID()
  @IsOptional()
  managerId?: string;

  @ApiProperty({ example: '#3B82F6', required: false })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Cor deve ser hex válida' })
  color?: string;
}
