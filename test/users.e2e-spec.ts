import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../src/providers/database/entities/user.entity';
import { AppModule } from '../src/app.modules';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<UserEntity>;
  let jwtToken: string;

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

  it('/ (POST) - Deve retornar um erro de validação de email', async () => {
    const createUserDto = {
      email: 'teste.com',
      password: 'senha123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);

    expect(response.body.message[0]).toContain('email must be an email');
    expect(response.body.error).toBe("Bad Request");
    expect(response.body.statusCode).toBe(400);
  });

  it('/ (POST) - Deve retornar um erro de validação de senha', async () => {
    const createUserDto = {
      email: 'teste@example.com',
      password: 'senha123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(400);

    expect(response.body.message[0]).toContain('The password must be at least 8 characters long, contain numbers, and both uppercase and lowercase letters');
    expect(response.body.error).toBe("Bad Request");
    expect(response.body.statusCode).toBe(400);
  });

  it('/ (POST) - Deve criar um novo usuario no banco', async () => {
    const createUserDto = {
      email: 'teste@example.com',
      password: 'Password@123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('email', createUserDto.email);
    expect(response.body).toHaveProperty('balance', 0);

    // Salvar o id do usuário para outros testes
    const userId = response.body.id;

    // Verificar se o usuário foi salvo no banco
    const savedUser = await userRepository.findOne({ where: { id: userId } });

    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(createUserDto.email);
  });

    it('/ (POST) - Deve um erro de email já existente', async () => {
    const createUserDto = {
      email: 'teste@example.com',
      password: 'Password@123',
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(409);

    expect(response.body).toHaveProperty('error', "Conflict");
    expect(response.body).toHaveProperty('message', "Email já cadastrado");
    expect(response.body).toHaveProperty('statusCode', 409);

    // Salvar o id do usuário para outros testes
    const userId = response.body.id;

    // Verificar se o usuário foi salvo no banco
    const savedUser = await userRepository.findOne({ where: { id: userId } });

    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe(createUserDto.email);
  });
});