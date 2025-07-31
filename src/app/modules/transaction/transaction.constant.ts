export enum TransactionType {
  TOP_UP = "TOP_UP",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT"
}

export const TransactionTypes = Object.values(TransactionType);
