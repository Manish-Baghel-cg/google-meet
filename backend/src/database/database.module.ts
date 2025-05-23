import { Module, Global } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/google_meet',
        });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {} 