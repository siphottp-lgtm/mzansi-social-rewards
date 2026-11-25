import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Message } from '../common/entities/message.entity';
import { User } from '../common/entities/user.entity';
import { Friendship } from '../common/entities/friendship.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Friendship) private friendshipsRepo: Repository<Friendship>,
  ) {}

  private formatUser(u?: User | null) {
    if (!u) return null;
    const { passwordHash, ...safe } = u as any;
    const fullName =
      safe.displayName ||
      [safe.firstName, safe.lastName].filter(Boolean).join(' ') ||
      safe.email ||
      'Mzansi Member';
    return {
      id: safe.id,
      email: safe.email,
      fullName,
      avatarUrl: safe.avatarUrl || null,
    };
  }

  async listConversations(currentUserId: string) {
    // 1. Accepted friends
    const friendships = await this.friendshipsRepo.find({
      where: [
        { requesterId: currentUserId, status: 'accepted' },
        { addresseeId: currentUserId, status: 'accepted' },
      ],
      relations: ['requester', 'addressee'],
      order: { updatedAt: 'DESC' },
    });

    // 2. All direct messages involving current user
    const allMessages = await this.messagesRepo.find({
      where: [{ senderId: currentUserId }, { recipientId: currentUserId }],
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
    });

    const peersMap = new Map<
      string,
      {
        user: any;
        lastMessage: string;
        lastAt: Date | null;
        unreadCount: number;
      }
    >();

    for (const f of friendships) {
      const peer = f.requesterId === currentUserId ? f.addressee : f.requester;
      if (peer && !peersMap.has(peer.id)) {
        peersMap.set(peer.id, {
          user: this.formatUser(peer),
          lastMessage: '',
          lastAt: null,
          unreadCount: 0,
        });
      }
    }

    for (const m of allMessages) {
      const peer = m.senderId === currentUserId ? m.recipient : m.sender;
      if (!peer) continue;

      const existing = peersMap.get(peer.id);
      const isUnread = m.recipientId === currentUserId && !m.readAt;

      if (!existing) {
        peersMap.set(peer.id, {
          user: this.formatUser(peer),
          lastMessage: m.body,
          lastAt: m.createdAt,
          unreadCount: isUnread ? 1 : 0,
        });
      } else {
        if (!existing.lastAt) {
          existing.lastMessage = m.body;
          existing.lastAt = m.createdAt;
        }
        if (isUnread) {
          existing.unreadCount += 1;
        }
      }
    }

    return Array.from(peersMap.values()).sort((a, b) => {
      const tA = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tB = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tB - tA;
    });
  }

  async getThread(currentUserId: string, peerId: string) {
    const peer = await this.usersRepo.findOne({
      where: { id: peerId, deletedAt: IsNull() },
    });
    if (!peer) {
      throw new NotFoundException('Recipient not found');
    }

    // Mark unread incoming messages from this peer as read
    await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({ readAt: new Date() })
      .where('sender_id = :peerId AND recipient_id = :currentUserId AND read_at IS NULL', {
        peerId,
        currentUserId,
      })
      .execute();

    const messages = await this.messagesRepo.find({
      where: [
        { senderId: currentUserId, recipientId: peerId },
        { senderId: peerId, recipientId: currentUserId },
      ],
      order: { createdAt: 'ASC' },
      take: 200,
    });

    return {
      peer: this.formatUser(peer),
      messages,
    };
  }

  async sendMessage(currentUserId: string, peerId: string, body: string) {
    if (!peerId) {
      throw new BadRequestException('Recipient ID is required');
    }
    if (peerId === currentUserId) {
      throw new BadRequestException('You cannot message yourself');
    }
    const trimmed = (body || '').trim();
    if (!trimmed) {
      throw new BadRequestException('Message cannot be empty');
    }

    const peer = await this.usersRepo.findOne({
      where: { id: peerId, deletedAt: IsNull() },
    });
    if (!peer) {
      throw new NotFoundException('Recipient not found');
    }

    const msg = this.messagesRepo.create({
      senderId: currentUserId,
      recipientId: peerId,
      body: trimmed,
      readAt: null,
    });
    return this.messagesRepo.save(msg);
  }
}