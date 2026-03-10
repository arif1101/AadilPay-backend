/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken"
import httpStatus from "http-status-codes"
import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.mode";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { TransactionType } from "../transaction/transaction.constant";
import { TransactionStatus } from "../transaction/transaction.interface";
import { AccountStatus, IUser, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import { WalletStatus } from "../wallet/wallet.interface";
import { envVars } from "../../config/env";


const getAgentTransactions = async (agentId: string) => {
  const transactions = await Transaction.find({
    $or: [
      { user: agentId },
      { receiver: agentId }
    ]
  })
  .populate("user", "name phone")
  .populate("receiver", "name phone")
  .sort({ createdAt: -1 });

  return transactions;
};

const agentCashIn = async(agent: JwtPayload, userPhone: string, amount: number) => 
    
    {
        
    if(!userPhone || amount<0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input");
    }
    
    const agentAccount = await User.findById(agent.userId)
    if(agentAccount?.accountStatus === AccountStatus.SUSPENDED){
        throw new AppError(httpStatus.BAD_REQUEST, "Account suspended")
    }
    
    const user = await User.findOne({phone: userPhone, role: Role.USER})
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    
    if (user.accountStatus === AccountStatus.SUSPENDED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User account suspended");
    }
    
    const [agentWallet, userWallet] = await Promise.all([
        Wallet.findOne({user: agent.userId}),
        Wallet.findOne({user: user._id})
    ])
    if(!agentWallet || agentWallet.balance < amount){
        throw new AppError(httpStatus.BAD_REQUEST, "Agent has insufficient balance");
    }

    if(!userWallet){
        throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }

    if (userWallet.status === WalletStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, "User wallet is blocked");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        agentWallet.balance -= amount;
        userWallet.balance +=amount;

        await agentWallet.save({session});
        await userWallet.save({session});
        await Transaction.create([{
            user: agent.userId,
            receiver: user._id,
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

const agentCashOut = async(agent: JwtPayload, userPhone: string, amount: number) => {
    
    if(!userPhone || amount<0){
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid input: user phone or amount incorrect");
    }

    // find user by phone
    const user = await User.findOne({ phone: userPhone, role: Role.USER });
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (agent.userId.toString() === user._id.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, "Agent and user cannot be the same");
    }

    const [agentAccount, agentWallet, userWallet] = await Promise.all([
        User.findById(agent.userId),
        Wallet.findOne({ user: agent.userId }),
        Wallet.findOne({ user: user._id })
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
        // deduct from user
        userWallet.balance -= amount;
        await userWallet.save({ session });

        // add to agent
        agentWallet.balance += amount;
        await agentWallet.save({ session });

        await Transaction.create([{
            user: user._id,
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

// const updateAgent = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

//     const isUserExist = await User.findById(userId);

//     if(!isUserExist) {
//         throw new AppError(httpStatus.NOT_FOUND, "User not found")
//     }

//     if(payload.role){
//         if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
//             throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
//         }
//     }
//     if(payload.accountStatus || payload.commissionRate || payload.status) {
//         if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
//             throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
//         }
//     }

//     if (payload.password) {
//         payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
//     }

//     if(payload.phone){
//         const phoneRegex = /^01[0-9]{9}$/;
//         if(!phoneRegex.test(payload.phone)){
//             throw new AppError(httpStatus.BAD_REQUEST, 'Invalid phone number format')
//         }
//     }

//     const newUpdateduser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

//     return newUpdateduser
// }

export const AgentServices = {
    agentCashIn,
    agentCashOut,
    getAgentTransactions,
    // updateAgent
}