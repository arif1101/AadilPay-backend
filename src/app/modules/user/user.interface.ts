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

export interface IUser {
    name: string;
    email?: string;
    phone: string;
    password: string;
    role?: Role;
    walletId?: Schema.Types.ObjectId;
    isApproved?: boolean;
    status?: UserStatus;
    commissionRate?: Date;
    updatedAt?:Date;
}