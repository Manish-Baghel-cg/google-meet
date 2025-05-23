import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MeetingsService } from './meetings.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class MeetingsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Set<string>> = new Map();
  private meetingRooms: Map<number, Set<string>> = new Map();

  constructor(private readonly meetingsService: MeetingsService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token and get user ID
      const userId = await this.verifyToken(token);
      if (!userId) {
        client.disconnect();
        return;
      }

      // Store socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);
      client.data.userId = userId;
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('joinMeeting')
  async handleJoinMeeting(client: Socket, meetingId: number) {
    const userId = client.data.userId;
    const roomId = `meeting:${meetingId}`;

    // Join socket room
    await client.join(roomId);
    if (!this.meetingRooms.has(meetingId)) {
      this.meetingRooms.set(meetingId, new Set());
    }
    this.meetingRooms.get(meetingId)!.add(client.id);

    // Add participant to meeting
    await this.meetingsService.addParticipant(meetingId, userId);

    // Notify others
    client.to(roomId).emit('participantJoined', { userId });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leaveMeeting')
  async handleLeaveMeeting(client: Socket, meetingId: number) {
    const userId = client.data.userId;
    const roomId = `meeting:${meetingId}`;

    // Leave socket room
    await client.leave(roomId);
    const room = this.meetingRooms.get(meetingId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) {
        this.meetingRooms.delete(meetingId);
      }
    }

    // Remove participant from meeting
    await this.meetingsService.removeParticipant(meetingId, userId);

    // Notify others
    client.to(roomId).emit('participantLeft', { userId });
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('offer')
  async handleOffer(client: Socket, data: { meetingId: number; targetId: number; offer: any }) {
    const targetSockets = this.userSockets.get(data.targetId);
    if (targetSockets) {
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit('offer', {
          offer: data.offer,
          from: client.data.userId,
        });
      }
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, data: { meetingId: number; targetId: number; answer: any }) {
    const targetSockets = this.userSockets.get(data.targetId);
    if (targetSockets) {
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit('answer', {
          answer: data.answer,
          from: client.data.userId,
        });
      }
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('iceCandidate')
  async handleIceCandidate(client: Socket, data: { meetingId: number; targetId: number; candidate: any }) {
    const targetSockets = this.userSockets.get(data.targetId);
    if (targetSockets) {
      for (const socketId of targetSockets) {
        this.server.to(socketId).emit('iceCandidate', {
          candidate: data.candidate,
          from: client.data.userId,
        });
      }
    }
  }

  private async verifyToken(token: string): Promise<number | null> {
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not defined');
        return null;
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { sub: string };
      return parseInt(decoded.sub);
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
} 