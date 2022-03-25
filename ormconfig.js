// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const config = {
    name: 'default',
    type: 'mysql',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: ['dist/src/entity/**/*{.ts,.js}'],
    migrations: ['dist/src/migration/**/*{.ts,.js}'],
    subscribers: ['dist/src/subscriber/**/*.ts'],
    cli: {
        entitiesDir: 'src/entity',
        migrationsDir: 'src/migration',
        subscribersDir: 'src/subscriber'
    },
    maxQueryExecutionTime: 10000
};

if (process.env.NODE_ENV === 'production') {
    config['ssl'] = {
        ca: fs.readFileSync(process.env.SSL_CERT),
    };
}

if (process.env.DB_MIGRATION === 'true') {
    config['entities'] = ['src/entity/**/*{.ts,.js}'];
    config['migrations'] = ['src/migration/**/*{.ts,.js}'];
    config['subscribers'] = ['src/subscriber/**/*.ts'];
}

module.exports = config;
