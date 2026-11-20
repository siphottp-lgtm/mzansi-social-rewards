import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req, @Body() dto: CreateStoryDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.storiesService.create(userId, dto);
  }

  @Get()
  findAllActive() {
    return this.storiesService.findAllActive();
  }
}
