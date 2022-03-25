import { TransactionsType } from '@shared/utills';
import { Column, Entity, JoinColumn, ManyToOne, } from 'typeorm';
import { Base } from "./base.entity";
import { Categories } from './category.entity';
import { Users } from './user.entity';

@Entity()
export class Transactions extends Base {
  @ManyToOne(() => Users, user => user.id)
  @JoinColumn({
    name: 'user_id'
  })
  userId: Users;

  @Column({
    name: 'transaction_made_on',
    nullable: false,
    type: 'date'
  })
  transactionMadeOn: Date;

  @Column({
    name: 'transaction_type',
    nullable: false,
    type: 'enum',
    enum: TransactionsType
  })
  transactionType: string;

  @Column({
    name: 'source',
    nullable: true,
    type: 'varchar',
    length: 50
  })
  source: string;

  @Column({
    name: 'destination',
    nullable: true,
    type: 'varchar',
    length: 50
  })
  destination: string;

  @Column({
    name: 'transaction_mode',
    nullable: false,
    length: 50
  })
  transactionMode: string;

  @Column({
    name: 'transaction_amount',
    nullable: false,
    type: 'double'
  })
  transactionAmount: number;

  @Column({
    name: 'transaction_id',
    default: null,
    unique: true,
    type: 'varchar',
    length: 32
  })
  transactionId: string;

  @Column({
    name: 'description',
    nullable: true
  })
  description: string;

  @Column({
    name: 'currency',
    nullable: true,
    length: 20,
  })
  currency: string;

  @ManyToOne(() => Categories, categories => categories.id)
  @JoinColumn({
    name: 'category_id'
  })
  categoryId: Categories;

}
