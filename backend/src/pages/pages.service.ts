import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../common/entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pagesRepository: Repository<Page>,
  ) {}

  create(userId: string, dto: CreatePageDto) {
    const page = this.pagesRepository.create({ ...dto, ownerId: userId });
    return this.pagesRepository.save(page);
  }

  findAll() {
    return this.pagesRepository.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: string, userId: string, dto: UpdatePageDto) {
    const page = await this.pagesRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    if (page.ownerId !== userId) {
      throw new ForbiddenException('You can only edit your own page');
    }

    if (dto.title !== undefined) page.title = dto.title.trim();
    if (dto.category !== undefined) page.category = dto.category;
    if (dto.bio !== undefined) page.bio = dto.bio;
    if (dto.avatarUrl !== undefined) page.avatarUrl = dto.avatarUrl;

    return this.pagesRepository.save(page);
  }

  async remove(id: string, userId: string) {
    const page = await this.pagesRepository.findOne({ where: { id } });
    if (!page) throw new NotFoundException('Page not found');
    if (page.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own page');
    }

    await this.pagesRepository.delete({ id });
    return { deleted: true, id };
  }
}