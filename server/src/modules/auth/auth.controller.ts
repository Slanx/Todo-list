import {
  Controller,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/common/decorators/public';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { convertToMs } from 'src/utils/convertToMs';
import { Cookie } from 'src/common/decorators/cookie';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/schemas/user.schema';
import MongooseClassSerializerInterceptor from 'src/common/interceptors/mongooseClassSerialazer.interceptor';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('signup')
  @UseInterceptors(MongooseClassSerializerInterceptor(User))
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto,
    );

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: convertToMs(
        this.configService.get<string>('TOKEN_REFRESH_EXPIRE_TIME'),
      ),
    });
    return { accessToken };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Cookie('refreshToken') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refresh(token);

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: convertToMs(
        this.configService.get<string>('TOKEN_REFRESH_EXPIRE_TIME'),
      ),
    });

    return { accessToken };
  }

  @Delete('logaut')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logaut(
    @Cookie('refreshToken') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.remove(token);

    response.clearCookie('refreshToken');
  }
}
