import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('directory')
  directory(@CurrentUser() user: User) {
    return this.usersService.listDirectory(user.id);
  }

  @Get('me')
  me(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Get('profile')
  profile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: User, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() body: any) {
    return this.usersService.updateProfile(user.id, body);
  }
}