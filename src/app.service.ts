/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { product, startMsg } from './message';

@Injectable()
export class AppService {
  private bot: TelegramBot;
  private adminChatId: string;

  constructor() {
    const token = process.env.TG_TOKEN;
    this.adminChatId = process.env.ADMIN;
    this.bot = new TelegramBot(token, { polling: true });

    this.setupBot();
  }

  private setupBot() {
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      if (chatId.toString() === this.adminChatId) {
        await this.bot.sendMessage(chatId, `Привіт! Admin`, {
          reply_markup: {
            keyboard: [[{ text: 'Список товарів' }]],
            resize_keyboard: true,
          },
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          `Привіт! ${msg.from.first_name}.\n` + startMsg,
          {
            reply_markup: {
              keyboard: [[{ text: 'Список товарів' }]],
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
          keyboard: [[{ text: 'Список товарів' }]],
          resize_keyboard: true,
        },
      });
    });

    this.bot.on('message', async (msg: any) => {
      try {
        const chatId = msg.chat.id;
        const isAdmin = chatId.toString() === this.adminChatId;
        if (!isAdmin) {
          if (msg.text === 'Список товарів' || msg.text === '/start') {
            console.log(`User ${msg.from.first_name} watch`);
          } else {
            await this.bot.sendMessage(
              this.adminChatId,
              `${chatId} #${msg.from.first_name}\n\n${msg.text}`,
            );
          }
        } else if (isAdmin && msg.reply_to_message?.text) {
          const adminReply = msg.reply_to_message.text;
          const [userChatId] = adminReply.split(' ');
          if (msg.text !== '/start' && msg.text !== 'Список товарів') {
            await this.bot.sendMessage(userChatId, `${msg.text}`);
          }
        }
      } catch (e) {
        await this.bot.sendMessage(this.adminChatId, 'Привіт Адмін');
      }
    });

    this.bot.on('polling_error', (error: any) => {
      console.error(error);
    });
  }
}
