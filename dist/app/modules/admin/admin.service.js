"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminServices = void 0;
// import {Request, Response, NextFunction } from "express";
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const transaction_model_1 = require("../transaction/transaction.model");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const wallet_mode_1 = require("../wallet/wallet.mode");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// const getAllUsers = async() => {
//     return await User.find({role: 'USER'})
// }
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.aggregate([
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
});
const getAllAgents = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield user_model_1.User.find({ role: 'AGENT' });
});
const getAllWallets = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield wallet_mode_1.Wallet.find().populate("user", 'name phone role');
});
const getAllTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield transaction_model_1.Transaction.find().populate("user", 'name phone role').populate("receiver", 'name phone role');
});
const suspandAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent || (agent === null || agent === void 0 ? void 0 : agent.role) != "AGENT") {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found. It will be USER");
    }
    agent.accountStatus = user_interface_1.AccountStatus.SUSPENDED;
    yield agent.save();
    return agent;
});
const approvedAgent = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = yield user_model_1.User.findById(agentId);
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    agent.accountStatus = user_interface_1.AccountStatus.APPROVED;
    yield agent.save();
    return agent;
});
// admin updating 
const updateAdmin = (adminId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield user_model_1.User.findById(adminId);
    if (!admin) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Admin not found");
    }
    // Only allow updating safe fields
    if (payload.name)
        admin.name = payload.name;
    if (payload.phone)
        admin.phone = payload.phone;
    if (payload.password) {
        const salt = yield bcryptjs_1.default.genSalt(10);
        admin.password = yield bcryptjs_1.default.hash(payload.password, salt);
    }
    yield admin.save();
    return admin;
});
const getAdminInfo = (adminId) => __awaiter(void 0, void 0, void 0, function* () {
    const admin = yield user_model_1.User.findById(adminId).select("-password"); // exclude password
    if (!admin) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Admin not found");
    }
    return admin;
});
exports.adminServices = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions,
    suspandAgent,
    approvedAgent,
    updateAdmin,
    getAdminInfo
};
