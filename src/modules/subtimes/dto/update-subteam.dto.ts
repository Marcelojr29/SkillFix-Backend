import { PartialType } from '@nestjs/swagger';
import { CreateSubTeamDto } from './create-subteam.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubTeamDto extends PartialType(CreateSubTeamDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
