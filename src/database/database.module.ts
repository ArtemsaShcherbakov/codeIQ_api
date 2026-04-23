import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmEntities } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(String(config.get('DB_PORT', 5432)), 10),
        username: config.get<string>('DB_USERNAME', 'codeiq'),
        password: config.get<string>('DB_PASSWORD', 'codeiq'),
        database: config.get<string>('DB_DATABASE', 'codeiq'),
        entities: typeOrmEntities,
        autoLoadEntities: false,
        synchronize: config.get<string>('DB_SYNCHRONIZE') === 'true',
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
  ],
})
export class DatabaseModule {}
