import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Community } from './community.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'author_id' })
  authorId: string;

  @Column({ name: 'community_id' })
  communityId: string;

  @Column({ name: 'group_id', nullable: true })
  groupId: string;

  @Column({ nullable: true })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'post_type', default: 'discussion' })
  postType: string;

  @Column({ default: 'community' })
  visibility: string;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'is_official', default: false })
  isOfficial: boolean;

  @Column({ name: 'shares_count', default: 0 })
  sharesCount: number;

  @Column({ default: 'published' })
  status: string;

  // Simple single image for MVP (full attachments table exists in schema for later)
  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Community, (c) => c.posts)
  @JoinColumn({ name: 'community_id' })
  community: Community;
}
