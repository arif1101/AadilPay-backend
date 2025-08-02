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
exports.AgentServices = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const wallet_mode_1 = require("../wallet/wallet.mode");
const mongoose_1 = __importDefault(require("mongoose"));
const transaction_model_1 = require("../transaction/transaction.model");
const transaction_constant_1 = require("../transaction/transaction.constant");
const transaction_interface_1 = require("../transaction/transaction.interface");
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const wallet_interface_1 = require("../wallet/wallet.interface");
const getAgentTransactions = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactions = yield transaction_model_1.Transaction.find({
        $or: [
            { user: agentId },
            { receiver: agentId }
        ]
    }).sort({ createdAt: -1 });
    return transactions;
});
const agentCashIn = (agent, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId || amount < 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid input");
    }
    const accountStatus = yield user_model_1.User.findById(agent.userId);
    const walletStatus = yield wallet_mode_1.Wallet.findOne({ user: userId });
    if ((accountStatus === null || accountStatus === void 0 ? void 0 : accountStatus.accountStatus) === user_interface_1.AccountStatus.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Account suspended");
    }
    if ((walletStatus === null || walletStatus === void 0 ? void 0 : walletStatus.status) === wallet_interface_1.WalletStatus.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Account blocked");
    }
    const [agentWallet, userWallet] = yield Promise.all([
        wallet_mode_1.Wallet.findOne({ user: agent.userId }),
        wallet_mode_1.Wallet.findOne({ user: userId })
    ]);
    if (!agentWallet || agentWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent has insufficient balance");
    }
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        agentWallet.balance -= amount;
        userWallet.balance += amount;
        yield agentWallet.save({ session });
        yield userWallet.save({ session });
        console.log(agent.userId, userId); //ok
        yield transaction_model_1.Transaction.create([{
                user: agent.userId,
                receiver: userId,
                type: transaction_constant_1.TransactionType.CASH_IN,
                amount,
                status: transaction_interface_1.TransactionStatus.SUCCESS
            }], { session });
        yield session.commitTransaction();
        session.endSession();
        return { userWallet, agentWallet };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Cash-in failed");
    }
});
const agentCashOut = (agent, userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId || amount < 0 || agent.userId.toString() === userId) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid input: User ID or amount incorrect");
    }
    const [agentAccount, agentWallet, userWallet] = yield Promise.all([
        user_model_1.User.findById(agent.userId),
        wallet_mode_1.Wallet.findOne({ user: agent.userId }),
        wallet_mode_1.Wallet.findOne({ user: userId })
    ]);
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User wallet not found");
    }
    if (!agentWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
    }
    if (userWallet.status === wallet_interface_1.WalletStatus.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User wallet is blocked");
    }
    if ((agentAccount === null || agentAccount === void 0 ? void 0 : agentAccount.accountStatus) === user_interface_1.AccountStatus.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent account is suspended");
    }
    if (userWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User has insufficient balance"); // ✅ Correct
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        userWallet.balance -= amount;
        agentWallet.balance += amount;
        yield userWallet.save({ session });
        yield agentWallet.save({ session });
        yield transaction_model_1.Transaction.create([{
                user: userId,
                receiver: agent.userId,
                type: transaction_constant_1.TransactionType.CASH_OUT,
                amount,
                status: transaction_interface_1.TransactionStatus.SUCCESS
            }], { session });
        yield session.commitTransaction();
        session.endSession();
        return { userWallet, agentWallet };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Cash-out failed");
    }
});
exports.AgentServices = {
    agentCashIn,
    agentCashOut,
    getAgentTransactions
};
