import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'master@example.com',
      name: 'Maria Silva',
      role: 'master',
      workday: 'diurno',
      tecnicoId: '456e7890-e89b-12d3-a456-426614174001',
      tecnico: {
        id: '456e7890-e89b-12d3-a456-426614174001',
        name: 'Maria Silva',
        senioridade: 'Supervisor',
        area: 'Produção',
      },
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    workday?: string;
    tecnicoId?: string;
    tecnico?: {
      id: string;
      name: string;
      senioridade: string;
      area: string;
    };
  };
}
