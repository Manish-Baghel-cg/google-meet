import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/ws-jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class WebRTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Set<string>> = new Map();

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
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.add(client.id);
      }
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
  @SubscribeMessage('offer')
  async handleOffer(client: Socket, data: { targetId: number; offer: any }) {
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
  async handleAnswer(client: Socket, data: { targetId: number; answer: any }) {
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
  async handleIceCandidate(client: Socket, data: { targetId: number; candidate: any }) {
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
      // Implement token verification logic here
      // Return user ID if valid, null if invalid
      return null; // Placeholder
    } catch (error) {
      return null;
    }
  }
} 