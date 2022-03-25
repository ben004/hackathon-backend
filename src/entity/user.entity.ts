import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { Transactions } from './transactions.entity';

@Entity()
export class Users extends Base {
  @Column({name: 'cognito_id', type: 'uuid'})
  cognito_id: string;

  @OneToMany(() => Transactions, (transactions) => transactions.userId)
  transactions: Transactions[]
}
