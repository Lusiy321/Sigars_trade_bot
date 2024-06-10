/* eslint-disable prettier/prettier */

import { Orders, Products } from './app.model';
import { AppService } from './app.service';
import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
} from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CloudinaryService } from './cloudinary.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // DASHBOARD

  @Get('/product')
  async getAllproducts(): Promise<Products[]> {
    return await this.appService.findAllProducts();
  }

  @Post('/create-product')
  async createProduct(@Body() product: CreateProductDto): Promise<Products> {
    return await this.appService.createProduct(product);
  }

  @Post('/edit-product')
  async editProduct(@Body() product: CreateProductDto): Promise<Products> {
    return await this.appService.editProduct(product);
  }

  @Post('/create-order')
  async createOrder(@Body() order: CreateOrderDto): Promise<Orders> {
    return await this.appService.createOrder(order);
  }
  @Get('/update')
  async getUpdates(): Promise<void> {
    return await this.appService.updateDatBase();
  }

  @HttpCode(200)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('file', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const filename =
            path.parse(file.originalname).name.replace(/\s/g, '') +
            '-' +
            Date.now();
          const extension = path.parse(file.originalname).ext;
          cb(null, `${filename}${extension}`);
        },
      }),
    }),
  )
  async uploadPhoto(
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<string[]> {
    const urls = await this.cloudinaryService.uploadImages(images);
    return urls;
  }
}
