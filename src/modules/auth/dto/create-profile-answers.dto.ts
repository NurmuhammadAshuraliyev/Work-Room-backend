import { IsString, IsOptional, IsArray } from 'class-validator';

interface IAnswerOptions {
  answer_id: string;
  option_id: string;
}

export class CreateProfileAnswersDto {
  @IsString()
  question_id: string;

  @IsString()
  answer_text: string;

  @IsArray()
  @IsOptional()
  answer_options: Array<IAnswerOptions>;
}
