/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type UsersDocument = Users & Document;

@Schema({ versionKey: false, timestamps: true })
export class Users extends Model<Users> {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: Number,
    default: null,
  })
  tg_chat: number;

  @Prop({
    type: String,
    default: 'user',
  })
  role: string;

  @Prop({
    type: Array<string>,
    default: [],
  })
  orders: [string];
}

export const UserSchema = SchemaFactory.createForClass(Users);

export type OrdersDocument = Orders & Document;

export interface userOrder {
  name: string;
  price: number;
  volume: number;
}

@Schema({ versionKey: false, timestamps: true })
export class Orders extends Model<Orders> {
  @Prop({
    type: String,
  })
  name: string;

  @Prop({
    type: Number,
  })
  tg_owner: number;

  @Prop({
    type: String,
  })
  phone: string;

  @Prop({
    type: String,
  })
  adress: string;

  @Prop({
    type: Array<userOrder>,
  })
  product: [userOrder];

  @Prop({
    type: Number,
  })
  total_price: number;

  @Prop({
    type: Boolean,
    default: true,
  })
  status: boolean;

  @Prop({
    type: String,
    default: 'sigars',
  })
  type: string;
}

export const OrderSchema = SchemaFactory.createForClass(Orders);

@Schema({ versionKey: false, timestamps: true })
export class Products extends Model<Products> {
  @Prop({
    type: String,
  })
  name: string;
  @Prop({
    type: String,
    default: ' ',
  })
  url: string;

  @Prop({
    type: Number,
  })
  price: number;

  @Prop({
    type: Number,
  })
  quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Products);
