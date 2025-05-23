import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { DrizzleService } from '../drizzle/drizzle.service';

@Injectable()
export class ChatsService {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll() {
    return this.drizzleService.db.query.chats.findMany({
      orderBy: (chats, { desc }) => [desc(chats.sentAt)],
    });
  }

  async create(createChatDto: CreateChatDto) {
    return this.drizzleService.db.insert(createChatDto).into('chats');
  }
} 