// import {Request, Response, NextFunction } from "express";
import AppError from "../../errorHelpers/AppError";
import { Transaction } from "../transaction/transaction.model";
import { AccountStatus } from "../user/user.interface";
import { User } from "../user/user.model";
import { Wallet } from "../wallet/wallet.mode";
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs";


// const getAllUsers = async() => {

//     return await User.find({role: 'USER'})
// }

const getAllUsers = async () => {
  return await User.aggregate([
    { $match: { role: "USER" } }, // only fetch users
    {
      $lookup: {
        from: "wallets",
        localField: "_id",
        foreignField: "user",
        as: "wallet"
      }
    },
    {
      $unwind: {
        path: "$wallet",
        preserveNullAndEmptyArrays: true
      }
    }
  ]);
};


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
    if(!agent || agent?.role !="AGENT"){
        throw new AppError(httpStatus.NOT_FOUND, "Agent not found. It will be USER")
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

// admin updating 
const updateAdmin = async (adminId: string, payload: Partial<{ name: string; phone: string; password: string }>) => {
  const admin = await User.findById(adminId);

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // Only allow updating safe fields
  if (payload.name) admin.name = payload.name;
  if (payload.phone) admin.phone = payload.phone;

  if (payload.password) {
    const salt = await bcryptjs.genSalt(10);
    admin.password = await bcryptjs.hash(payload.password, salt);
  }

  await admin.save();
  return admin;
};


const getAdminInfo = async (adminId: string) => {
  const admin = await User.findById(adminId).select("-password"); // exclude password
  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }
  return admin;
};

export const adminServices = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions,
    suspandAgent,
    approvedAgent,
    updateAdmin,
    getAdminInfo
}