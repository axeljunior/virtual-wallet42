import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.modules';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) - Deve retornar status 404 para rota inexistente', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(404);
  });

  // it('/health (GET) - Deve verificar se a aplicação está funcionando', () => {
  //   return request(app.getHttpServer())
  //     .get('/health')
  //     .expect(200)
  //     .expect({ status: 'ok' });
  // });
});
