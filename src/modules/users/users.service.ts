import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true,
  email: true,
  username: true,
  phone: true,
  company: {
    select: {
      id: true,
      company_name: true,
      business_direction: true,
      team_size: true,
      user_id: true,
    },
  },
};

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}
  async me(userId: string) {
    const findUser = await this.db.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    if (!findUser) throw new NotFoundException('Information not found');

    return findUser;
  }
  async checkEmail(email: string) {
    const emailExists = await this.db.prisma.user.findFirst({
      where: {
        email,
      },
    });
    return emailExists ? true : false;
  }

  async create(dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const data: Prisma.UserCreateInput = {
        email: dto.email,
        username: dto.username ?? null,
        password: hashed,
        phone: dto.phone,
        company: dto.company
          ? {
              create: {
                company_name: dto.company.company_name,
                business_direction: dto.company.business_direction,
                team_size: dto.company.team_size,
              },
            }
          : undefined,
      };

      const user = await this.db.prisma.user.create({
        data,
        select: USER_SELECT,
      });

      return user;
    } catch (e) {
      if (this.isUniqueError(e, 'users_email_key')) {
        throw new BadRequestException('Bu email allaqachon mavjud');
      }
      throw e;
    }
  }

  async findAll(q: QueryUserDto) {
    const { page, limit, search, sortBy, order } = q;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [items, total] = await this.db.prisma.$transaction([
      this.db.prisma.user.findMany({
        where,
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
      }),
      this.db.prisma.user.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async findOne(id: string) {
    const user = await this.db.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('User topilmadi');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    let password: string | undefined;
    if (dto.password) {
      password = await bcrypt.hash(dto.password, 10);
    }

    const companyOp = dto.company
      ? {
          upsert: {
            create: {
              company_name: dto.company.company_name ?? 'Company',
              business_direction: dto.company.business_direction ?? 'N/A',
              team_size: dto.company.team_size ?? 1,
            },
            update: {
              company_name: dto.company.company_name,
              business_direction: dto.company.business_direction,
              team_size: dto.company.team_size,
            },
          },
        }
      : undefined;

    try {
      const user = await this.db.prisma.user.update({
        where: { id },
        data: {
          email: dto.email,
          username: dto.username,
          phone: dto.phone,
          ...(password ? { password } : {}),
          ...(companyOp ? { company: companyOp } : {}),
        },
        select: USER_SELECT,
      });
      return user;
    } catch (e) {
      if (this.isUniqueError(e, 'users_email_key')) {
        throw new BadRequestException('Bu email allaqachon mavjud');
      }
      throw e;
    }
  }

  async remove(id: string) {
    const existing = await this.db.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) throw new NotFoundException('User topilmadi');

    const company = await this.db.prisma.company.findUnique({
      where: { user_id: id },
      select: { id: true },
    });

    const [, deletedUser] = await this.db.prisma.$transaction([
      company
        ? this.db.prisma.company.delete({ where: { id: company.id } })
        : this.db.prisma.$executeRaw`SELECT 1`,
      this.db.prisma.user.delete({ where: { id }, select: USER_SELECT }),
    ]);

    return deletedUser;
  }

  private isUniqueError(e: any, constraint?: string) {
    if (e?.code === 'P2002') return true;
    if (
      constraint &&
      typeof e?.message === 'string' &&
      e.message.includes(constraint)
    )
      return true;
    return false;
  }
}
