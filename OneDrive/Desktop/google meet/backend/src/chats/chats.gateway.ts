import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatsGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { teamId: number }): void {
    client.join(`team-${payload.teamId}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): void {
    this.server.to(`team-${payload.teamId}`).emit('message', payload);
  }
} 