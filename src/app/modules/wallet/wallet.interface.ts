import { Types } from "mongoose";

export enum WalletStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED'
}

export interface IWallet {
    user: Types.ObjectId;
    balance: number;
    status: WalletStatus;
    createdAt?: Date;
    updatedAt?: Date;
}