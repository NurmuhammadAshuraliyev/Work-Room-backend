import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SendOtpDto } from './dto/send-otp.dto';
import { OtpService } from './otp.service';
import { LoginAuthDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/core/database/redis.service';

interface UserData {
  email: string;
  username?: string;
  password: string;
  phone: string;
}

@Injectable()
export class AuthService {
  constructor(
    private otpService: OtpService,
    private readonly db: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async sendOtp(body: SendOtpDto) {
    const { phone_number } = body;
    const data = await this.otpService.sendSms(phone_number);
    return data;
  }

  async verifyOtp(phone_number: string, code: string) {
    await this.otpService.isBlockedUser(phone_number);

    const { message, token } = await this.otpService.verifyOtpCode(
      phone_number,
      code,
    );

    await this.otpService.checkSuccessToken(phone_number);

    return {
      message,
      token,
    };
  }

  async register(data: UserData) {
    await this.otpService.checkSuccessToken(data.phone);

    const findEmail = await this.db.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (findEmail) throw new ConflictException('This email exists.');

    const user = await this.db.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        phone: data.phone,
        username: data.username,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        username: true,
      },
    });

    const token = await this.jwt.signAsync({ userId: user.id });

    return { token, user };
  }

  async login(loginAuthDto: LoginAuthDto) {
    const findEmail = await this.db.prisma.user.findUnique({
      where: {
        email: loginAuthDto.email,
      },
    });

    if (!findEmail) throw new NotFoundException('Email or password incorrect');

    const comparePassword = await bcrypt.compare(
      loginAuthDto.password,
      findEmail.password,
    );

    if (!comparePassword)
      throw new NotFoundException('Email or password incorrect');

    const token = await this.jwt.signAsync({ userId: findEmail.id });

    return token;
  }

  async logout() {}
}
