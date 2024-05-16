/* eslint-disable prettier/prettier */
export const userGeneralKeyboard = [
  [{ text: 'Товари' }, { text: 'Замовити' }],
  [{ text: 'Про нас' }],
];

export const adminGeneralKeyboard = [
  [{ text: 'Склад' }, { text: 'Замовлення' }],
  [
    {
      text: 'Додати товар',
      web_app: { url: 'https://sigars-react-form.vercel.app/product' },
    },
    { text: 'Звіт' },
  ],
];

export async function orderButtons(order: any) {
  const buttons = [
    [
      {
        text: 'Виконано',
        callback_data: `${order.id}:done`,
      },
      {
        text: 'Видалити',
        callback_data: `${order.id}:delete`,
      },
    ],
  ];
  return buttons;
}

export async function deleteButton(order: any) {
  const buttons = [
    [
      {
        text: 'Видалити',
        callback_data: `${order.id}:delete`,
      },
    ],
  ];
  return buttons;
}

export function check(text: string) {
  if (
    text === '/start' ||
    text === 'Склад' ||
    text === 'Додати товар' ||
    text === 'Звіт' ||
    text === 'Замовити' ||
    text === 'Про нас' ||
    text === 'Товари'
  ) {
    return true;
  } else {
    return false;
  }
}
