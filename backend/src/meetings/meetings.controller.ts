import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('meetings')
@UseGuards(JwtAuthGuard)
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  async create(
    @Body() meetingData: { title: string; description?: string },
    @Request() req,
  ) {
    return this.meetingsService.create({
      ...meetingData,
      hostId: req.user.id,
      startTime: new Date(),
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.meetingsService.findById(+id);
  }

  @Post(':id/join')
  async joinMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.addParticipant(+id, req.user.id);
  }

  @Post(':id/leave')
  async leaveMeeting(@Param('id') id: string, @Request() req) {
    return this.meetingsService.removeParticipant(+id, req.user.id);
  }

  @Delete(':id')
  async endMeeting(@Param('id') id: string, @Request() req) {
    const meeting = await this.meetingsService.findById(+id);
    if (meeting.hostId !== req.user.id) {
      throw new Error('Only the host can end the meeting');
    }
    return this.meetingsService.endMeeting(+id);
  }
} 