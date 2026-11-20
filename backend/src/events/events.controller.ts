import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

class CreateEventDto {
  @IsString()
  communityId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  onlineUrl?: string;

  @IsString()
  startAt: string;

  @IsString()
  endAt: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

class RsvpDto {
  @IsIn(['going', 'maybe', 'not_going'])
  response: 'going' | 'maybe' | 'not_going';
}

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private service: EventsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateEventDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  list(@Query('communityId') communityId: string) {
    return this.service.findByCommunity(communityId);
  }

  @Post(':id/rsvp')
  rsvp(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: RsvpDto) {
    return this.service.rsvp(id, user.id, dto.response);
  }

  @Get(':id/attendees')
  attendees(@Param('id') id: string) {
    return this.service.getAttendees(id);
  }
}
