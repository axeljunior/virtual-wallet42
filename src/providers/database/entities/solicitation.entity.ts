import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { TransactionEntity } from "./transaction.entity";


@Entity("solicitations")
export class SolicitationEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TransactionEntity)
  @JoinColumn()
  transaction: TransactionEntity;

  @Column({ type: 'varchar', length: 100 })
  status: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}