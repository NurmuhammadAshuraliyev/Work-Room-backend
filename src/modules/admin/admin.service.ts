import {
  ConflictException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PrismaService } from 'src/core/database/prisma.service';
import { QuestionAnswer } from './dto/question-answer.dto';

@Injectable()
export class AdminService {
  constructor(private db: PrismaService) {}

  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const question = await this.db.prisma.userProfileQuestions.create({
      data: {
        question_text: createQuestionDto.question_text,
        question_type: createQuestionDto.question_type,
        is_required: createQuestionDto.is_required ? true : false,
        step_number: createQuestionDto.step_number,
      },
    });
    if (createQuestionDto?.options.length >= 1) {
      const options = createQuestionDto.options.map(
        ({ option_text, option_value }) => {
          return this.db.prisma.questionOptions.create({
            data: {
              question_id: question.id,
              option_text,
              option_value,
            },
          });
        },
      );
      await Promise.all([...options]);
    }
    return {
      message: 'success',
      question_id: question.id,
    };
  }

  async getQuestions(step_number: number) {
    const questions = await this.db.prisma.userProfileQuestions.findMany({
      where: {
        step_number,
      },
      include: {
        options: true,
      },
    });

    return questions;
  }

  async addAnswerQuestion(questionAnswer: QuestionAnswer) {
    const questionExists = await this.db.prisma.userProfileQuestions.findUnique(
      {
        where: { id: questionAnswer.question_id },
      },
    );

    if (!questionExists) {
      throw new NotAcceptableException('Savol topilmadi');
    }

    await this.db.prisma.userProfileQuestionAnswers.create({
      data: {
        answer_text: questionAnswer.answer_text,
        question_id: questionAnswer.question_id,
      },
    });

    if (questionAnswer?.answer_options) {
      const answerOptions = questionAnswer.answer_options.map(
        ({ answer_id, option_id }) => {
          return this.db.prisma.selectedAnswerOptions.create({
            data: { option_id, answer_id },
          });
        },
      );

      await Promise.all([...answerOptions]);

      return { message: 'Javoblar qo‘shildi' };
    }
  }

  async createCompany(
    companyInfo: {
      company_name: string;
      business_direction: string;
      team_size: number;
    },
    userId: string,
  ) {
    const findUserId = await this.db.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!findUserId) throw new ConflictException('This user exists');

    const company = await this.db.prisma.company.create({
      data: {
        company_name: companyInfo.company_name,
        business_direction: companyInfo.business_direction,
        team_size: companyInfo.team_size,
        user_id: userId,
      },
    });

    return company;
  }
}
