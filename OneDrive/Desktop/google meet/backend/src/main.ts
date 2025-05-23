/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { createServer } from 'http';
import * as socketIo from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend running on port 3000
  app.enableCors({
    origin: 'http://localhost:3000',  // Frontend runs on port 3000
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe());
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Create HTTP server
  const expressApp = app.getHttpAdapter().getInstance();
  const server = createServer(expressApp);
  
  // Create Socket.IO server
  const io = new socketIo.Server(server, {
    cors: {
      origin: 'http://localhost:3000',  // Frontend runs on port 3000
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    },
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
  });

  // Handle Socket.IO connections
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('signal', (data) => {
      socket.broadcast.emit('signal', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  app.useWebSocketAdapter(new IoAdapter(app));

  // Start server
  await server.listen(3001);
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();
