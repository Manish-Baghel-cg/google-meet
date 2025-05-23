import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const meetings = pgTable('meetings', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  hostId: integer('host_id').references(() => users.id),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const meetingParticipants = pgTable('meeting_participants', {
  id: serial('id').primaryKey(),
  meetingId: integer('meeting_id').references(() => meetings.id),
  userId: integer('user_id').references(() => users.id),
  joinedAt: timestamp('joined_at').defaultNow(),
  leftAt: timestamp('left_at'),
}); 