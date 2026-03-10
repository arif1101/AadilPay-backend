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
    })
        .populate("user", "name phone")
        .populate("receiver", "name phone")
        .sort({ createdAt: -1 });
    return transactions;
});
const agentCashIn = (agent, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userPhone || amount < 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid input");
    }
    const agentAccount = yield user_model_1.User.findById(agent.userId);
    if ((agentAccount === null || agentAccount === void 0 ? void 0 : agentAccount.accountStatus) === user_interface_1.AccountStatus.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Account suspended");
    }
    const user = yield user_model_1.User.findOne({ phone: userPhone, role: user_interface_1.Role.USER });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.accountStatus === user_interface_1.AccountStatus.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User account suspended");
    }
    const [agentWallet, userWallet] = yield Promise.all([
        wallet_mode_1.Wallet.findOne({ user: agent.userId }),
        wallet_mode_1.Wallet.findOne({ user: user._id })
    ]);
    if (!agentWallet || agentWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent has insufficient balance");
    }
    if (!userWallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.status === wallet_interface_1.WalletStatus.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User wallet is blocked");
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        agentWallet.balance -= amount;
        userWallet.balance += amount;
        yield agentWallet.save({ session });
        yield userWallet.save({ session });
        yield transaction_model_1.Transaction.create([{
                user: agent.userId,
                receiver: user._id,
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
const agentCashOut = (agent, userPhone, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userPhone || amount < 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid input: user phone or amount incorrect");
    }
    // find user by phone
    const user = yield user_model_1.User.findOne({ phone: userPhone, role: user_interface_1.Role.USER });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (agent.userId.toString() === user._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent and user cannot be the same");
    }
    const [agentAccount, agentWallet, userWallet] = yield Promise.all([
        user_model_1.User.findById(agent.userId),
        wallet_mode_1.Wallet.findOne({ user: agent.userId }),
        wallet_mode_1.Wallet.findOne({ user: user._id })
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
        // deduct from user
        userWallet.balance -= amount;
        yield userWallet.save({ session });
        // add to agent
        agentWallet.balance += amount;
        yield agentWallet.save({ session });
        yield transaction_model_1.Transaction.create([{
                user: user._id,
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
exports.AgentServices = {
    agentCashIn,
    agentCashOut,
    getAgentTransactions,
    // updateAgent
};
