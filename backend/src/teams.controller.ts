import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

interface Team {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  private teams: Team[] = [];

  @Get()
  getTeams(@Request() req) {
    return this.teams;
  }

  @Post()
  createTeam(@Body() body, @Request() req) {
    const newTeam: Team = {
      ...body,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.teams.push(newTeam);
    return newTeam;
  }
} 