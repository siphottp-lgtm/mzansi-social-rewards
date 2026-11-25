import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly baseDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure base folders exist
    ['avatars', 'communities', 'posts', 'events'].forEach((folder) => {
      const dir = join(this.baseDir, folder);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    });
  }

  getFileUrl(category: string, filename: string): string {
    const rawBase =
      process.env.API_PUBLIC_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      'http://localhost:3001';
    const base = rawBase.replace(/\/+$/, '');
    return `${base}/uploads/${category}/${filename}`;
  }

  generateFilename(originalName: string): string {
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${uuidv4()}.${ext}`;
  }
}