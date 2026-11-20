import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { IsString, IsOptional, MinLength } from 'class-validator';

class CreateCommunityDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;
}

@Controller('communities')
@UseGuards(JwtAuthGuard)
export class CommunitiesController {
  constructor(private service: CommunitiesService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateCommunityDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  myCommunities(@CurrentUser() user: User) {
    return this.service.findAllForUser(user.id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Post(':id/join')
  join(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.join(id, user.id);
  }
}
