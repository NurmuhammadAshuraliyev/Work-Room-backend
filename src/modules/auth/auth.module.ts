import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EskizService } from './eskiz.service';
import { OtpService } from './otp.service';
import { AdminService } from '../admin/admin.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, EskizService, OtpService, AdminService],
})
export class AuthModule {}
