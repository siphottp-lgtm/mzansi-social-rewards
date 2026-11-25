import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Post } from '../common/entities/post.entity';
import { PostLike } from '../common/entities/post-like.entity';
import { PostComment } from '../common/entities/post-comment.entity';
import { CommunitiesService } from '../communities/communities.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(PostLike) private likesRepo: Repository<PostLike>,
    @InjectRepository(PostComment) private commentsRepo: Repository<PostComment>,
    private communitiesService: CommunitiesService,
  ) {}

  private formatAuthor(author: any) {
    if (!author) return null;
    const { passwordHash, ...safe } = author;
    const fullName =
      safe.displayName ||
      [safe.firstName, safe.lastName].filter(Boolean).join(' ') ||
      safe.email ||
      'Mzansi Member';
    return { ...safe, fullName };
  }

  async create(
    userId: string,
    communityId: string | undefined,
    data: {
      title?: string;
      groupId?: string;
      pageId?: string;
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
      groupId: data.groupId || null,
      pageId: data.pageId || null,
      sharesCount: 0,
      status: 'published',
      publishedAt: new Date(),
    });
    const saved = await this.postsRepo.save(post);
    return {
      ...saved,
      likesCount: 0,
      likedByMe: false,
      commentsCount: 0,
      sharesCount: saved.sharesCount || 0,
    };
  }

  async findByCommunity(
    communityId?: string,
    currentUserId?: string,
    limit = 20,
    groupId?: string,
    pageId?: string,
  ) {
    const cleanGroupId = groupId && groupId.trim() ? groupId.trim() : '';
    const cleanPageId = pageId && pageId.trim() ? pageId.trim() : '';
    const cleanCommunityId = communityId && communityId.trim() ? communityId.trim() : '';

    const where: any = { status: 'published', deletedAt: IsNull() };

    if (cleanGroupId) {
      where.groupId = cleanGroupId;
    } else if (cleanPageId) {
      where.pageId = cleanPageId;
    } else {
      // Personal status wall only: exclude group and page posts
      where.groupId = IsNull();
      where.pageId = IsNull();
    }

    if (cleanCommunityId) {
      where.communityId = cleanCommunityId;
    }

    const posts = await this.postsRepo.find({
      where,
      order: { isPinned: 'DESC', publishedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
      relations: ['author'],
    });

    const enriched = await Promise.all(
      posts.map(async (p) => {
        const [likesCount, myLike, commentsCount] = await Promise.all([
          this.likesRepo.count({ where: { postId: p.id } }),
          currentUserId
            ? this.likesRepo.findOne({ where: { postId: p.id, userId: currentUserId } })
            : Promise.resolve(null),
          this.commentsRepo.count({ where: { postId: p.id } }),
        ]);

        return {
          ...p,
          author: this.formatAuthor(p.author),
          likesCount,
          likedByMe: !!myLike,
          commentsCount,
          sharesCount: p.sharesCount || 0,
        };
      }),
    );

    return enriched;
  }

  async findOne(id: string) {
    const post = await this.postsRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['author', 'community'],
    });
    if (!post) throw new NotFoundException();
    return {
      ...post,
      author: this.formatAuthor(post.author),
    };
  }

  async toggleLike(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.likesRepo.findOne({ where: { postId, userId } });
    let liked = false;
    if (existing) {
      await this.likesRepo.remove(existing);
      liked = false;
    } else {
      const like = this.likesRepo.create({ postId, userId });
      await this.likesRepo.save(like);
      liked = true;
    }

    const likesCount = await this.likesRepo.count({ where: { postId } });
    return { postId, liked, likesCount };
  }

  async listComments(postId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('Post not found');

    const comments = await this.commentsRepo.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });

    return comments.map((c) => ({
      ...c,
      author: this.formatAuthor(c.author),
    }));
  }

  async addComment(postId: string, userId: string, body: string) {
    const trimmed = (body || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Comment text cannot be empty');
    }

    const post = await this.postsRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentsRepo.create({
      postId,
      authorId: userId,
      body: trimmed,
    });
    const saved = await this.commentsRepo.save(comment);
    const full = await this.commentsRepo.findOne({
      where: { id: saved.id },
      relations: ['author'],
    });
    const commentsCount = await this.commentsRepo.count({ where: { postId } });

    return {
      comment: {
        ...full,
        author: this.formatAuthor(full?.author),
      },
      commentsCount,
    };
  }

  async updatePost(
    postId: string,
    userId: string,
    data: { title?: string; body: string },
  ) {
    const post = await this.postsRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own post');
    }

    const trimmed = (data.body || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Post text cannot be empty');
    }

    post.body = trimmed;
    if (data.title !== undefined) {
      post.title = data.title;
    }
    const saved = await this.postsRepo.save(post);
    const [likesCount, myLike, commentsCount] = await Promise.all([
      this.likesRepo.count({ where: { postId: saved.id } }),
      this.likesRepo.findOne({ where: { postId: saved.id, userId } }),
      this.commentsRepo.count({ where: { postId: saved.id } }),
    ]);

    return {
      ...saved,
      author: this.formatAuthor(post.author),
      likesCount,
      likedByMe: !!myLike,
      commentsCount,
      sharesCount: saved.sharesCount || 0,
    };
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({
      where: { id: postId, deletedAt: IsNull() },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own post');
    }

    await this.commentsRepo.delete({ postId });
    await this.likesRepo.delete({ postId });
    await this.postsRepo.delete({ id: postId });
    return { deleted: true, id: postId };
  }

  async updateComment(
    postId: string,
    commentId: string,
    userId: string,
    body: string,
  ) {
    const comment = await this.commentsRepo.findOne({
      where: { id: commentId, postId },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comment');
    }

    const trimmed = (body || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Comment text cannot be empty');
    }

    comment.body = trimmed;
    const saved = await this.commentsRepo.save(comment);
    return {
      ...saved,
      author: this.formatAuthor(comment.author),
    };
  }

  async deleteComment(postId: string, commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id: commentId, postId },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    await this.commentsRepo.delete({ id: commentId, postId });
    const commentsCount = await this.commentsRepo.count({ where: { postId } });
    return { deleted: true, id: commentId, commentsCount };
  }

  async sharePost(postId: string) {
    const post = await this.postsRepo.findOne({ where: { id: postId, deletedAt: IsNull() } });
    if (!post) throw new NotFoundException('Post not found');

    post.sharesCount = (post.sharesCount || 0) + 1;
    await this.postsRepo.save(post);
    return {
      postId,
      sharesCount: post.sharesCount,
    };
  }
}