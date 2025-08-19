import { IsString, IsEnum, IsNumber } from 'class-validator';

export enum BusinessDirection {
  IT = 'IT',
  Programming = 'Programming',
  Marketing = 'Marketing',
  Design = 'Design',
  Sales = 'Sales',
}

export class CreateCompanyInfoDto {
  @IsString()
  company_name: string;

  @IsEnum(BusinessDirection)
  business_direction: BusinessDirection;

  @IsNumber()
  team_size: number;
}
