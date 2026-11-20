import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../common/entities/event.entity';
import { EventAttendee } from '../common/entities/event-attendee.entity';
import { CommunitiesService } from '../communities/communities.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(EventAttendee) private attendeesRepo: Repository<EventAttendee>,
    private communitiesService: CommunitiesService,
  ) {}

  async create(userId: string, data: {
    communityId: string;
    title: string;
    description?: string;
    eventType?: string;
    locationType?: string;
    locationName?: string;
    address?: string;
    onlineUrl?: string;
    imageUrl?: string;
    startAt: string;
    endAt: string;
    capacity?: number;
  }) {
    await this.communitiesService.requireRole(data.communityId, userId, ['member', 'moderator', 'admin', 'owner']);

    const event = this.eventsRepo.create({
      communityId: data.communityId,
      createdById: userId,
      title: data.title,
      description: data.description,
      eventType: data.eventType || 'meeting',
      locationType: data.locationType || 'physical',
      locationName: data.locationName,
      address: data.address,
      onlineUrl: data.onlineUrl,
      imageUrl: data.imageUrl || null,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      capacity: data.capacity,
      status: 'published',
    });
    return this.eventsRepo.save(event);
  }

  async findByCommunity(communityId: string) {
    return this.eventsRepo.find({
      where: { communityId, status: 'published', deletedAt: null as any },
      order: { startAt: 'ASC' },
      relations: ['createdBy'],
    });
  }

  async rsvp(eventId: string, userId: string, response: 'going' | 'maybe' | 'not_going') {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException();

    await this.communitiesService.requireRole(event.communityId, userId, ['member', 'moderator', 'admin', 'owner']);

    let attendee = await this.attendeesRepo.findOne({ where: { eventId, userId } });
    if (attendee) {
      attendee.response = response;
      attendee.respondedAt = new Date();
    } else {
      attendee = this.attendeesRepo.create({
        eventId,
        userId,
        response,
        respondedAt: new Date(),
      });
    }
    return this.attendeesRepo.save(attendee);
  }

  async getAttendees(eventId: string) {
    return this.attendeesRepo.find({
      where: { eventId },
      relations: ['user'],
    });
  }
}
