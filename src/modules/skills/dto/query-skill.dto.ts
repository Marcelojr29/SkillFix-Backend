import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { SkillLevel } from './create-skill.dto';

export class QuerySkillDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  machineId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  subtimeId?: string;

  @ApiProperty({ enum: SkillLevel, required: false })
  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @ApiProperty({ required: false, default: true })
  @Type(() => Boolean)
  @IsOptional()
  status?: boolean;
}
