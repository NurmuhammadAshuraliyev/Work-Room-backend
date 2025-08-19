import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpException,
  Post,
  Req,
  Res,
  SetMetadata,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/create-auth.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifySmsCodeDto } from './dto/verify.sms.code.dto';
import { CreateAuthDto } from './dto/register.dto';
import bcrypt from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { CreateProfileAnswersDto } from './dto/create-profile-answers.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly adminService: AdminService,
  ) {}

  @Post('send-otp')
  @SetMetadata('isPublic', true)
  @HttpCode(200)
  async sendOtp(@Body() body: SendOtpDto) {
    try {
      return await this.authService.sendOtp(body);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('verify-otp')
  @SetMetadata('isPublic', true)
  @HttpCode(200)
  async verifyOtp(
    @Body() body: VerifySmsCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { phone_number, code } = body;
    try {
      const { message, token } = await this.authService.verifyOtp(
        phone_number,
        code,
      );

      res.cookie('success_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 3600 * 1000,
        secure: false,
        sameSite: 'lax',
      });

      return { message, token };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('check')
  @HttpCode(200)
  async checkAuth(@Req() req: Request) {
    const token = req.cookies['token'];
    if (!token) return false;
    return true;
  }

  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const { companyInfo, email, password, phone, profileAnswers, username } =
        createAuthDto;

      const hashPassword = await bcrypt.hash(password, 12);

      const { token, user } = await this.authService.register({
        email,
        username,
        password: hashPassword,
        phone,
      });

      if (companyInfo) {
        await this.adminService.createCompany(companyInfo, user.id);
      }

      if (profileAnswers) {
        await Promise.all(
          profileAnswers.map(async (answer: any) => {
            await this.adminService.addAnswerQuestion(answer);
          }),
        );
      }

      res.cookie('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 1000,
        secure: false,
        sameSite: 'lax',
      });

      return {
        message: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
        token,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status || 400);
    }
  }

  @Post('login')
  @SetMetadata('isPublic', true)
  @HttpCode(200)
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = await this.authService.login(loginAuthDto);

    res.cookie('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 1000,
      secure: false,
      sameSite: 'lax',
    });

    return { token };
  }

  @Post()
  async logout() {}
}
