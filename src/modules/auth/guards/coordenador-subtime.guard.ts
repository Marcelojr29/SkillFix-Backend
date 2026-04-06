import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { OwnershipService } from '../services/ownership.service';

/**
 * Guard para validar que Coordenadores só acessem técnicos do seu sub-time
 * Este guard deve ser usado em rotas que recebem :id de técnico como parâmetro
 * 
 * Regras:
 * - Admin: acesso total
 * - Supervisor: acesso aos técnicos que criou
 * - Coordenador: acesso APENAS aos técnicos do sub-time que lidera
 */
@Injectable()
export class CoordenadorSubTimeGuard implements CanActivate {
  constructor(private ownershipService: OwnershipService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injetado pelo JwtAuthGuard
    const tecnicoId = request.params.id; // ID do técnico na URL

    if (!user || !user.id) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (!tecnicoId) {
      // Se não há tecnicoId na URL, não há o que validar
      // Deixar passar (outras validações serão feitas no service)
      return true;
    }

    // Validar acesso baseado no role
    await this.ownershipService.validateCoordenadorTecnicoAccess(
      tecnicoId,
      user.id,
    );

    return true;
  }
}
