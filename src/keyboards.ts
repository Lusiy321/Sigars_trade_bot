/* eslint-disable prettier/prettier */
import { webAppUrl } from './app.service';

export const userGeneralKeyboard = [
  [{ text: 'Товари' }, { text: 'Замовити', web_app: { url: webAppUrl } }],
  [{ text: 'Як замовляти' }, { text: 'Про нас' }],
];

export const adminGeneralKeyboard = [
  [{ text: 'Склад' }, { text: 'Замовлення' }],
  [{ text: 'Додати товар', web_app: { url: webAppUrl } }, { text: 'Звіт' }],
];

export function check(text: string) {
  if (
    text === '/start' ||
    text === 'Склад' ||
    text === 'Додати товар' ||
    text === 'Звіт' ||
    text === 'Замовлення' ||
    text === 'Як замовляти' ||
    text === 'Про нас' ||
    text === 'Товари'
  ) {
    return true;
  } else {
    return false;
  }
}
