import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { meetings, meetingParticipants } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MeetingsService {
  constructor(@Inject('DB') private db: NodePgDatabase) {}

  async create(meetingData: {
    title: string;
    description?: string;
    hostId: number;
    startTime: Date;
  }) {
    const [meeting] = await this.db
      .insert(meetings)
      .values(meetingData)
      .returning();
    return meeting;
  }

  async findById(id: number) {
    const [meeting] = await this.db
      .select()
      .from(meetings)
      .where(eq(meetings.id, id));
    return meeting;
  }

  async addParticipant(meetingId: number, userId: number) {
    const [participant] = await this.db
      .insert(meetingParticipants)
      .values({
        meetingId,
        userId,
      })
      .returning();
    return participant;
  }

  async removeParticipant(meetingId: number, userId: number) {
    const [participant] = await this.db
      .update(meetingParticipants)
      .set({
        leftAt: new Date(),
      })
      .where(
        eq(meetingParticipants.meetingId, meetingId) &&
          eq(meetingParticipants.userId, userId),
      )
      .returning();
    return participant;
  }

  async endMeeting(id: number) {
    const [meeting] = await this.db
      .update(meetings)
      .set({
        isActive: false,
        endTime: new Date(),
      })
      .where(eq(meetings.id, id))
      .returning();
    return meeting;
  }
} 