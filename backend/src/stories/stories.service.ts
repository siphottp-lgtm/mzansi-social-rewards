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

  findAllActive() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.storiesRepository.find({
      where: { createdAt: MoreThan(twentyFourHoursAgo) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
