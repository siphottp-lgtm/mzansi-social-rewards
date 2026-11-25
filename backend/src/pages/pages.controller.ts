import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
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

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdatePageDto) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.pagesService.update(id, userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId || req.user.id || req.user.sub;
    return this.pagesService.remove(id, userId);
  }
}