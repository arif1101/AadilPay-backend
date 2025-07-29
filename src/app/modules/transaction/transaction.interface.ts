
import { Types } from 'mongoose';
import { TransactionType } from './transaction.constant';

export enum TransactionStatus{
    SUCCESS = "success",
    FAILED = "failed",
    PENDING = "pending"
}

export interface ITransaction {
  user: Types.ObjectId;
  type: TransactionType;
  amount: number;
  receiver?: Types.ObjectId;
  status: TransactionStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
