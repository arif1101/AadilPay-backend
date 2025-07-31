// import {Request, Response, NextFunction } from "express";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "../transaction/transaction.model";
import { AccountStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.mode";
import httpStatus from "http-status-codes"


const getAllUsers = async() => {

    return await User.find({role: 'USER'})
}

const getAllAgents = async() => {

    return await User.find({role: 'AGENT'})
}

const getAllWallets = async() => {

    return await Wallet.find().populate("user", 'name phone role')
}

const getAllTransactions = async() => {
    return await Transaction.find().populate("user", 'name phone role').populate("receiver", 'name phone role')
}

const suspandAgent = async (agentId: string) => {
    const agent = await User.findById(agentId)
    if(!agent){
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found")
    }

    agent.accountStatus = AccountStatus.SUSPENDED;
    await agent.save();
    return agent;
}

const approvedAgent = async (agentId: string) => {
    const agent = await User.findById(agentId)
    if(!agent){
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found")
    }

    agent.accountStatus = AccountStatus.APPROVED;
    await agent.save();
    return agent;
}

export const adminServices = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions,
    suspandAgent,
    approvedAgent
}