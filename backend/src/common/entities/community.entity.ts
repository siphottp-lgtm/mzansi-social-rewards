import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CommunityMembership } from './community-membership.entity';
import { Post } from './post.entity';
import { Event } from './event.entity';

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string;

  @Column({ name: 'cover_url', nullable: true })
  coverUrl: string;

  @Column({ type: 'text', nullable: true })
  rules: string;

  @Column({ default: 'private' })
  visibility: string; // public | private | invite_only

  @Column({ default: 'active' })
  status: string; // active | archived | suspended

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @OneToMany(() => CommunityMembership, (m) => m.community)
  memberships: CommunityMembership[];

  @OneToMany(() => Post, (p) => p.community)
  posts: Post[];

  @OneToMany(() => Event, (e) => e.community)
  events: Event[];
}
