/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function start() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000, async () => {
    console.log(`Server started on port = http://localhost:3000`);
  });
}
start();
