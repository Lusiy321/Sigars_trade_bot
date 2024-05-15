/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

async function start() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(express), {
    cors: true,
  });

  app.enableCors({});
  await app.listen(3000, async () => {
    console.log(`Server started on port = http://localhost:3000`);
  });
}
start();
