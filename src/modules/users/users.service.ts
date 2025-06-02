import { ConflictException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { scrypt } from '../auth/constants/scrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from "../../providers/database/entities/user.entity";
import { Repository } from 'typeorm';
import { err, ok } from 'tryless';

@Injectable()
export class UsersService {
  constructor(  @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>
  ) {}
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['sentTransactions', 'receivedTransactions'] });

    return user;
  }

  async validateUser(email: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if(existingUser) {
      return err('UserAlreadyExists', { message: "Usuario já existe" });
    }

    return ok();
  }

  async generateEncryptedPassword(password: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(password, salt, 32) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  }

  async createUser(dto: CreateUserDto) {

    const isValidUser = await this.validateUser(dto.email);

    if (!isValidUser.success) {
      return isValidUser;
    }

    const encryptedPassword = await this.generateEncryptedPassword(dto.password);

    const newUser = this.userRepository.create({
      email: dto.email,
      password: encryptedPassword ,
      balance: 0
    });

    await this.userRepository.save({ email: dto.email, password: encryptedPassword  });

    const { password: _, ...userWithoutPassword } = newUser;

    return ok(userWithoutPassword);
  }

  async updateUserBalance(userId: string, newBalance: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return err('User update balance: UserNotFound', { userId, message: 'Usuario não encontrado' });
    }

    try {

      await this.userRepository.update(userId, { balance: newBalance });

    } catch (e) {
      Logger.error(`Error updating user balance: ${e}`, 'UsersService');
      return err('User update balance: DatabaseError', { userId, message: 'Erro ao atualizar o saldo do usuário', e });
    }

    return ok(user);
  }
}