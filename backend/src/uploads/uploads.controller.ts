import {
  Controller, Post, UseGuards, UseInterceptors, UploadedFile,
  BadRequestException, Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';
import { UploadsService } from './uploads.service';
import { v4 as uuidv4 } from 'uuid';

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Only image files (jpeg, png, gif, webp) are allowed'), false);
  }
  cb(null, true);
};

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post(':category')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const category = req.params.category;
          const allowed = ['avatars', 'communities', 'posts', 'events'];
          if (!allowed.includes(category)) {
            return cb(new BadRequestException('Invalid upload category'), '');
          }
          cb(null, join(process.cwd(), 'uploads', category));
        },
        filename: (_req, file, cb) => {
          const unique = `${uuidv4()}${extname(file.originalname).toLowerCase()}`;
          cb(null, unique);
        },
      }),
      fileFilter: imageFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  upload(
    @Param('category') category: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = this.uploadsService.getFileUrl(category, file.filename);
    return {
      url,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadedBy: user.id,
    };
  }
}
