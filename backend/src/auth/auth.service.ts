import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../common/entities/user.entity';

@Injectable()
export class AuthService {
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
      displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email.split('@')[0],
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

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { id: userId, deletedAt: null as any } });
  }

  private sanitize(user: User) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
