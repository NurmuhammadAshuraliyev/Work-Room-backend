import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail() email: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  company?: {
    company_name: string;
    business_direction: string;
    team_size: number;
  };
}
