/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { information, orderMsg, product, startMsg } from './message';
import { InjectModel } from '@nestjs/mongoose';
import { Users } from './app.model';
import { CreateUserDto } from './dto/user.dto';
import { adminGeneralKeyboard, check, userGeneralKeyboard } from './keyboards';

@Injectable()
export class AppService {
  private bot: TelegramBot;

  constructor(
    @InjectModel(Users.name)
    private userModel: Users,
  ) {
    const token = process.env.TG_TOKEN;
    this.bot = new TelegramBot(token, { polling: true });
    this.setupBot();
  }

  private setupBot() {
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const user = { name: msg.from.first_name, tg_chat: chatId };
      const existUser = await this.userModel.findOne({ tg_chat: chatId });
      if (!existUser) {
        await this.create(user);
      }
      if (existUser.role === 'admin') {
        await this.bot.sendMessage(chatId, `Привіт! Admin`, {
          reply_markup: {
            keyboard: adminGeneralKeyboard,
            resize_keyboard: true,
          },
        });
      } else {
        await this.bot.sendMessage(
          chatId,
          `Привіт! ${msg.from.first_name}.\n` + startMsg,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Список товарів',
                    web_app: { url: 'https://sigars-react-form.vercel.app/' },
                  },
                ],
              ],
              resize_keyboard: true,
            },
          },
        );
      }
    });

    this.bot.onText(/Товари/, async (msg: any) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, product, {
        reply_markup: {
          keyboard: userGeneralKeyboard,
          resize_keyboard: true,
        },
      });
    });

    this.bot.onText(/Про нас/, async (msg: any) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, information, {
        reply_markup: {
          keyboard: userGeneralKeyboard,
          resize_keyboard: true,
        },
      });
    });

    this.bot.onText(/Замовити/, async (msg: any) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(
        chatId,
        `Привіт! ${msg.from.first_name}.\n` + orderMsg,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Замовити',
                  web_app: {
                    url: 'https://sigars-react-form.vercel.app/order',
                  },
                },
              ],
            ],
            resize_keyboard: true,
          },
        },
      );
    });

    this.bot.on('message', async (msg: any) => {
      try {
        const chatId = msg.chat.id;
        const user = await this.userModel.findOne({ tg_chat: chatId });
        const admins = await this.userModel.find({ role: 'admin' });
        if (user.role === 'user') {
          if (check(msg.text) === true) {
            console.log(`User ${msg.from.first_name} watch`);
          } else {
            admins.map(
              async (admin: any) =>
                await this.bot.sendMessage(
                  admin.tg_chat,
                  `${chatId} #${msg.from.first_name}\n\n${msg.text}`,
                  {
                    reply_markup: {
                      keyboard: adminGeneralKeyboard,
                      resize_keyboard: true,
                    },
                  },
                ),
            );
          }
        } else if (user.role === 'admin') {
          if (msg.reply_to_message && msg.reply_to_message.text) {
            const adminReply = msg.reply_to_message.text;
            const [userChatId] = adminReply.split(' ');
            await this.bot.sendMessage(userChatId, `${msg.text}`);
          } else {
            if (check(msg.text) === false) {
              const admins = await this.userModel.find({ role: 'admin' });
              const updateAdmins = admins.filter(
                (user: any) => user.tg_chat !== chatId,
              );
              updateAdmins.map(
                async (admin: any) =>
                  await this.bot.sendMessage(
                    admin.tg_chat,
                    `#${msg.from.first_name}\n\n${msg.text}`,
                    {
                      reply_markup: {
                        keyboard: adminGeneralKeyboard,
                        resize_keyboard: true,
                      },
                    },
                  ),
              );
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    });

    this.bot.on('polling_error', (error: any) => {
      console.error(error);
    });
  }

  async create(user: CreateUserDto): Promise<Users> {
    try {
      const { name, tg_chat } = user;
      if (name && tg_chat) {
        const registrationUser = await this.userModel.findOne({
          tg_chat: tg_chat,
        });
        if (registrationUser) {
          return;
        }

        const createdUser = await this.userModel.create({
          ...user,
        });
        createdUser.save();
        return;
      } else {
        return;
      }
    } catch (e) {
      throw e;
    }
  }
}
