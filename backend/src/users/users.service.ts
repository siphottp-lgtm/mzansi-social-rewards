import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  private toSafeUser(user: User) {
    const { passwordHash, ...safe } = user;
    const fullName =
      safe.displayName ||
      [safe.firstName, safe.lastName].filter(Boolean).join(' ') ||
      safe.email ||
      'Mzansi Member';
    return { ...safe, fullName };
  }

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id, deletedAt: null as any } });
    if (!user) throw new NotFoundException('User not found');
    return this.toSafeUser(user);
  }

  async listDirectory(currentUserId: string) {
    const users = await this.repo.find({
      where: {
        id: Not(currentUserId),
        deletedAt: IsNull(),
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.toSafeUser(u));
  }

  async updateProfile(userId: string, data: Partial<User> & { fullName?: string }) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();

    const incomingFullName =
      typeof data.fullName === 'string' ? data.fullName.trim() : undefined;
    const resolvedDisplayName =
      data.displayName !== undefined
        ? data.displayName
        : incomingFullName !== undefined
          ? incomingFullName
          : user.displayName;

    let resolvedFirstName = data.firstName ?? user.firstName;
    let resolvedLastName = data.lastName ?? user.lastName;
    if (incomingFullName && data.firstName === undefined && data.lastName === undefined) {
      const parts = incomingFullName.split(/\s+/);
      resolvedFirstName = parts[0] || user.firstName;
      resolvedLastName = parts.slice(1).join(' ') || user.lastName;
    }

    Object.assign(user, {
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      displayName: resolvedDisplayName,
      bio: data.bio ?? user.bio,
      avatarUrl: data.avatarUrl ?? user.avatarUrl,
      location: data.location ?? user.location,
      timezone: data.timezone ?? user.timezone,
    });
    await this.repo.save(user);
    return this.toSafeUser(user);
  }
}