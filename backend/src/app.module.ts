import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MeetingsModule } from './meetings/meetings.module';
import { WebRTCModule } from './webrtc/webrtc.module';
import { TeamsController } from './teams.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MeetingsModule,
    WebRTCModule,
  ],
  controllers: [AppController, TeamsController],
  providers: [AppService],
})
export class AppModule {}
