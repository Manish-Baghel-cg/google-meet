import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('DB') private db: NodePgDatabase) {}

  async create(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [user] = await this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
      })
      .returning();
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async findById(id: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async validatePassword(user: any, password: string) {
    return bcrypt.compare(password, user.password);
  }
} 