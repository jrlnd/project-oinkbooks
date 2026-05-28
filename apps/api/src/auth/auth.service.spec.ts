import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { DRIZZLE } from '../db/db.module';
import { AuthService } from './auth.service';

/**
 * Unit tests for AuthService. The Drizzle client is mocked via the DRIZZLE
 * injection token — same pattern Nest uses to swap any value-provider.
 *
 * register: must hash the password (never store plaintext), seed the 7
 *   default categories in a transaction, and emit a signed JWT.
 * login: rejects bad credentials with 401; the message is identical for
 *   "unknown email" and "wrong password" so email existence doesn't leak.
 */

describe('AuthService', () => {
  // Build a stub that satisfies the AuthService surface for each test.
  const makeService = (overrides: {
    selectExisting?: Array<{ id: string }>;
    selectByEmail?: Array<{
      id: string;
      email: string;
      username: string;
      passwordHash: string;
      createdAt: Date;
    }>;
  }) => {
    const insertedUsers: unknown[] = [];
    const insertedCats: unknown[] = [];

    const txInsertChain = (target: 'users' | 'categories') => ({
      values: (vals: unknown) => ({
        returning: async () => {
          if (target === 'users') {
            const v = vals as Record<string, unknown>;
            const row = {
              id: 'new-user-id',
              email: v['email'],
              username: v['username'],
              passwordHash: v['passwordHash'],
              createdAt: new Date('2026-05-28T00:00:00Z'),
            };
            insertedUsers.push(row);
            return [row];
          }
          insertedCats.push(...(vals as unknown[]));
          return [];
        },
        // categories insert is awaited without .returning()
        then: (resolve: () => void) => {
          insertedCats.push(...(vals as unknown[]));
          resolve();
        },
      }),
    });

    const txMock = {
      insert: (_: unknown) => txInsertChain(insertedUsers.length === 0 ? 'users' : 'categories'),
    };

    const dbMock = {
      // db.select().from(users).where(...) returns the existing-row probe.
      select: () => ({
        from: () => ({
          where: async () => overrides.selectExisting ?? overrides.selectByEmail ?? [],
        }),
      }),
      transaction: async (fn: (tx: typeof txMock) => Promise<unknown>) => fn(txMock),
    } as never;

    const jwt = { sign: jest.fn().mockReturnValue('signed.jwt.token') } as unknown as JwtService;

    const svc = new (class extends AuthService {})(dbMock, jwt);
    return { svc, jwt, insertedUsers, insertedCats };
  };

  describe('register', () => {
    it('hashes the password (never stored as plaintext) and seeds 7 categories in a transaction', async () => {
      const { svc, jwt, insertedUsers, insertedCats } = makeService({});

      const res = await svc.register({
        email: 'bob@oink.dev',
        username: 'bobby',
        password: 'hunter2pw',
      });

      // user row was inserted with a HASHED password, not the plaintext
      const inserted = insertedUsers[0] as { passwordHash: string };
      expect(inserted.passwordHash).not.toBe('hunter2pw');
      expect(inserted.passwordHash.startsWith('$2')).toBe(true);
      expect(await bcrypt.compare('hunter2pw', inserted.passwordHash)).toBe(true);

      // 7 default categories were seeded for the new user
      expect(insertedCats.length).toBe(7);

      // a JWT was signed and returned
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.token).toBe('signed.jwt.token');
      expect(res.user.email).toBe('bob@oink.dev');
    });

    it('rejects a duplicate email/username with 409', async () => {
      const { svc } = makeService({ selectExisting: [{ id: 'existing-user' }] });
      await expect(
        svc.register({
          email: 'taken@oink.dev',
          username: 'taken',
          password: 'hunter2pw',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns a token on a correct password', async () => {
      const hash = await bcrypt.hash('hunter2pw', 4);
      const { svc, jwt } = makeService({
        selectByEmail: [
          {
            id: 'u1',
            email: 'alice@oink.dev',
            username: 'alice',
            passwordHash: hash,
            createdAt: new Date('2026-05-28T00:00:00Z'),
          },
        ],
      });

      const res = await svc.login({
        email: 'alice@oink.dev',
        password: 'hunter2pw',
      });
      expect(res.token).toBe('signed.jwt.token');
      expect(res.user.username).toBe('alice');
      expect(jwt.sign).toHaveBeenCalledWith({ sub: 'u1', username: 'alice' });
    });

    it('rejects an unknown email with 401', async () => {
      const { svc } = makeService({ selectByEmail: [] });
      await expect(
        svc.login({ email: 'ghost@oink.dev', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a wrong password with 401', async () => {
      const hash = await bcrypt.hash('correct', 4);
      const { svc } = makeService({
        selectByEmail: [
          {
            id: 'u1',
            email: 'alice@oink.dev',
            username: 'alice',
            passwordHash: hash,
            createdAt: new Date(),
          },
        ],
      });
      await expect(
        svc.login({ email: 'alice@oink.dev', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
