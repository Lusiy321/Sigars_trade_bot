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
            keyboard: [['Список товарів']],
            resize_keyboard: true,
          },
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          `Привіт! ${msg.from.first_name}.\n` + startMsg,
          {
            reply_markup: {
              keyboard: [['Список товарів']],
              resize_keyboard: true,
            },
          },
        );
      }
    });

    this.bot.onText(/Список товарів/, async (msg: any) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, product, {
        reply_markup: {
          keyboard: [['Список товарів']],
          resize_keyboard: true,
        },
      });
    });

    this.bot.on('message', (msg: any) => {
      try {
        const chatId = msg.chat.id;
        const isAdmin = chatId.toString() === adminChatId;
        if (!isAdmin) {
          if (msg.text === 'Список товарів' || msg.text === '/start') {
            console.log(`User ${msg.from.first_name} whatch`);
          } else {
            this.bot.sendMessage(
              adminChatId,
              `${chatId} #${msg.from.first_name}\n\n${msg.text}`,
            );
          }
        } else if (isAdmin || msg.reply_to_message.text !== undefined) {
          if (msg.text !== '/start' && msg.text !== 'Список товарів') {
            const adminReply = msg.reply_to_message.text;
            const [userChatId] = adminReply.split(' ');
            this.bot.sendMessage(userChatId, `${msg.text}`);
          }
        }
      } catch (e) {
        this.bot.sendMessage(adminChatId, 'Привіт Адмін');
      }
    });

    this.bot.on('polling_error', (error: any) => {
      console.error(error);
    });
  }
}
