import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

class CreatePostDto {
  @IsString()
  communityId: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsOptional()
  @IsString()
  postType?: string;

  @IsOptional()
  @IsBoolean()
  isOfficial?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private service: PostsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.service.create(user.id, dto.communityId, dto);
  }

  @Get()
  list(@Query('communityId') communityId: string) {
    return this.service.findByCommunity(communityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
