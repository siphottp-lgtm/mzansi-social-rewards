import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../common/entities/community.entity';
import { CommunityMembership } from '../common/entities/community-membership.entity';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Community, CommunityMembership])],
  providers: [CommunitiesService],
  controllers: [CommunitiesController],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
