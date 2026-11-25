import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FriendsModule } from './friends/friends.module';
import { GroupsModule } from './groups/groups.module';
import { StoriesModule } from './stories/stories.module';
import { PagesModule } from './pages/pages.module';
import { MessagesModule } from './messages/messages.module';
import { CommunitiesModule } from './communities/communities.module';
import { PostsModule } from './posts/posts.module';
import { EventsModule } from './events/events.module';
import { UploadsModule } from './uploads/uploads.module';
import { User } from './common/entities/user.entity';
import { Community } from './common/entities/community.entity';
import { CommunityMembership } from './common/entities/community-membership.entity';
import { Post } from './common/entities/post.entity';
import { Event } from './common/entities/event.entity';
import { EventAttendee } from './common/entities/event-attendee.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      process.env.DATABASE_URL
        ? {
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: true,
            ssl: { rejectUnauthorized: false },
          }
        : {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432', 10),
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'community_app',
            autoLoadEntities: true,
            synchronize: false,
            logging: process.env.NODE_ENV !== 'production',
          },
    ),
    AuthModule,
    UsersModule,
    FriendsModule,
    GroupsModule,
    StoriesModule,
    PagesModule,
    MessagesModule,
    CommunitiesModule,
    PostsModule,
    EventsModule,
    UploadsModule,
  ],
})
export class AppModule {}
