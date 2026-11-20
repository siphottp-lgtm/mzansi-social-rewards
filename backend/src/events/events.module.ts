import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../common/entities/event.entity';
import { EventAttendee } from '../common/entities/event-attendee.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventAttendee]),
    CommunitiesModule,
  ],
  providers: [EventsService],
  controllers: [EventsController],
})
export class EventsModule {}
