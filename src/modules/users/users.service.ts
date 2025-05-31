import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { scrypt } from '../auth/constants/scrypt';

const USERS_TESTE = [
  {
    id: '1',
    username: 'Axel Jr',
    email: 'axel@teste.com',
    password: '4c0992d7bd3ff777.23bad9c2810cf28304f0db6f474cce75516c90f6a065b16a9257d9ac36fcb70e',
    balance: 0
  },
  {
    id: '2',
    username: 'Josh Hdg',
    email: 'josh@teste.com',
    password: '21100cced83d0df2.8083d409dd54aaba4791cdf8287e70143a12cf403aa0e34f906ca90b5977d310',
    balance: 50000
  }
]

@Injectable()
export class UsersService {
  async getUserByEmail(email: string) {
    const user = USERS_TESTE.find(user => user.email === email);

    return user;
  }

  async validateUser(email: string, password?: string) {
    const existingUser = USERS_TESTE.find(user => user.email === email);

    if(existingUser) {
      throw new ConflictException('User already exists');
    }
  }

  async createUser(dto: CreateUserDto) {

    await this.validateUser(dto.email, dto.password);

    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(dto.password, salt, 32) as Buffer;

    const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const newUser = {
      id: (USERS_TESTE.length + 1).toString(),
      email: dto.email,
      password: saltAndHash,
      username: dto.username,
      balance: 0
    };

    USERS_TESTE.push(newUser);

    Logger.log(`User created: `, newUser);

    const { password: _, ...userWithoutPassword } = newUser;

    return userWithoutPassword;
  }

  async updateUserBalance(userId: string, newBalance: number) {
    const user = USERS_TESTE.find(user => user.id === userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.balance = newBalance; // Example balance update logic

    USERS_TESTE.push(user);

    // delete newUser.password;
    return user;
  }
}
