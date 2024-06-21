import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import enviroment, { EnvSchema } from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { ProductsModule } from './modules/products/products.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  exports: [ConfigModule],
  imports: [
    ConfigModule.forRoot({
      load: [enviroment],
      validationSchema: EnvSchema,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: enviroment().database.host,
      port: enviroment().database.port,
      database: enviroment().database.name,
      username: enviroment().database.username,
      password: enviroment().database.password,
      autoLoadEntities: Boolean(enviroment().database.autoLoadEntities),
      synchronize: Boolean(enviroment().database.synchronize),
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}
