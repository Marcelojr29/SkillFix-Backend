import { PartialType } from '@nestjs/swagger';
import { CreateMachineDto } from './create-machine.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMachineDto extends PartialType(CreateMachineDto) {
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
