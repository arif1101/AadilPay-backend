/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"
import { Wallet } from "./wallet.mode"
import httpStatus from "http-status-codes"
import mongoose from "mongoose"
import { User } from "../user/user.model"
import { Transaction } from "../transaction/transaction.model"
import { TransactionType } from "../transaction/transaction.constant"
import { TransactionStatus } from "../transaction/transaction.interface"
import { WalletStatus } from "./wallet.interface"
import { Role } from "../user/user.interface"


const getMyWallet = async(userId: string) => {
    const wallet = await Wallet.findOne({user: userId}).populate("user", 'name')

    if(!wallet){
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found")
    }

    return wallet
}

const topUp = async(user : JwtPayload, amount: number) => {
    if(!amount || amount <=0){
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid top-up amount');
    }
    const wallet = await Wallet.findOne({ user: user.userId });
    if (!wallet) {
        throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');
    }

    console.log(wallet)
    if (wallet.status === WalletStatus.BLOCKED) {
        throw new AppError(httpStatus.BAD_REQUEST, 'No topUp, Wallet blocked');
    }
    
    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
        user: user.userId,
        type: TransactionType.TOP_UP,
        amount,
        status: TransactionStatus.SUCCESS,
    });

    return wallet

}

const withdraw = async(user: JwtPayload, amount:number, agentId: string) => {
    if(amount<=0){
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid withdraw amoun")
    }

    // get user's wallet 
    const wallet = await Wallet.findOne({user: user.userId})
    if(!wallet || wallet.balance<amount){
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance")
    }

    // check if agent exist and is valid 
    const agent = await User.findOne({_id: agentId, role: "AGENT"})
    if(!agent){
        throw new AppError(httpStatus.BAD_REQUEST, "Agent not found");
    }

    // get agent's wallet 
    const agentWallet = await Wallet.findOne({user: agentId});
    if(!agentWallet){
        throw new AppError(httpStatus.BAD_REQUEST, "Agent wallet not found");
    }

    // start transaction 
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try{
        
        wallet.balance -= amount;
        await wallet.save({session});

        // add to agent
        agentWallet.balance+=amount;
        await agentWallet.save({session})

        await Transaction.create([{
            user: user.userId,
            type: TransactionType.WITHDRAW,
            amount,
            status: TransactionStatus.SUCCESS,
            receiver: agentId
        }], {session})
        await session.commitTransaction();
        session.endSession();
        
        return {userWallet: wallet, agentWallet}
    }catch(err){
        console.error("Withdraw error details:", err);
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "withdraw failed")
    }
}

// send money 
const sendMoney = async(sender: JwtPayload, receiverId: string, amount: number) => {
    const user = await User.findById(receiverId)
    if (!user || user.role !== Role.USER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Send money only to valid users");
    }
    
    if(!receiverId || !amount || amount<=0){
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid transfer request");
    }

    if(sender.userId.toString() === receiverId){
        throw new AppError(httpStatus.BAD_REQUEST, "Cannot transfer to self");
    }

    const [senderWallet, receiverWallet] = await Promise.all([
        Wallet.findOne({ user: sender.userId }),
        Wallet.findOne({ user: receiverId }),
    ]);
    if(!senderWallet || senderWallet.balance < amount){
        throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    }
    if (!receiverWallet) {
        throw new AppError(httpStatus.BAD_REQUEST, "Receiver wallet not found");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        senderWallet.balance -= amount;
        receiverWallet.balance += amount;

        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        await Transaction.create([{
            user: sender.userId,
            type: TransactionType.TRANSFER,
            amount,
            status: TransactionStatus.SUCCESS,
            receiver: receiverId
        }], {session})

        await session.commitTransaction();
        session.endSession();

        return {
        senderWallet,
        receiverWallet,
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Transfer failed");
    }

}

const blockWallet = async(walletId : string) => {
    const wallet = await Wallet.findById(walletId);

    if(!wallet){
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
    }

    wallet.status = WalletStatus.BLOCKED;
    await wallet.save() ;
    return wallet
}

const activeWallet = async (walletId: string) => {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new AppError(httpStatus.NOT_FOUND, 'Wallet not found');

    wallet.status = WalletStatus.ACTIVE;
    await wallet.save();
    return wallet;
}


export const WalletServices = {
    getMyWallet,
    withdraw,
    sendMoney,
    blockWallet,
    activeWallet,
    topUp
}