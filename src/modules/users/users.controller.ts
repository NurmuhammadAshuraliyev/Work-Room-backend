import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    const userId = req['userId'];

    const user = await this.usersService.me(userId);

    return { user };
  }

  @Post('user/email-check')
  @HttpCode(200)
  async checkEmail(@Body() data: { email: string }) {
    return await this.usersService.checkEmail(data.email);
  }

  @Post()
  @HttpCode(200)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @HttpCode(200)
  findAll(@Query() q: QueryUserDto) {
    return this.usersService.findAll(q);
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('update')
  @HttpCode(200)
  update(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const userId = req['userId'];

    return this.usersService.update(userId, dto);
  }

  @Delete('delete')
  @HttpCode(200)
  remove(@Req() req: Request) {
    const userId = req['userId'];

    return this.usersService.remove(userId);
  }
}
