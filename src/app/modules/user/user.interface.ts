import { Schema } from "mongoose";

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER",
    AGENT = "AGENT",
}

export enum UserStatus {
    ACTIVE = "ACTIVE",
    BLOCKED = "BLOCKED"
}

export enum AccountStatus {
    APPROVED = "APPROVED",
    SUSPENDED = "SUSPENDED"
}

export interface IUser {
    name: string;
    email?: string;
    phone: string;
    password: string;
    role?: Role;
    walletId?: Schema.Types.ObjectId;
    accountStatus?: AccountStatus;
    status?: UserStatus;
    commissionRate?: Date;
    updatedAt?:Date;
}