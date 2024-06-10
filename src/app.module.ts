/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  OrderSchema,
  Orders,
  ProductSchema,
  Products,
  UserSchema,
  Users,
} from './app.model';
import { AppController } from './app.controller';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    MongooseModule.forRoot(process.env.DB_HOST),
    MongooseModule.forFeature([
      { name: Users.name, schema: UserSchema, collection: 'users' },
      { name: Orders.name, schema: OrderSchema, collection: 'orders' },
      { name: Products.name, schema: ProductSchema, collection: 'products' },
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService, CloudinaryService],
})
export class AppModule {}
