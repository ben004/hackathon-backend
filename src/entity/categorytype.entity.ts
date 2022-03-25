import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from "./base.entity";
import { Categories } from "./category.entity";

@Entity()
export class CategoryKeyWords extends Base {
  @Column({name: 'key_word', type: 'varchar', length: 100, nullable: false})
  keyWord: string;

  @ManyToOne(() => Categories, categories => categories.id)
  @JoinColumn({
    name: 'category_id'
  })
  categoryId: Categories;
}
