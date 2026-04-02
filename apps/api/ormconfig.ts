import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
config();

const configService = new ConfigService();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: configService.getOrThrow("DB_HOST"),
  port: configService.getOrThrow("DB_PORT"),
  database: configService.getOrThrow("DB_NAME"),
  username: configService.getOrThrow("DB_USERNAME"),
  password: configService.getOrThrow("DB_PASSWORD"),
  entities: ["dist/**/*.entity.js"],
  logging: true,
  synchronize: false,
  migrationsRun: false,
  migrations: ["dist/**/**/migrations/*.js"],
});