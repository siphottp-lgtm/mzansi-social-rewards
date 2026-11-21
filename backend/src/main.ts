import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

const allowedOrigins = [
  'https://mzansi-social-rewards-6h1m.vercel.app',
  'https://siphottp-lgtm.github.io',
  'http://localhost:3000',
  'http://192.168.100.23:3000',
  'http://192.168.100.23',
  'capacitor://localhost',
  'https://localhost',
  process.env.FRONTEND_URL,
].filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve uploaded images as static files
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, PowerShell, mobile native HTTP without Origin)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Community API running on http://0.0.0.0:${port}`);
  console.log(`Uploads served from /uploads/`);
}
bootstrap();
