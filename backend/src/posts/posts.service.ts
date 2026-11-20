import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../common/entities/post.entity';
import { CommunitiesService } from '../communities/communities.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private communitiesService: CommunitiesService,
  ) {}

  async create(userId: string, communityId: string, data: {
    title?: string;
    body: string;
    postType?: string;
    isOfficial?: boolean;
    isPinned?: boolean;
    imageUrl?: string;
  }) {
    if (data.isOfficial || data.isPinned) {
      await this.communitiesService.requireRole(communityId, userId, ['admin', 'owner', 'moderator']);
    } else {
      await this.communitiesService.requireRole(communityId, userId, ['member', 'moderator', 'admin', 'owner']);
    }

    const post = this.postsRepo.create({
      authorId: userId,
      communityId,
      title: data.title,
      body: data.body,
      postType: data.postType || 'discussion',
      isOfficial: !!data.isOfficial,
      isPinned: !!data.isPinned,
      imageUrl: data.imageUrl || null,
      status: 'published',
      publishedAt: new Date(),
    });
    return this.postsRepo.save(post);
  }

  async findByCommunity(communityId: string, limit = 20) {
    return this.postsRepo.find({
      where: { communityId, status: 'published', deletedAt: null as any },
      order: { isPinned: 'DESC', publishedAt: 'DESC' },
      take: limit,
      relations: ['author'],
    });
  }

  async findOne(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id, deletedAt: null as any },
      relations: ['author', 'community'],
    });
    if (!post) throw new NotFoundException();
    return post;
  }
}
