import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

const USERS_TESTE = [
  {
    id: '1',
    username: 'Fernanda bo re mi pasode',
    password: 'Senha@123',
    balance: 0
  },
  {
    id: '2',
    username: 'User Teste',
    password: 'Senha@123',
    balance: 50000
  }
]

@Injectable()
export class UsersService {
  async getUserById(id: string) {
    const user = USERS_TESTE.find(user => user.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const newUser = {
      id: (USERS_TESTE.length + 1).toString(),
      username: dto.username,
      password: dto.password,
      balance: 50000
    };

    const userExists = USERS_TESTE.find(user => user.username === dto.username);

    if (userExists) {
      throw new ConflictException('Username already exists');
    }

    USERS_TESTE.push(newUser);

    // delete newUser.password;
    return newUser;
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
