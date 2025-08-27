import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'github_analytics',
  synchronize: false,
  logging: false,
  entities: [__dirname + '/src/common/entities/*.{ts,js}'],
  migrations: [__dirname + '/src/migrations/*.{ts,js}'],
});


