import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common/exceptions';
import { compare } from 'bcrypt';
import { TokenService } from '../token/token.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {}
  async signUp(createUserDto: CreateUserDto) {
    const user = await this.usersService.findOneByLogin(createUserDto.login);

    if (user) {
      throw new BadRequestException('User already exists with this login');
    }

    return this.usersService.create(createUserDto);
  }

  async login(loginDto: LoginDto) {
    const { password, login } = loginDto;

    const validUser = await this.validateUser(login, password);

    if (!validUser)
      throw new ForbiddenException('Check your login or password');

    const tokens = await this.tokenService.generateTokens({
      userId: validUser._id.toString(),
    });

    await this.tokenService.saveToken({
      userId: validUser._id.toString(),
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  private async validateUser(login: string, password: string) {
    const user = await this.usersService.findOneByLogin(login);

    if (!user) return null;

    const isPasswordMatch = await compare(password, user.password);

    if (!isPasswordMatch) return null;

    return user;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('User not authorized');

    const userData = await this.tokenService.verifyRefreshToken(refreshToken);

    const tokenFromDb = this.tokenService.find(refreshToken);

    if (!userData || !tokenFromDb) {
      throw new UnauthorizedException('User not authorized');
    }

    const tokens = await this.tokenService.generateTokens({
      userId: userData.userId,
    });

    await this.tokenService.saveToken({
      userId: userData.userId,
      refreshToken: tokens.refreshToken,
    });

    return { ...tokens };
  }

  async remove(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('User not authorized');
    await this.tokenService.remove(refreshToken);
  }
}
