import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../common/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async findById(id: string) {
    const user = await this.repo.findOne({ where: { id, deletedAt: null as any } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, data: Partial<User>) {
    const user = await this.repo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException();
    Object.assign(user, {
      firstName: data.firstName ?? user.firstName,
      lastName: data.lastName ?? user.lastName,
      displayName: data.displayName ?? user.displayName,
      bio: data.bio ?? user.bio,
      avatarUrl: data.avatarUrl ?? user.avatarUrl,
      location: data.location ?? user.location,
      timezone: data.timezone ?? user.timezone,
    });
    await this.repo.save(user);
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
