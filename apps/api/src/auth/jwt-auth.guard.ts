import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guards routes by running the 'jwt' Passport strategy; 401s if the token is missing/invalid. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
