import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Story } from '../common/entities/story.entity';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private storiesRepository: Repository<Story>,
  ) {}

  create(userId: string, dto: CreateStoryDto) {
    const story = this.storiesRepository.create({ ...dto, userId });
    return this.storiesRepository.save(story);
  }

  async findAllActive() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const stories = await this.storiesRepository.find({
      where: { createdAt: MoreThan(twentyFourHoursAgo) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return stories.map((s) => {
      const u: any = s.user || {};
      const authorName =
        u.displayName ||
        [u.firstName, u.lastName].filter(Boolean).join(' ') ||
        u.email ||
        'Mzansi Member';
      const { passwordHash, ...safeUser } = u;
      return {
        ...s,
        authorName,
        user: Object.keys(safeUser).length ? { ...safeUser, fullName: authorName } : null,
      };
    });
  }
}