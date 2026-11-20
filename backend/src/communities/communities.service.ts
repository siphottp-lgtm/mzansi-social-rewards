import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from '../common/entities/community.entity';
import { CommunityMembership } from '../common/entities/community-membership.entity';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community) private communitiesRepo: Repository<Community>,
    @InjectRepository(CommunityMembership) private membershipsRepo: Repository<CommunityMembership>,
  ) {}

  async create(userId: string, data: {
    name: string;
    slug: string;
    description?: string;
    visibility?: string;
    logoUrl?: string;
    coverUrl?: string;
  }) {
    const existing = await this.communitiesRepo.findOne({ where: { slug: data.slug } });
    if (existing) throw new ConflictException('Slug already taken');

    const community = this.communitiesRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      visibility: data.visibility || 'private',
      logoUrl: data.logoUrl || null,
      coverUrl: data.coverUrl || null,
      createdById: userId,
    });
    await this.communitiesRepo.save(community);

    const membership = this.membershipsRepo.create({
      communityId: community.id,
      userId,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });
    await this.membershipsRepo.save(membership);

    return community;
  }

  async findAllForUser(userId: string) {
    const memberships = await this.membershipsRepo.find({
      where: { userId, status: 'active' },
      relations: ['community'],
    });
    return memberships.map((m) => ({
      ...m.community,
      myRole: m.role,
    }));
  }

  async findBySlug(slug: string) {
    const community = await this.communitiesRepo.findOne({
      where: { slug, deletedAt: null as any },
    });
    if (!community) throw new NotFoundException('Community not found');
    return community;
  }

  async getMembership(communityId: string, userId: string) {
    return this.membershipsRepo.findOne({
      where: { communityId, userId, status: 'active' },
    });
  }

  async join(communityId: string, userId: string) {
    const community = await this.communitiesRepo.findOne({ where: { id: communityId } });
    if (!community) throw new NotFoundException();

    const existing = await this.membershipsRepo.findOne({ where: { communityId, userId } });
    if (existing) throw new ConflictException('Already a member or request pending');

    const status = community.visibility === 'public' ? 'active' : 'pending';
    const membership = this.membershipsRepo.create({
      communityId,
      userId,
      role: 'member',
      status,
      joinedAt: status === 'active' ? new Date() : null,
    });
    return this.membershipsRepo.save(membership);
  }

  async requireRole(communityId: string, userId: string, allowedRoles: string[]) {
    const membership = await this.getMembership(communityId, userId);
    if (!membership || !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return membership;
  }
}
