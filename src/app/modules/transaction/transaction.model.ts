// src/modules/transaction/transaction.model.ts

import { Schema, model } from 'mongoose';
import { ITransaction, TransactionStatus } from './transaction.interface';
import { TransactionTypes } from './transaction.constant';

const transactionSchema = new Schema<ITransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: TransactionTypes,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.SUCCESS
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
);

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
