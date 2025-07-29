/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"
import { Wallet } from "./wallet.mode"
import httpStatus from "http-status-codes"
import mongoose from "mongoose"
import { User } from "../user/user.model"


const getMyWallet = async(userId: string) => {
    const wallet = await Wallet.findOne({user: userId})

    if(!wallet){
        throw new AppError(httpStatus.NOT_FOUND, "Wallet not found")
    }

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

        await session.commitTransaction();
        session.endSession();
        
        return {userWallet: wallet, agentWallet}
    }catch(err){
        await session.abortTransaction();
        session.endSession();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "withdraw failed")
    }
}


export const WalletServices = {
    getMyWallet,
    withdraw
}