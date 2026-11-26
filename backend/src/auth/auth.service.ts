import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from '../common/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly resetSecret =
    process.env.JWT_SECRET || 'dev-secret-change-me-in-production';

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  }) {
    const existing = await this.usersRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = this.usersRepo.create({
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName:
        data.displayName ||
        `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
        data.email.split('@')[0],
      isVerified: false,
    });
    await this.usersRepo.save(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: this.sanitize(user), accessToken: token };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email, deletedAt: null as any } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { user: this.sanitize(user), accessToken: token };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await this.usersRepo.findOne({
      where: { email: normalizedEmail, deletedAt: IsNull() },
    });

    if (!user || !user.passwordHash || !user.email) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
    const payload = Buffer.from(
      JSON.stringify({ sub: user.id, exp: expiresAt }),
      'utf8',
    ).toString('base64url');
    const sig = this.signResetPayload(payload, user.passwordHash);
    const resetToken = `${payload}.${sig}`;

    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${frontendBase}/reset-password/?token=${encodeURIComponent(resetToken)}`;

    const emailSent = await this.sendPasswordResetEmail(user.email, resetUrl);
    if (emailSent) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Fallback when RESEND_API_KEY is not configured yet
    return {
      message: 'Reset link generated (email provider not configured; use the token below within 1 hour).',
      resetToken,
      resetUrl,
      expiresAt,
    };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword || newPassword.length < 8) {
      throw new BadRequestException(
        'A valid reset token and a password of at least 8 characters are required.',
      );
    }

    const parts = token.trim().split('.');
    if (parts.length !== 2) {
      throw new BadRequestException('Invalid or malformed reset token.');
    }

    const [payloadB64, providedSig] = parts;
    let parsed: { sub?: string; exp?: number };
    try {
      parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    } catch {
      throw new BadRequestException('Invalid reset token payload.');
    }

    if (!parsed?.sub || !parsed?.exp || Date.now() > parsed.exp) {
      throw new BadRequestException('Reset token has expired. Request a new one.');
    }

    const user = await this.usersRepo.findOne({
      where: { id: parsed.sub, deletedAt: IsNull() },
    });
    if (!user || !user.passwordHash) {
      throw new BadRequestException('Invalid reset token.');
    }

    const expectedSig = this.signResetPayload(payloadB64, user.passwordHash);
    const providedBuf = Buffer.from(providedSig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (
      providedBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(providedBuf, expectedBuf)
    ) {
      throw new BadRequestException('Reset token is invalid or has already been used.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepo.save(user);

    return { message: 'Password updated successfully. You can now sign in.' };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id: userId, deletedAt: null as any } });
  }

  private async sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false;

    const fromAddress = process.env.MAIL_FROM || 'Mzansi Community <onboarding@resend.dev>';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [toEmail],
          subject: 'Reset your Mzansi password',
          html: `
            <p>We received a request to reset your password.</p>
            <p><a href="${resetUrl}">Click here to reset your password</a> (valid for 1 hour).</p>
            <p>If you did not request this, you can safely ignore this email.</p>
          `,
          text: `Reset your Mzansi password (valid for 1 hour): ${resetUrl}`,
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        this.logger.warn(`Resend API returned ${res.status}: ${bodyText}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.warn(`Failed to send password reset email: ${err?.message || err}`);
      return false;
    }
  }

  private signResetPayload(payloadB64: string, passwordHash: string): string {
    return crypto
      .createHmac('sha256', `${this.resetSecret}:${passwordHash}`)
      .update(payloadB64)
      .digest('base64url');
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}