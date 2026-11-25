import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

class CreatePostDto {
  @IsOptional()
  @IsString()
  communityId?: string;

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

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsOptional()
  @IsString()
  pageId?: string;
}

class UpdatePostDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(1)
  body: string;
}

class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body: string;
}

class UpdateCommentDto {
  @IsString()
  @MinLength(1)
  body: string;
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
  list(
    @CurrentUser() user: User,
    @Query('communityId') communityId?: string,
    @Query('groupId') groupId?: string,
    @Query('pageId') pageId?: string,
  ) {
    return this.service.findByCommunity(communityId, user?.id, 20, groupId, pageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  updatePost(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.service.updatePost(id, user.id, dto);
  }

  @Delete(':id')
  deletePost(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deletePost(id, user.id);
  }

  @Post(':id/like')
  toggleLike(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.toggleLike(id, user.id);
  }

  @Get(':id/comments')
  listComments(@Param('id') id: string) {
    return this.service.listComments(id);
  }

  @Post(':id/comments')
  addComment(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.addComment(id, user.id, dto.body);
  }

  @Patch(':postId/comments/:commentId')
  updateComment(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.service.updateComment(postId, commentId, user.id, dto.body);
  }

  @Delete(':postId/comments/:commentId')
  deleteComment(
    @CurrentUser() user: User,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.service.deleteComment(postId, commentId, user.id);
  }

  @Post(':id/share')
  share(@Param('id') id: string) {
    return this.service.sharePost(id);
  }
}