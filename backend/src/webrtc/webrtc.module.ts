import { Module } from '@nestjs/common';
import { WebRTCGateway } from './webrtc.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [WebRTCGateway],
  exports: [WebRTCGateway],
})
export class WebRTCModule {} 