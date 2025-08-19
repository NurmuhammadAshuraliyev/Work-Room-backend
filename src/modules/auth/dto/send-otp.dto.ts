import { IsPhoneNumber, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsPhoneNumber('UZ')
  phone_number: string;
}
