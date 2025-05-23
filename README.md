# Google Meet Clone

A real-time video conferencing application built with NestJS, React, and PostgreSQL.

## Tech Stack

### Backend
- NestJS
- Drizzle ORM
- PostgreSQL
- WebRTC
- Socket.io

### Frontend
- React
- Vite
- TailwindCSS
- WebRTC
- Socket.io-client

## Project Structure
```
Google-Meet-Clone/
├── backend/           # NestJS backend
├── frontend/         # React + Vite frontend
└── README.md         # Project documentation
```

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Run database migrations:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- Real-time video conferencing
- Screen sharing
- Chat functionality
- Meeting recording
- User authentication
- Meeting scheduling
- Meeting links generation 