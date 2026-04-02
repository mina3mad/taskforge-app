import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';



@Module({
  imports:[
    TypeOrmModule.forRootAsync({
      // imports:[ConfigModule],
      useFactory:async(configService:ConfigService) => {
        return {
          type: "postgres",
          host: configService.getOrThrow("DB_HOST"),
          port: configService.getOrThrow("DB_PORT"),
          username: configService.getOrThrow("DB_USERNAME"),
          password: configService.getOrThrow("DB_PASSWORD"),
          database: configService.getOrThrow("DB_NAME"),
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: false,
          
        }
      },
      inject:[ConfigService],
    })
  ],
  providers: [DatabaseService],
})
export class DatabaseModule {}
