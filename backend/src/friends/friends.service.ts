import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../common/entities/friendship.entity';
import { User } from '../common/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friendship)
    private friendshipRepo: Repository<Friendship>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private formatUser(u?: User) {
    if (!u) return null;
    const { passwordHash, ...safe } = u;
    const fullName =
      safe.displayName ||
      [safe.firstName, safe.lastName].filter(Boolean).join(' ') ||
      safe.email ||
      'Mzansi Member';
    return { ...safe, fullName };
  }

  async getOverview(currentUserId: string) {
    const records = await this.friendshipRepo.find({
      where: [{ requesterId: currentUserId }, { addresseeId: currentUserId }],
      relations: ['requester', 'addressee'],
      order: { updatedAt: 'DESC' },
    });

    const friends: any[] = [];
    const incoming: any[] = [];
    const outgoing: any[] = [];

    for (const r of records) {
      if (r.status === 'accepted') {
        const peer = r.requesterId === currentUserId ? r.addressee : r.requester;
        friends.push({
          friendshipId: r.id,
          status: r.status,
          user: this.formatUser(peer),
        });
      } else if (r.status === 'pending') {
        if (r.addresseeId === currentUserId) {
          incoming.push({
            friendshipId: r.id,
            status: r.status,
            requester: this.formatUser(r.requester),
          });
        } else if (r.requesterId === currentUserId) {
          outgoing.push({
            friendshipId: r.id,
            status: r.status,
            addressee: this.formatUser(r.addressee),
          });
        }
      }
    }

    return { friends, incoming, outgoing };
  }

  async sendRequest(currentUserId: string, targetUserId: string) {
    if (!targetUserId) {
      throw new BadRequestException('targetUserId is required');
    }
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    const targetUser = await this.userRepo.findOne({
      where: { id: targetUserId, deletedAt: null as any },
    });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Check existing relationship in either direction
    const existingDirect = await this.friendshipRepo.findOne({
      where: { requesterId: currentUserId, addresseeId: targetUserId },
    });
    if (existingDirect) {
      if (existingDirect.status === 'accepted') {
        throw new BadRequestException('You are already friends');
      }
      if (existingDirect.status === 'pending') {
        throw new BadRequestException('Friend request already sent');
      }
      existingDirect.status = 'pending';
      return this.friendshipRepo.save(existingDirect);
    }

    const existingReverse = await this.friendshipRepo.findOne({
      where: { requesterId: targetUserId, addresseeId: currentUserId },
    });
    if (existingReverse) {
      if (existingReverse.status === 'accepted') {
        throw new BadRequestException('You are already friends');
      }
      if (existingReverse.status === 'pending') {
        existingReverse.status = 'accepted';
        return this.friendshipRepo.save(existingReverse);
      }
      existingReverse.requesterId = currentUserId;
      existingReverse.addresseeId = targetUserId;
      existingReverse.status = 'pending';
      return this.friendshipRepo.save(existingReverse);
    }

    const created = this.friendshipRepo.create({
      requesterId: currentUserId,
      addresseeId: targetUserId,
      status: 'pending',
    });
    return this.friendshipRepo.save(created);
  }

  async acceptRequest(currentUserId: string, friendshipId: string) {
    const req = await this.friendshipRepo.findOne({ where: { id: friendshipId } });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.addresseeId !== currentUserId) {
      throw new ForbiddenException('Only the recipient can accept this request');
    }
    req.status = 'accepted';
    return this.friendshipRepo.save(req);
  }

  async declineRequest(currentUserId: string, friendshipId: string) {
    const req = await this.friendshipRepo.findOne({ where: { id: friendshipId } });
    if (!req) throw new NotFoundException('Friend request not found');
    if (req.addresseeId !== currentUserId) {
      throw new ForbiddenException('Only the recipient can decline this request');
    }
    req.status = 'declined';
    return this.friendshipRepo.save(req);
  }

  async removeFriendship(currentUserId: string, friendshipId: string) {
    const req = await this.friendshipRepo.findOne({ where: { id: friendshipId } });
    if (!req) throw new NotFoundException('Friendship not found');
    if (req.requesterId !== currentUserId && req.addresseeId !== currentUserId) {
      throw new ForbiddenException('Not authorized to remove this connection');
    }
    await this.friendshipRepo.remove(req);
    return { removed: true, id: friendshipId };
  }
}