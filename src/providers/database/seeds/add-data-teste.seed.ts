import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import { SolicitationEntity } from '../entities/solicitation.entity';
import { randomBytes } from 'crypto';
import { scrypt } from '../../../modules/auth/constants/scrypt';
import { AppModule } from '../../../app.modules';


async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository(UserEntity);
  const transactionRepo = dataSource.getRepository(TransactionEntity);
  const solicitationRepo = dataSource.getRepository(SolicitationEntity);

  // Criar usuários
  const defaultPassword = "Password@123"

  const generateEncryptedPassword = async (password: string) => {
    const salt = randomBytes(8).toString('hex');
    const hash = await scrypt(password, salt, 32) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  }

  const user1 = userRepo.create({
    email: 'alice@example.com',
    password: await generateEncryptedPassword(defaultPassword),
    balance: 1000,
  });

  const user2 = userRepo.create({
    email: 'bob@example.com',
    password: await generateEncryptedPassword(defaultPassword),
    balance: 500,
  });

  await userRepo.save([user1, user2]);

  // Criar transação user1 como sender
  const transaction = transactionRepo.create({
    userSender: user1,
    userReceiver: user2,
    value: 150,
  });

  await transactionRepo.save(transaction);

  // Criar transação user1 como receiver
  const transaction2 = transactionRepo.create({
    userSender: user2,
    userReceiver: user1,
    value: 33,
  });

  await transactionRepo.save(transaction2);

  // Criar solicitação ligada à transação
  const solicitation = solicitationRepo.create({
    status: 'pendente',
    type: 'transferencia',
    transaction: transaction,
  });

  await solicitationRepo.save(solicitation);

    const solicitation2 = solicitationRepo.create({
    status: 'pendente',
    type: 'transferencia',
    transaction: transaction2,
  });

  await solicitationRepo.save(solicitation2);

  console.log('✅ Seed executado com sucesso!');
  await app.close();
}

seed().catch((error) => {
  console.error('Erro ao executar seed:', error);
});