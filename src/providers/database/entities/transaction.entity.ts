import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";


@Entity("transaction")
export class TransactionEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  userSender: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn()
  userReceiver: UserEntity;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}