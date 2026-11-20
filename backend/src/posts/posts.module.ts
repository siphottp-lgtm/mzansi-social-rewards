import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../common/entities/post.entity';
import { CommunityMembership } from '../common/entities/community-membership.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, CommunityMembership]),
    CommunitiesModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
