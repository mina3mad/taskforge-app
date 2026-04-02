import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import moment from 'moment-timezone';
import compression from 'compression'
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  moment.tz.setDefault("Africa/Cairo");
  console.log(moment().format("YYYY-MM-DD HH:mm:ss"));
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");
  app.use(cookieParser());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, 
  });

  app.useGlobalPipes(new ValidationPipe())

  const configService: ConfigService = app.get(ConfigService);
  const port: number = configService.get<number>('PORT');
  await app.listen(port || 3000);
}
bootstrap();
