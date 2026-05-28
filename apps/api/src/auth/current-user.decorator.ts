import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from './jwt.strategy';

/**
 * Pulls the authenticated user (set by JwtStrategy.validate) off the request.
 * Usage: `me(@CurrentUser() user: AuthUser) { ... }`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
