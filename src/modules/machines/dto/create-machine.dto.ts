import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({ example: 'Torno CNC 5 Eixos' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MAQ-001' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^MAQ-\d{3,}$/, {
    message: 'Código deve seguir o formato MAQ-XXX',
  })
  code: string;

  @ApiProperty({
    example: 'Torno CNC de 5 eixos para usinagem de precisão',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'team-uuid-123' })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiProperty({ example: 'Haas Automation', required: false })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiProperty({ example: 'VF-2SS', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: '2020-03-15', required: false })
  @IsDateString()
  @IsOptional()
  installationDate?: string;
}
