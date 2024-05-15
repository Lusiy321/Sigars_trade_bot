/* eslint-disable prettier/prettier */
import { userOrder } from 'src/app.model';

export class CreateOrderDto {
  readonly name: string;
  readonly tg_owner: number;
  readonly phone: string;
  readonly adress: string;
  readonly product: [userOrder];
}
