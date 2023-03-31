import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';
import { SaveTokenDto } from './dto/save-token.dto';
import { Token } from './schemas/token.schema';
import { PayloadWithUser } from './interfaces/payloadWithUser';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async find(token: string) {
    const refreshToken = await this.tokenModel
      .findOne({ refresh: token })
      .exec();

    return refreshToken;
  }

  async findByUserId(userId: string) {
    const refreshToken = await this.tokenModel.findOne({ user: userId }).exec();

    return refreshToken;
  }

  async saveToken(saveTokenDto: SaveTokenDto) {
    const tokenData = await this.findByUserId(saveTokenDto.userId);

    if (tokenData) {
      tokenData.refreshToken = saveTokenDto.refreshToken;
      return tokenData.save();
    }

    const token = new this.tokenModel(saveTokenDto);

    return token.save();
  }

  async remove(refreshToken: string) {
    this.tokenModel.findOneAndDelete({ refreshToken });
  }

  async generateTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET_KEY'),
        expiresIn: this.configService.get('TOKEN_EXPIRE_TIME'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET_REFRESH_KEY'),
        expiresIn: this.configService.get('TOKEN_REFRESH_EXPIRE_TIME'),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(accessToken: string) {
    try {
      const userData = await this.jwtService.verifyAsync<PayloadWithUser>(
        accessToken,
        {
          maxAge: this.configService.get('TOKEN_EXPIRE_TIME'),
          secret: this.configService.get('JWT_SECRET_KEY'),
        },
      );
      return userData;
    } catch (e) {
      return null;
    }
  }

  async verifyRefreshToken(refreshToken: string) {
    try {
      const userData = await this.jwtService.verifyAsync<PayloadWithUser>(
        refreshToken,
        {
          maxAge: this.configService.get('TOKEN_REFRESH_EXPIRE_TIME'),
          secret: this.configService.get('JWT_SECRET_REFRESH_KEY'),
        },
      );

      return userData;
    } catch (e) {
      return null;
    }
  }
}
