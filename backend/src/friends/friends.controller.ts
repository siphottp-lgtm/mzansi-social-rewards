import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private friendsService: FriendsService) {}

  @Get()
  overview(@CurrentUser() user: User) {
    return this.friendsService.getOverview(user.id);
  }

  @Post('request')
  sendRequest(@CurrentUser() user: User, @Body('targetUserId') targetUserId: string) {
    return this.friendsService.sendRequest(user.id, targetUserId);
  }

  @Post(':id/accept')
  accept(@CurrentUser() user: User, @Param('id') id: string) {
    return this.friendsService.acceptRequest(user.id, id);
  }

  @Post(':id/decline')
  decline(@CurrentUser() user: User, @Param('id') id: string) {
    return this.friendsService.declineRequest(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.friendsService.removeFriendship(user.id, id);
  }
}