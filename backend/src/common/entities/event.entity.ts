import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Community } from './community.entity';
import { EventAttendee } from './event-attendee.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'community_id' })
  communityId: string;

  @Column({ name: 'group_id', nullable: true })
  groupId: string;

  @Column({ name: 'created_by' })
  createdById: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'event_type', default: 'meeting' })
  eventType: string;

  @Column({ name: 'location_type', default: 'physical' })
  locationType: string;

  @Column({ name: 'location_name', nullable: true })
  locationName: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'online_url', nullable: true })
  onlineUrl: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'start_at', type: 'timestamptz' })
  startAt: Date;

  @Column({ name: 'end_at', type: 'timestamptz' })
  endAt: Date;

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: 'published' })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => Community, (c) => c.events)
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => EventAttendee, (a) => a.event)
  attendees: EventAttendee[];
}
