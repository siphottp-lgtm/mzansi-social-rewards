import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

class SendMessageDto {
  @IsString()
  @MinLength(1)
  body: string;
}

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  listConversations(@CurrentUser() user: User) {
    return this.messagesService.listConversations(user.id);
  }

  @Get(':peerId')
  getThread(@CurrentUser() user: User, @Param('peerId') peerId: string) {
    return this.messagesService.getThread(user.id, peerId);
  }

  @Post(':peerId')
  sendMessage(
    @CurrentUser() user: User,
    @Param('peerId') peerId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.id, peerId, dto.body);
  }
}