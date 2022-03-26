import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // body parser
  // the next two lines did the trick
  app.use(bodyParser.json({limit: '100mb'}));
  app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));


  app.use(helmet());

  app.enableCors({
    // origin: ['*'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Accept', 'X-HubSpot-Signature', 'X-HubSpot-Signature-Version'],
    credentials: true,
  });

  /**
   * we need this because "cookie" is true in csrfProtection
   */
  app.use(cookieParser());

  /**
   * To protect your applications from brute-force attacks
   */
  // app.use(
  //   rateLimit({
  //     windowMs: 15 * 60 * 1000, // 15 minutes
  //     max: 100, // limit each IP to 100 requests per windowMs
  //   }),
  // );

  await app.listen(5050);
  console.log(`Application is running on: ${await app.getUrl()}`);

}

bootstrap();
