import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../common/entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';

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
}
