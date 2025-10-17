import Dexie, { Table } from "dexie";

export interface Transactions {
  _id?: string;
  userId: string;
  type: string;
  amount: number;
  note: string | null;
  synced: 0 | 1;
}

export interface Balances {
  _id?: string;
  userId: string;
  amount: string;
  note: string;
  synced: 0 | 1;
}

export class FinanceDB extends Dexie {
  transactions!: Table<Transactions, string>;
  balances!: Table<Balances, string>;

  constructor() {
    super("financeApp");
    this.version(1).stores({
      transactions: "_id, userId, note, amount, type, synced",
      balances: "_id, userId, amount, synced",
    });
  }
}

export const db = new FinanceDB();
