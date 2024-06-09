/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { information, orderMsg, startMsg } from './message';
import { InjectModel } from '@nestjs/mongoose';
import { Orders, Products, Users } from './app.model';
import { CreateUserDto } from './dto/user.dto';
import {
  adminGeneralKeyboard,
  check,
  deleteButton,
  orderButtons,
  userGeneralKeyboard,
} from './keyboards';
import { CreateProductDto } from './dto/product.dto';
import { CreateOrderDto } from './dto/order.dto';

@Injectable()
export class AppService {
  private bot: TelegramBot;

  constructor(
    @InjectModel(Users.name)
    private userModel: Users,
    @InjectModel(Products.name)
    private productModel: Products,
    @InjectModel(Orders.name)
    private orderModel: Orders,
  ) {
    const token = process.env.TG_TOKEN;
    this.bot = new TelegramBot(token, { polling: true });
    this.setupBot();
  }

  private async setupBot() {
    this.bot.onText(/\/start/, async (msg: any) => {
      const chatId = msg.chat.id;
      const user = { name: msg.from.first_name, tg_chat: chatId };
      const existUser = await this.userModel.findOne({ tg_chat: chatId });
      if (existUser === null) {
        await this.create(user);
      } else if (existUser.role === 'admin') {
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
              keyboard: userGeneralKeyboard,
              resize_keyboard: true,
            },
          },
        );
      }
    });

    this.bot.onText(/Товари/, async (msg: any) => {
      try {
        const chatId = msg.chat.id;
        const products = await this.findAllProducts();

        // Фильтруем продукты с количеством больше нуля
        const filterProducts = products.filter(
          (product: any) => product.quantity !== 0,
        );

        // Создаем сообщение для сигар
        let sigarsMessage = `\n 🚬🚬 Тютюнові вироби: 🚬🚬 \n\n`;
        const sigars = products.filter(
          (product: Products) => product.category === 'sigars',
        );

        sigars.forEach((product: any) => {
          sigarsMessage += `✅ ${product.name} Ціна - ${product.price}грн.\n\n`;
        });

        // Создаем сообщение для алкоголя
        let alcoMessage = `\n 💦💦 Алкоголь вироби: 💦💦\n\n`;
        const alco = products.filter(
          (product: any) => product.category === 'alco',
        );
        alco.forEach((product: any) => {
          alcoMessage += `✅${product.name} Ціна - ${product.price}грн.\n\n`;
        });

        // Создаем сообщение для ELFBARS
        let elfMessage = `\n⚡️⚡️⚡️ ELFBARS:⚡️⚡️⚡️\n\n`;
        const elf = filterProducts.filter(
          (product: any) => product.category === 'elf',
        );
        elf.forEach((product: any) => {
          elfMessage += `✅${product.name} Ціна - ${product.price}грн.\n\n`;
        });

        // Формируем финальное сообщение
        const message = `💥💥💥💥💥 Товари 💥💥💥💥💥\n\n`;
        const infoMsg = `\n\n❗️🏦Ціни вказані за 1 блок🏦❗️\n\n📲Для замовлення натисніть📲
⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️`;
        const startMessage =
          `📦 ЗАМОВЛЕННЯ ВІД 1 БЛОКУ 📦\n\n💥 БЕЗКОШТОВНА ДОСТАВКА 💥\n💥💥💥💥НА АДРЕСУ💥💥💥💥💥\n\n❗️❗️❗️Тільки м.Кривий Ріг❗️❗️❗️\n(Покровський та Саксаганський)\n\n🚀🚀 Можлива відправка 🚀🚀\n🚀🚀🚀Новою Поштою🚀🚀🚀\n\n` +
          message +
          sigarsMessage +
          elfMessage +
          alcoMessage +
          infoMsg;
        await this.bot.sendMessage(chatId, startMessage, {
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
        });
      } catch (err) {
        console.log(err);
      }
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

    this.bot.onText(/Про нас/, async (msg: any) => {
      const chatId = msg.chat.id;
      await this.bot.sendMessage(chatId, information, {
        reply_markup: {
          keyboard: userGeneralKeyboard,
          resize_keyboard: true,
        },
      });
    });

    this.bot.onText(/Склад/, async (msg: any) => {
      const chatId = msg.chat.id;
      const existUser = await this.userModel.findOne({ tg_chat: chatId });
      if (existUser.role === 'admin') {
        const products = await this.findAllProducts();
        let message = 'Склад:\n\n';
        products.forEach((product: any) => {
          message += `${product.name}, кількість - ${product.quantity}шт. Ціна - ${product.price}грн.\n\n`;
        });
        await this.bot.sendMessage(chatId, message, {
          reply_markup: {
            keyboard: adminGeneralKeyboard,
            resize_keyboard: true,
          },
        });
      }
    });

    this.bot.onText(/Замовлення/, async (msg: any) => {
      const chatId = msg.chat.id;
      const existUser = await this.userModel.findOne({ tg_chat: chatId });
      if (existUser.role === 'admin') {
        const orders = await this.findAllOrders();
        await this.bot.sendMessage(chatId, 'Перелік замовлень:', {
          reply_markup: {
            keyboard: adminGeneralKeyboard,
            resize_keyboard: true,
          },
        });
        orders.map(async (order: any) => {
          const status = order.status === true ? `Активний` : 'Виконано';
          const productList = order.product
            .map(
              (item: any) =>
                `Товар: ${item.name}\n Кількість: ${item.volume} шт. по ${item.price}грн.`,
            )
            .join('\n\n');
          const message = `${order.tg_owner} #${
            order.name
          }\n\n${productList}\n\nСумма замовлення - ${
            order.total_price
          }грн.\nТелефон: ${order.phone}\nАдресса: ${
            order.adress
          }\nДата: ${order.createdAt.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}\nСтатус: ${status}`;
          if (order.status === true) {
            const keyboard = await orderButtons(order);
            await this.bot.sendMessage(chatId, message, {
              reply_markup: {
                inline_keyboard: keyboard,
                resize_keyboard: true,
              },
            });
          } else {
            const keyboard = await deleteButton(order);
            await this.bot.sendMessage(chatId, message, {
              reply_markup: {
                inline_keyboard: keyboard,
                resize_keyboard: true,
              },
            });
          }
        });
      }
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
        console.error(e.message);
      }
    });

    this.bot.on(
      'callback_query',
      async (query: { message?: any; data?: any }) => {
        const { data, message } = query;

        const [ID, action] = data.split(':');
        if (action === 'delete') {
          const order = await this.orderModel.findById(ID);
          await this.orderModel.findByIdAndDelete(ID);
          const chatId = message.chat.id;
          await this.bot.sendMessage(
            chatId,
            `Замовлення ${order.product[0].name} - ${order.product[0].volume}шт. на сумму ${order.total_price}  видалено`,
          );
        }
        if (action === 'done') {
          const order = await this.orderModel.findById(ID);
          const product = await this.productModel.findOne({
            name: order.product[0].name,
          });
          const newVolume = product.quantity - order.product[0].volume;
          await this.productModel.findByIdAndUpdate(product.id, {
            quantity: newVolume,
          });
          await this.orderModel.findByIdAndUpdate(ID, {
            status: false,
          });
          const chatId = message.chat.id;
          await this.bot.sendMessage(
            chatId,
            `Замовлення ${order.product[0].name} - ${order.product[0].volume}шт. на сумму ${order.total_price} виконано`,
          );
        }
      },
    );

    this.bot.on('polling_error', (error: any) => {
      console.error(error.message);
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

  async findAllProducts() {
    try {
      const products = await this.productModel.find();
      return products;
    } catch (e) {
      throw e;
    }
  }

  async findAllOrders() {
    try {
      const orders = await this.orderModel.find();
      return orders;
    } catch (e) {
      throw e;
    }
  }

  async createProduct(product: CreateProductDto) {
    try {
      const { name, quantity, price, category } = product;
      if (name && quantity && price && category) {
        const createdProduct = await this.productModel.create({
          ...product,
        });
        createdProduct.save();
        const admins = await this.userModel.find({ role: 'admin' });
        admins.map(
          async (admin: any) =>
            await this.bot.sendMessage(
              admin.tg_chat,
              `Додано товар: ${name}, ціна: ${price}грн., кількість:${quantity}`,
              {
                reply_markup: {
                  keyboard: adminGeneralKeyboard,
                  resize_keyboard: true,
                },
              },
            ),
        );
        return createdProduct;
      } else {
        return;
      }
    } catch (e) {
      throw e;
    }
  }

  async editProduct(product: CreateProductDto) {
    try {
      const { name, quantity, price } = product;
      if (name && quantity && price) {
        const productName = await this.productModel.findOne({ name: name });
        const updateProduct = await this.productModel.findByIdAndUpdate(
          productName.id,
          {
            name: name,
            quantity: quantity,
            price: price,
          },
        );

        const admins = await this.userModel.find({ role: 'admin' });
        admins.map(
          async (admin: any) =>
            await this.bot.sendMessage(
              admin.tg_chat,
              `Оновлено товар: ${name}, ціна: ${price}грн., кількість:${quantity}`,
              {
                reply_markup: {
                  keyboard: adminGeneralKeyboard,
                  resize_keyboard: true,
                },
              },
            ),
        );
        return updateProduct;
      } else {
        return;
      }
    } catch (e) {
      throw e.message;
    }
  }

  async createOrder(order: CreateOrderDto) {
    try {
      const { name, tg_owner, phone, adress, product } = order;
      if (
        name &&
        tg_owner &&
        phone &&
        adress &&
        product &&
        product.length > 0
      ) {
        // Вычисляем общую сумму всех товаров
        const total = product.reduce(
          (sum, item) => sum + item.volume * item.price,
          0,
        );
        // Формируем перечень всех товаров
        const productList = product
          .map(
            (item) =>
              `Товар: ${item.name}\n Кількість: ${item.volume} шт. по ${item.price}грн.`,
          )
          .join('\n\n');

        // Создаем заказ в базе данных
        const createdProduct = await this.orderModel.create({
          ...order,
          total_price: total,
        });
        createdProduct.save();

        // Отправляем сообщение администраторам
        const admins = await this.userModel.find({ role: 'admin' });
        admins.map(
          async (admin: any) =>
            await this.bot.sendMessage(
              admin.tg_chat,
              `${tg_owner} #${name}\n\nЗамовлення:\n\n${productList}\nСумма: ${total}грн.\nТелефон: ${phone}\nАдреса: ${adress}`,
              {
                reply_markup: {
                  keyboard: adminGeneralKeyboard,
                  resize_keyboard: true,
                },
              },
            ),
        );

        // Отправляем сообщение пользователю
        await this.bot.sendMessage(
          tg_owner,
          `Замовлення:\n\n${productList}\nСумма: ${total}грн.\nТелефон: ${phone}\nАдреса: ${adress}\n\nЧекайте, зараз Вам напише оператор для уточнення часу доставки`,
          {
            reply_markup: {
              keyboard: userGeneralKeyboard,
              resize_keyboard: true,
            },
          },
        );

        return createdProduct;
      } else {
        return null;
      }
    } catch (e) {
      throw e;
    }
  }

  async updateDatBase() {
    try {
      const products = await this.productModel.find();
      for (const product of products) {
        await this.productModel.findByIdAndUpdate(product.id, {
          category: 'sigars',
        });
      }
    } catch (e) {
      throw e;
    }
  }
}
