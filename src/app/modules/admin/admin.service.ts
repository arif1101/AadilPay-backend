// import {Request, Response, NextFunction } from "express";
import { Transaction } from "../transaction/transaction.model";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.mode";



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
    return await Transaction.find().populate("user", 'name phone').populate("receiver", 'name phone')
}
export const adminServices = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions
}