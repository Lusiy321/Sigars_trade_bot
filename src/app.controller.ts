/* eslint-disable prettier/prettier */

import { Orders, Products } from './app.model';
import { AppService } from './app.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // DASHBOARD

  @Get('/product')
  async getAllproducts(): Promise<Products[]> {
    return await this.appService.findAllProducts();
  }

  @Post('/create-product')
  async createProduct(@Body() product: CreateProductDto): Promise<Products> {
    return await this.appService.createProduct(product);
  }

  @Post('/create-order')
  async createOrder(@Body() product: CreateOrderDto): Promise<Orders> {
    console.log(product);
    return await this.appService.createOrder(product);
  }
}
