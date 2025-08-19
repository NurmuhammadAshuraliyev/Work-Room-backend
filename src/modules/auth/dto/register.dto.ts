import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { CreateProfileAnswersDto } from './create-profile-answers.dto';
import { CreateCompanyInfoDto } from './create-company-info.dto';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(20)
  @MinLength(5)
  username: string;

  @IsString()
  password: string;

  @IsPhoneNumber('UZ')
  phone: string;

  @IsOptional()
  profileAnswers: CreateProfileAnswersDto[];

  @IsOptional()
  companyInfo: CreateCompanyInfoDto;
}
