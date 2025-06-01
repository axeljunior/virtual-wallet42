import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TransactionEntity } from "./transaction.entity";


@Entity("users")
export class UserEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  balance: number;

  @OneToMany(() => TransactionEntity, transaction => transaction.userSender)
  sentTransactions: TransactionEntity[];

  @OneToMany(() => TransactionEntity, transaction => transaction.userReceiver)
  receivedTransactions: TransactionEntity[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  get transactions(): TransactionEntity[] {
    return [...(this.sentTransactions || []), ...(this.receivedTransactions || [])];
  }
}