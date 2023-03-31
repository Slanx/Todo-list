import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { PasswordDto } from './dto/password.dto';
import { UserParams } from 'src/common/decorators/user';
import { Public } from 'src/common/decorators/public';
import { ParseStringLowPipe } from 'src/common/pipes/ParseStringLow.pipe';
import MongooseClassSerializerInterceptor from 'src/common/interceptors/mongooseClassSerialazer.interceptor';
import { User } from './schemas/user.schema';

@Controller('user')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Public()
  @Get(':login')
  async findOneByLogin(
    @Param('login', new ParseStringLowPipe()) login: string,
  ) {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  @Patch('password')
  async updatePassword(
    @UserParams('userId') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(userId, updatePasswordDto);
  }

  @Patch('')
  async update(
    @UserParams('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @Delete('')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @UserParams('userId') userId: string,
    @Body() passwordDto: PasswordDto,
  ) {
    return this.usersService.remove(userId, passwordDto);
  }
}
