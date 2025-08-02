/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken"
import httpStatus from "http-status-codes"
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.mode";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.constant";
import { TransactionStatus } from "../transaction/transaction.interface";
import { AccountStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { WalletStatus } from "../wallet/wallet.interface";


const getAgentTransactions = async (agentId: string) => {
  const transactions = await Transaction.find({
    $or: [
      { user: agentId },
      { receiver: agentId }
    ]
  }).sort({ createdAt: -1 });

  return transactions;
};

const agentCashIn = async(agent: JwtPayload, userId: string, amount: number) => {
    if(!userId || amount<0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input");
    }
    
    const accountStatus = await User.findById(agent.userId)
    const walletStatus = await Wallet.findOne({user: userId})

    
    if(accountStatus?.accountStatus === AccountStatus.SUSPENDED){
        throw new AppError(httpStatus.BAD_REQUEST, "Account suspended")
    }
    
    if(walletStatus?.status === WalletStatus.BLOCKED){
        throw new AppError(httpStatus.BAD_REQUEST, "Account blocked")
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
        console.log(agent.userId, userId)//ok
        await Transaction.create([{
            user: agent.userId,
            receiver: userId,
            type: TransactionType.CASH_IN,
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
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input: User ID or amount incorrect");
    }


    
    const [agentAccount, agentWallet, userWallet] = await Promise.all([
        User.findById(agent.userId),
        Wallet.findOne({ user: agent.userId }),
        Wallet.findOne({ user: userId })
    ]);

    if (!userWallet) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet not found");
    }
    if (!agentWallet) {
        throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    if (userWallet.status === WalletStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet is blocked");
    }
    if (agentAccount?.accountStatus === AccountStatus.SUSPENDED) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent account is suspended");
    }
    if (userWallet.balance < amount) {
        throw new AppError(httpStatus.BAD_REQUEST, "User has insufficient balance"); // ✅ Correct
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
            type: TransactionType.CASH_OUT,
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
    agentCashOut,
    getAgentTransactions
}