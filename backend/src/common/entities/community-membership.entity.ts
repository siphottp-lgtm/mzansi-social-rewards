import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Community } from './community.entity';

@Entity('community_memberships')
@Unique(['communityId', 'userId'])
export class CommunityMembership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'community_id' })
  communityId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ default: 'member' })
  role: string; // member | moderator | admin | owner

  @Column({ default: 'pending' })
  status: string; // pending | active | rejected | removed

  @Column({ name: 'joined_at', type: 'timestamptz', nullable: true })
  joinedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedById: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Community, (c) => c.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'community_id' })
  community: Community;

  @ManyToOne(() => User, (u) => u.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
