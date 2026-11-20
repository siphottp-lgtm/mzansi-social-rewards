import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from './user.entity';

@Entity('event_attendees')
@Unique(['eventId', 'userId'])
export class EventAttendee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 'going' })
  response: string; // going | maybe | not_going

  @Column({ name: 'checked_in_at', type: 'timestamptz', nullable: true })
  checkedInAt: Date;

  @Column({ name: 'responded_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  respondedAt: Date;

  @ManyToOne(() => Event, (e) => e.attendees, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
