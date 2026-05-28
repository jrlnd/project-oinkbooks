import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

/** Injection token for the Drizzle database client. */
export const DRIZZLE = Symbol('DRIZZLE');

/** Inject with `@Inject(DRIZZLE) private readonly db: DrizzleDB`. */
export type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): DrizzleDB => {
        const url = configService.getOrThrow<string>('DATABASE_URL');
        const client = postgres(url);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule {}
