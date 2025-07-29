import { Schema, model } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // assuming single User model with role
      required: true,
      unique: true, // one wallet per user/agent
    },
    balance: {
      type: Number,
      required: true,
      default: 50,
      min: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Wallet = model<IWallet>("Wallet", walletSchema);
