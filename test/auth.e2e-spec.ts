import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { TransactionEntity } from '../src/providers/database/entities/transaction.entity';
import { SolicitationEntity } from '../src/providers/database/entities/solicitation.entity';
import { UserEntity } from '../src/providers/database/entities/user.entity';
import { AppModule } from '../src/app.modules';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let transactionRepository: Repository<TransactionEntity>;
  let solicitationRepository: Repository<SolicitationEntity>;
  let jwtService: JwtService;
  let senderToken: string;
  let authToken: string;
  let receiverToken: string;
  let solicitationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: 'testSecret',
            signOptions: {
              expiresIn: '1h',
            },
          }),
        }),
        PassportModule,
      ],
    }).compile();
    console.log('Module compiled successfully');

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );

    await app.init();

    userRepository = moduleFixture.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );

    const dataSource = app.get(DataSource);

    // Limpar o banco de dados antes dos testes
    await dataSource.dropDatabase();
    await dataSource.synchronize(true); // força o drop & recreate
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - Deve retornar um erro de não autorizado', async () => {

    await request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });

  it('/ (POST) - Deve retornar um JWT valido', async () => {

    await request(app.getHttpServer())
        .post('/users')
        .send({
            email: 'tester42@example.com',
            password: 'Password@123',
    });

    const userTesterLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            email: 'tester42@example.com',
            password: 'Password@123',
        })
        .expect(201);

    expect(userTesterLoginResponse.body).toHaveProperty('accessToken')
    authToken = userTesterLoginResponse.body.accessToken
  });

  it('/ (GET) - Deve retornar o usuario autenticado', async () => {

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('email', 'tester42@example.com')
  });
});