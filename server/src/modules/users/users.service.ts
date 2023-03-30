import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { hashPassword } from 'src/utils/hash';
import { compare } from 'bcrypt';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly saltRounds: number;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly configService: ConfigService,
  ) {
    this.saltRounds = Number(this.configService.get('CRYPT_SALT'));
  }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await hashPassword(
      this.saltRounds,
      createUserDto.password,
    );

    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.findOne(id);

    const passwordMatch = await compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!passwordMatch) {
      throw new ForbiddenException('Invalid password');
    }

    const hashedNewPassword = await hashPassword(
      this.saltRounds,
      updatePasswordDto.newPassword,
    );

    user.password = hashedNewPassword;

    return user.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    return user;
  }

  async findOneByLogin(login: string) {
    const user = await this.userModel.findOne({ login });

    return user;
  }
}
