import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../providers/database/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { err, ok } from 'tryless';

jest.mock('../auth/constants/scrypt', () => ({
  scrypt: jest.fn().mockImplementation(() => {
    return Buffer.from('hasheddummypassword');
  }),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUserRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserByEmail', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      userRepository.findOne.mockResolvedValue(mockUser as any);

      const result = await service.getUserByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        relations: ['sentTransactions', 'receivedTransactions'],
      });
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should not throw when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com')).resolves.not.toThrow();
    });
  });
});