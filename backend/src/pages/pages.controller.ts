import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req, @Body() dto: CreatePageDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.pagesService.create(userId, dto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }
}
