import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../common/entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  create(userId: string, dto: CreateGroupDto) {
    const group = this.groupsRepository.create({ ...dto, creatorId: userId });
    return this.groupsRepository.save(group);
  }

  findAll() {
    return this.groupsRepository.find({ order: { createdAt: 'DESC' } });
  }
}
