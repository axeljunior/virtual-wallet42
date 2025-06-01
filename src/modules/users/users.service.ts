import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { scrypt } from '../auth/constants/scrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from "../../providers/database/entities/user.entity";
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(  @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['sentTransactions', 'receivedTransactions'] });
    console.log(user?.transactions)

    return user;
  }

  async validateUser(email: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if(existingUser) {
      throw new ConflictException('User already exists');
    }
  }

  async createUser(dto: CreateUserDto) {

    await this.validateUser(dto.email);

    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(dto.password, salt, 32) as Buffer;

    const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const newUser = this.userRepository.create({
      email: dto.email,
      password: saltAndHash,
      balance: 0
    });

    await this.userRepository.save({ email: dto.email, password: saltAndHash });

    const { password: _, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }

  async updateUserBalance(userId: string, newBalance: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.update(userId, { balance: newBalance });

    return user;
  }
}
