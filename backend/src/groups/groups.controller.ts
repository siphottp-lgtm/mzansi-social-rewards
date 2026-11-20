import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req, @Body() dto: CreateGroupDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.groupsService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }
}
