import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Shift, Area, Senioridade } from '../entities/tecnico.entity';

export class QueryTecnicoDto {
  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ enum: Shift, required: false })
  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;

  @ApiProperty({ enum: Area, required: false })
  @IsEnum(Area)
  @IsOptional()
  area?: Area;

  @ApiProperty({ enum: Senioridade, required: false })
  @IsEnum(Senioridade)
  @IsOptional()
  senioridade?: Senioridade;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({ required: false, default: true })
  @Type(() => Boolean)
  @IsOptional()
  status?: boolean;

  @ApiProperty({ required: false, enum: ['name', 'joinDate', 'senioridade'] })
  @IsString()
  @IsOptional()
  sortBy?: string = 'name';

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'] })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
