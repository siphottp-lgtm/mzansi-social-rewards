import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../common/entities/post.entity';
import { CommunitiesService } from '../communities/communities.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    private communitiesService: CommunitiesService,
  ) {}

  async create(
    userId: string,
    communityId: string | undefined,
    data: {
      title?: string;
      body: string;
      postType?: string;
      isOfficial?: boolean;
      isPinned?: boolean;
      imageUrl?: string;
    },
  ) {
    const resolvedCommunityId =
      communityId && communityId.trim()
        ? communityId.trim()
        : await this.communitiesService.ensureDefaultCommunityForUser(userId);

    if (data.isOfficial || data.isPinned) {
      await this.communitiesService.requireRole(resolvedCommunityId, userId, [
        'admin',
        'owner',
        'moderator',
      ]);
    } else {
      await this.communitiesService.requireRole(resolvedCommunityId, userId, [
        'member',
        'moderator',
        'admin',
        'owner',
      ]);
    }

    const post = this.postsRepo.create({
      authorId: userId,
      communityId: resolvedCommunityId,
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

  async findByCommunity(communityId?: string, limit = 20) {
    const where: any = { status: 'published', deletedAt: IsNull() };
    if (communityId && communityId.trim()) {
      where.communityId = communityId.trim();
    }

    return this.postsRepo.find({
      where,
      order: { isPinned: 'DESC', publishedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
      relations: ['author'],
    });
  }

  async findOne(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['author', 'community'],
    });
    if (!post) throw new NotFoundException();
    return post;
  }
}