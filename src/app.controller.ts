/* eslint-disable prettier/prettier */

import { Products } from './app.model';
import { AppService } from './app.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // DASHBOARD

  @Get('/product')
  async getAllproducts(): Promise<Products[]> {
    return await this.appService.findAllProducts();
  }

  @Post('/create-product')
  async createDashboard(@Body() product: CreateProductDto): Promise<Products> {
    return await this.appService.createProduct(product);
  }
}
