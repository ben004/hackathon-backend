import { Column, Entity, OneToMany } from 'typeorm';
import { Base } from './base.entity';
import { CategoryKeyWords } from './categorytype.entity';
import { Transactions } from './transactions.entity';

@Entity()
export class Categories extends Base {
  @Column({name: 'category_name'})
  categoryName: string;

  @OneToMany(() => CategoryKeyWords, categoryKeyWords => categoryKeyWords.categoryId)
  categories: CategoryKeyWords[];

  @OneToMany(() => Transactions, transactions => transactions.categoryId)
  transactions: Transactions[];
}
