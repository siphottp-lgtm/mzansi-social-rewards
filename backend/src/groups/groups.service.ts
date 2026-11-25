import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from '../common/entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

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

  async update(id: string, userId: string, dto: UpdateGroupDto) {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.creatorId !== userId) {
      throw new ForbiddenException('You can only edit your own group');
    }

    if (dto.name !== undefined) group.name = dto.name.trim();
    if (dto.description !== undefined) group.description = dto.description;
    if (dto.privacy !== undefined) group.privacy = dto.privacy;

    return this.groupsRepository.save(group);
  }

  async remove(id: string, userId: string) {
    const group = await this.groupsRepository.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');
    if (group.creatorId !== userId) {
      throw new ForbiddenException('You can only delete your own group');
    }

    await this.groupsRepository.delete({ id });
    return { deleted: true, id };
  }
}