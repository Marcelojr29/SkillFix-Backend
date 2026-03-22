import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard para validar ownership de recursos
 * Supervisores só podem acessar seus próprios dados
 * Admins podem acessar tudo
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Se não tem user (não autenticado), deixa o JwtAuthGuard lidar
    if (!user) {
      return true;
    }

    // Se não tem tecnicoId, é admin - pode tudo
    if (!user.tecnicoId) {
      return true;
    }

    // Se tem tecnicoId, é supervisor - precisa validar ownership
    // A validação real será feita no service layer
    // Este guard apenas marca que a validação é necessária
    request.requiresOwnershipValidation = true;
    return true;
  }
}
