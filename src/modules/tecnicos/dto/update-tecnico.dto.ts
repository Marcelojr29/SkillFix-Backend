import { PartialType } from '@nestjs/swagger';
import { CreateTecnicoDto } from './create-tecnico.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTecnicoDto extends PartialType(CreateTecnicoDto) {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
