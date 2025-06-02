import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { err, ok } from 'tryless';
import { scrypt } from './constants/scrypt';

jest.mock('./constants/scrypt', () => ({
  scrypt: jest.fn().mockImplementation((password, salt, keylen) => {
    if (password === 'correctpassword') {
      return Buffer.from('correcthash');
    }
    return Buffer.from('incorrecthash');
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUsersService = () => ({
    getUserByEmail: jest.fn(),
  });

  const mockJwtService = () => ({
    sign: jest.fn(),
  });

  const mockConfigService = () => ({
    getOrThrow: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useFactory: mockUsersService,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      usersService.getUserByEmail.mockResolvedValue(null);

      const result = await service.login('nonexistent@example.com', 'anypassword');
      expect(result).toEqual(err('NotAuthorizated', 'Invalid email or password'))
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'salt.correcthash',
      };

      usersService.getUserByEmail.mockResolvedValue(mockUser as any);

      const result = await service.login('test@example.com', 'wrongpassword');

      expect(result).toEqual(err('NotAuthorizated', 'Invalid email or password'));
    });

    it('should return JWT token when credentials are valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: `salt.${(await scrypt('correctpassword', 'salt', 32) as Buffer).toString('hex')}`,
      };

      const mockToken = 'jwt-token';
      const mockExpiration = '1h';
      const mockSecret = 'test-secret';

      usersService.getUserByEmail.mockResolvedValue(mockUser as any);
      jwtService.sign.mockReturnValue(mockToken);
      configService.getOrThrow.mockImplementation((key) => {
        if (key === 'JWT_EXPIRATION_TIME') return mockExpiration;
        if (key === 'JWT_SECRET') return mockSecret;
        return undefined;
      });

      const result = await service.login('test@example.com', 'correctpassword');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id },
        {
          expiresIn: mockExpiration,
          secret: mockSecret,
        },
      );
      expect(result).toEqual(ok({ accessToken: mockToken }));
    });
  });
});