CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "meetings" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "host_id" INTEGER REFERENCES "users"("id"),
  "start_time" TIMESTAMP NOT NULL,
  "end_time" TIMESTAMP,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "meeting_participants" (
  "id" SERIAL PRIMARY KEY,
  "meeting_id" INTEGER REFERENCES "meetings"("id"),
  "user_id" INTEGER REFERENCES "users"("id"),
  "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "left_at" TIMESTAMP
); 