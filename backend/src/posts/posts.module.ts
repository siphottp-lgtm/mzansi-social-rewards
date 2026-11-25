import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../common/entities/post.entity';
import { PostLike } from '../common/entities/post-like.entity';
import { PostComment } from '../common/entities/post-comment.entity';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostLike, PostComment]),
    CommunitiesModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}