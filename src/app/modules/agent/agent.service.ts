/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken"
import httpStatus from "http-status-codes"
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.mode";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.constant";
import { TransactionStatus } from "../transaction/transaction.interface";


const agentCashIn = async(agent: JwtPayload, userId: string, amount: number) => {
    if(!userId || amount<0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input");
    }

    const [agentWallet, userWallet] = await Promise.all([
        Wallet.findOne({user: agent.userId}),
        Wallet.findOne({user: userId})
    ])

    if(!agentWallet || agentWallet.balance < amount){
        throw new AppError(httpStatus.BAD_REQUEST, "Agent has insufficient balance");
    }

    if(!userWallet){
        throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        agentWallet.balance -= amount;
        userWallet.balance +=amount;

        await agentWallet.save({session});
        await userWallet.save({session});

        await Transaction.create([{
            user: userId,
            receiver: agent.userId,
            type: TransactionType.TOP_UP,
            amount,
            status: TransactionStatus.SUCCESS
        }], { session });

        await session.commitTransaction();
        session.endSession();
        return {userWallet, agentWallet}
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Cash-in failed");
  }
    
}

const agentCashOut = async(agent: JwtPayload, userId: string, amount: number) => {
    if(!userId || amount<0 || agent.userId.toString() === userId){
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input");
    }


    
    const [agentWallet, userWallet] = await Promise.all([
        Wallet.findOne({ user: agent.userId }),
        Wallet.findOne({ user: userId })
    ]);

    if (!userWallet || userWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "User has insufficient balance");
    }
    if (!agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        userWallet.balance -= amount;
        agentWallet.balance += amount;

        await userWallet.save({ session });
        await agentWallet.save({ session });

        await Transaction.create([{
            user: userId,
            receiver: agent.userId,
            type: TransactionType.WITHDRAW,
            amount,
            status: TransactionStatus.SUCCESS
        }], { session });

        await session.commitTransaction();
        session.endSession();
        return { userWallet, agentWallet };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Cash-out failed");
    }
}

export const AgentServices = {
    agentCashIn,
    agentCashOut
}