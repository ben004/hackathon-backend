import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '@entity/user.entity';
import { Transactions } from '@entity/transactions.entity';
import { Categories } from '@entity/category.entity';
import { CategoryKeyWords } from '@entity/categorytype.entity';
import { TransactionsModule } from './transactions/transactions.module';
import { DB_CREDENTIAL } from '../config';

@Module({
  imports: [
    TransactionsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DB_CREDENTIAL.host,
      port: DB_CREDENTIAL.port,
      username: DB_CREDENTIAL.username,
      password: DB_CREDENTIAL.password,
      database: DB_CREDENTIAL.database,
      entities: [
        // 'dist/src/entity/**/*{.ts,.js}'
        Users,
        Transactions,
        Categories,
        CategoryKeyWords
      ],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
