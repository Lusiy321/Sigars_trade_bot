/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { product, startMsg } from './message';

@Injectable()
export class AppService {
  private bot: TelegramBot;
  constructor() {
    const token = process.env.TG_TOKEN;
    const adminChatId = process.env.ADMIN;
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      console.log(chatId.toString(), adminChatId);
      if (chatId.toString() === adminChatId) {
        await this.bot.sendMessage(chatId, `Привіт! Admin`, {
          reply_markup: {
            keyboard: [['Список товаров']],
            resize_keyboard: true,
          },
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          `Привіт! ${msg.from.first_name}.\n` + startMsg,
          {
            reply_markup: {
              keyboard: [['Список товаров']],
              resize_keyboard: true,
            },
          },
        );
      }
    });

    this.bot.onText(/Список товаров/, async (msg: any) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, product, {
        reply_markup: {
          keyboard: [['Список товаров']],
          resize_keyboard: true,
        },
      });
    });
    // Обработчик всех входящих сообщений
    this.bot.on('message', (msg) => {
      try {
        const chatId = msg.chat.id;

        // Проверяем, является ли отправитель администратором
        const isAdmin = chatId.toString() === adminChatId;

        // Если отправитель - не администратор, пересылаем сообщение администратору
        if (!isAdmin) {
          if (msg.text === 'Список товаров' || msg.text === '/start') {
            console.log('User whatch');
          } else {
            this.bot.sendMessage(
              adminChatId,
              `${chatId} #${msg.from.first_name}\n\n${msg.text}`,
            );
          }
        } else if (isAdmin || msg.reply_to_message.text !== undefined) {
          if (msg.text !== '/start' && msg.text !== 'Список товаров') {
            const adminReply = msg.reply_to_message.text;
            const [userChatId] = adminReply.split(' ');
            // Отправляем сообщение пользователю
            this.bot.sendMessage(userChatId, `${msg.text}`);
          }
        }
      } catch (e) {
        this.bot.sendMessage(adminChatId, 'Привет Админ');
      }
    });

    this.bot.onText(/\/reply (.+)/, (msg, match) => {
      // Извлекаем текст ответа администратора
      const adminReply = match[1];

      // Проверяем, что отправитель - администратор
      const isAdmin = msg.chat.id.toString() === adminChatId;

      if (isAdmin) {
        // Извлекаем ID пользователя и текст сообщения из команды /reply
        const [userChatId, userMessage] = adminReply.split(' ');

        // Отправляем сообщение пользователю
        this.bot.sendMessage(userChatId, userMessage);
      } else {
        // Если отправитель не администратор, отправляем сообщение об ошибке
        this.bot.sendMessage(msg.chat.id, 'Вы не администратор!');
      }
    });

    // Обработчик для ответов администратора

    // Отслеживаем ошибки
    this.bot.on('polling_error', (error) => {
      console.error(error);
    });
  }
}
