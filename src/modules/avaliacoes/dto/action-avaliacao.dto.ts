import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SubmitAvaliacaoDto {
  @ApiPropertyOptional({
    example: 'Avaliação finalizada e enviada para revisão',
    description: 'Comentários ao submeter',
  })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class ReviewAvaliacaoDto {
  @ApiProperty({
    example: 'Avaliação aprovada. Bom trabalho.',
    description: 'Comentários da revisão',
  })
  @IsNotEmpty()
  @IsString()
  reviewComments: string;
}
