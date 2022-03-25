import {MigrationInterface, QueryRunner} from "typeorm";

export class InitialMigration1601547474788 implements MigrationInterface {
    name = 'InitialMigration1601547474788'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `consultant` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `email` varchar(100) NOT NULL, `wse_consultant_id` varchar(45) NOT NULL, `center_id` int NULL, INDEX `IDX_26e981db90ffdf852976312cf7` (`is_active`), INDEX `IDX_12e4dabc4bcb085020b2d577a8` (`is_deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `center` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(100) NOT NULL, `wse_center_id` varchar(45) NOT NULL, `account_id` int NULL, INDEX `IDX_1f7e31464165ee7cd24867f2d5` (`is_active`), INDEX `IDX_d98369805a96e1999fc83b2006` (`is_deleted`), UNIQUE INDEX `IDX_7312efe7904ddbf41e72d9c779` (`name`), UNIQUE INDEX `IDX_1214f6fc1f413c23939dd707c1` (`wse_center_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `territory` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(100) NOT NULL, `wse_territory_id` varchar(45) NOT NULL, `token` varchar(100) NOT NULL, INDEX `IDX_7b783d117f771b3fec1e1f5491` (`is_active`), INDEX `IDX_533999efff3dacb7454d5b7906` (`is_deleted`), UNIQUE INDEX `IDX_74e1aa2930f046028a72fb9e2a` (`wse_territory_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `setting` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `integration` json NULL, `app` json NULL, INDEX `IDX_65d72daf77be78b86f22540d99` (`is_active`), INDEX `IDX_7b9092e5076b670c6d96310601` (`is_deleted`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `account` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(50) NOT NULL, `api_key` varchar(255) NULL, `portal_id` varchar(20) NOT NULL, `access_token` varchar(500) NULL, `refresh_token` varchar(100) NULL, `metadata` json NULL, `territory_id` int NULL, `setting_id` int NULL, INDEX `IDX_366fdfe9f6e91c697204a41d17` (`is_active`), INDEX `IDX_25d7313fdd4ca5244304825b91` (`is_deleted`), UNIQUE INDEX `IDX_ddd0dc16225af5c58a3b7470cc` (`portal_id`), UNIQUE INDEX `REL_110fd05a7c7ccdfbcf84b37fbf` (`territory_id`), UNIQUE INDEX `REL_881cf0f66c2d55aff7b23bec21` (`setting_id`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `is_active` tinyint NOT NULL DEFAULT 1, `is_deleted` tinyint NOT NULL DEFAULT 0, `created_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(50) NOT NULL, `email` varchar(250) NOT NULL, `password` varchar(250) NOT NULL, `role` enum ('admin', 'user') NOT NULL DEFAULT 'user', INDEX `IDX_3cf126e6a296167f4d4d782a84` (`is_active`), INDEX `IDX_666851d8509be413462c3b150c` (`is_deleted`), UNIQUE INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_accounts` (`user_id` int NOT NULL, `account_id` int NOT NULL, INDEX `IDX_6711686e2dc4fcf9c7c83b8373` (`user_id`), INDEX `IDX_6163d54dc1cb367fc0361128bc` (`account_id`), PRIMARY KEY (`user_id`, `account_id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `consultant` ADD CONSTRAINT `FK_10a9d3fa4381b9d0b33eb282dc6` FOREIGN KEY (`center_id`) REFERENCES `center`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `center` ADD CONSTRAINT `FK_912c6e75ff5d4e66db96d73c357` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `account` ADD CONSTRAINT `FK_110fd05a7c7ccdfbcf84b37fbfc` FOREIGN KEY (`territory_id`) REFERENCES `territory`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `account` ADD CONSTRAINT `FK_881cf0f66c2d55aff7b23bec212` FOREIGN KEY (`setting_id`) REFERENCES `setting`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_accounts` ADD CONSTRAINT `FK_6711686e2dc4fcf9c7c83b83735` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_accounts` ADD CONSTRAINT `FK_6163d54dc1cb367fc0361128bcd` FOREIGN KEY (`account_id`) REFERENCES `account`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_accounts` DROP FOREIGN KEY `FK_6163d54dc1cb367fc0361128bcd`");
        await queryRunner.query("ALTER TABLE `user_accounts` DROP FOREIGN KEY `FK_6711686e2dc4fcf9c7c83b83735`");
        await queryRunner.query("ALTER TABLE `account` DROP FOREIGN KEY `FK_881cf0f66c2d55aff7b23bec212`");
        await queryRunner.query("ALTER TABLE `account` DROP FOREIGN KEY `FK_110fd05a7c7ccdfbcf84b37fbfc`");
        await queryRunner.query("ALTER TABLE `center` DROP FOREIGN KEY `FK_912c6e75ff5d4e66db96d73c357`");
        await queryRunner.query("ALTER TABLE `consultant` DROP FOREIGN KEY `FK_10a9d3fa4381b9d0b33eb282dc6`");
        await queryRunner.query("DROP INDEX `IDX_6163d54dc1cb367fc0361128bc` ON `user_accounts`");
        await queryRunner.query("DROP INDEX `IDX_6711686e2dc4fcf9c7c83b8373` ON `user_accounts`");
        await queryRunner.query("DROP TABLE `user_accounts`");
        await queryRunner.query("DROP INDEX `IDX_e12875dfb3b1d92d7d7c5377e2` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_666851d8509be413462c3b150c` ON `user`");
        await queryRunner.query("DROP INDEX `IDX_3cf126e6a296167f4d4d782a84` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP INDEX `REL_881cf0f66c2d55aff7b23bec21` ON `account`");
        await queryRunner.query("DROP INDEX `REL_110fd05a7c7ccdfbcf84b37fbf` ON `account`");
        await queryRunner.query("DROP INDEX `IDX_ddd0dc16225af5c58a3b7470cc` ON `account`");
        await queryRunner.query("DROP INDEX `IDX_25d7313fdd4ca5244304825b91` ON `account`");
        await queryRunner.query("DROP INDEX `IDX_366fdfe9f6e91c697204a41d17` ON `account`");
        await queryRunner.query("DROP TABLE `account`");
        await queryRunner.query("DROP INDEX `IDX_7b9092e5076b670c6d96310601` ON `setting`");
        await queryRunner.query("DROP INDEX `IDX_65d72daf77be78b86f22540d99` ON `setting`");
        await queryRunner.query("DROP TABLE `setting`");
        await queryRunner.query("DROP INDEX `IDX_74e1aa2930f046028a72fb9e2a` ON `territory`");
        await queryRunner.query("DROP INDEX `IDX_533999efff3dacb7454d5b7906` ON `territory`");
        await queryRunner.query("DROP INDEX `IDX_7b783d117f771b3fec1e1f5491` ON `territory`");
        await queryRunner.query("DROP TABLE `territory`");
        await queryRunner.query("DROP INDEX `IDX_1214f6fc1f413c23939dd707c1` ON `center`");
        await queryRunner.query("DROP INDEX `IDX_7312efe7904ddbf41e72d9c779` ON `center`");
        await queryRunner.query("DROP INDEX `IDX_d98369805a96e1999fc83b2006` ON `center`");
        await queryRunner.query("DROP INDEX `IDX_1f7e31464165ee7cd24867f2d5` ON `center`");
        await queryRunner.query("DROP TABLE `center`");
        await queryRunner.query("DROP INDEX `IDX_12e4dabc4bcb085020b2d577a8` ON `consultant`");
        await queryRunner.query("DROP INDEX `IDX_26e981db90ffdf852976312cf7` ON `consultant`");
        await queryRunner.query("DROP TABLE `consultant`");
    }

}
