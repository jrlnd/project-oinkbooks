import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq, or } from 'drizzle-orm';
import type { AuthResponse, User } from '@oinkbooks/types';

import { DRIZZLE, type DrizzleDB } from '../db/db.module';
import { DEFAULT_CATEGORIES } from '../db/default-categories';
import { categories, users, type UserRow } from '../db/schema';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(or(eq(users.email, dto.email), eq(users.username, dto.username)));

    if (existing.length > 0) {
      throw new ConflictException('Email or username is already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    // Create the user AND seed their 7 default categories atomically — the v2
    // equivalent of v1's Firestore writeBatch in pages/register.tsx.
    const user = await this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ email: dto.email, username: dto.username, passwordHash })
        .returning();

      await tx.insert(categories).values(
        DEFAULT_CATEGORIES.map((c) => ({
          userId: created.id,
          icon: c.icon,
          label: c.label,
        })),
      );

      return created;
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    // Compare even on missing user paths is unnecessary here, but we keep the
    // error message identical for both cases to avoid leaking which emails exist.
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async getById(id: string): Promise<User | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user ? this.toUser(user) : null;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username));
    return !existing;
  }

  private buildAuthResponse(user: UserRow): AuthResponse {
    const token = this.jwt.sign({ sub: user.id, username: user.username });
    return { token, user: this.toUser(user) };
  }

  /** Strip the password hash and serialise dates before crossing the API boundary. */
  private toUser(row: UserRow): User {
    return {
      id: row.id,
      email: row.email,
      username: row.username,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
