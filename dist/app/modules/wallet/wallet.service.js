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
exports.WalletServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const wallet_mode_1 = require("./wallet.mode");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../user/user.model");
const transaction_model_1 = require("../transaction/transaction.model");
const transaction_constant_1 = require("../transaction/transaction.constant");
const transaction_interface_1 = require("../transaction/transaction.interface");
const wallet_interface_1 = require("./wallet.interface");
const user_interface_1 = require("../user/user.interface");
const getMyWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_mode_1.Wallet.findOne({ user: userId }).populate("user", 'name');
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    return wallet;
});
const topUp = (user, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (!amount || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'Invalid top-up amount');
    }
    const wallet = yield wallet_mode_1.Wallet.findOne({ user: user.userId });
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Wallet not found');
    }
    console.log(wallet);
    if (wallet.status === wallet_interface_1.WalletStatus.BLOCKED) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, 'No topUp, Wallet blocked');
    }
    wallet.balance += amount;
    yield wallet.save();
    yield transaction_model_1.Transaction.create({
        user: user.userId,
        type: transaction_constant_1.TransactionType.TOP_UP,
        amount,
        status: transaction_interface_1.TransactionStatus.SUCCESS,
    });
    return wallet;
});
const withdraw = (user, agentNumber, amount) => __awaiter(void 0, void 0, void 0, function* () {
    if (amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid withdraw amoun");
    }
    // get user's wallet 
    const wallet = yield wallet_mode_1.Wallet.findOne({ user: user.userId });
    if (!wallet || wallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    // check if agent exist and is valid 
    const agent = yield user_model_1.User.findOne({ phone: agentNumber, role: "AGENT" });
    if (!agent) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent not found");
    }
    // get agent's wallet 
    const agentWallet = yield wallet_mode_1.Wallet.findOne({ user: agent._id });
    if (!agentWallet) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent wallet not found");
    }
    // start transaction 
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        wallet.balance -= amount;
        yield wallet.save({ session });
        // add to agent
        agentWallet.balance += amount;
        yield agentWallet.save({ session });
        yield transaction_model_1.Transaction.create([{
                user: user.userId,
                type: transaction_constant_1.TransactionType.CASH_OUT,
                amount,
                status: transaction_interface_1.TransactionStatus.SUCCESS,
                receiver: agent._id
            }], { session });
        yield session.commitTransaction();
        session.endSession();
        return { userWallet: wallet, agentWallet };
    }
    catch (err) {
        console.error("Withdraw error details:", err);
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "withdraw failed");
    }
});
// send money 
// const sendMoney = async(sender: JwtPayload, receiverId: string, amount: number) => {
//     const user = await User.findById(receiverId)
//     if (!user || user.role !== Role.USER) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Send money only to valid users");
//     }
//     if(!receiverId || !amount || amount<=0){
//         throw new AppError(httpStatus.BAD_REQUEST, "Invalid transfer request");
//     }
//     if(sender.userId.toString() === receiverId){
//         throw new AppError(httpStatus.BAD_REQUEST, "Cannot transfer to self");
//     }
//     const [senderWallet, receiverWallet] = await Promise.all([
//         Wallet.findOne({ user: sender.userId }),
//         Wallet.findOne({ user: receiverId }),
//     ]);
//     if(!senderWallet || senderWallet.balance < amount){
//         throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
//     }
//     if (!receiverWallet) {
//         throw new AppError(httpStatus.BAD_REQUEST, "Receiver wallet not found");
//     }
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         senderWallet.balance -= amount;
//         receiverWallet.balance += amount;
//         await senderWallet.save({ session });
//         await receiverWallet.save({ session });
//         await Transaction.create([{
//             user: sender.userId,
//             type: TransactionType.TRANSFER,
//             amount,
//             status: TransactionStatus.SUCCESS,
//             receiver: receiverId
//         }], {session})
//         await session.commitTransaction();
//         session.endSession();
//         return {
//         senderWallet,
//         receiverWallet,
//         };
//     } catch (err) {
//         await session.abortTransaction();
//         session.endSession();
//         throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Transfer failed");
//     }
// }
const sendMoney = (sender, receiverNumber, amount) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ phone: receiverNumber });
    if (!user || user.role !== user_interface_1.Role.USER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Send money only to valid users");
    }
    if (!receiverNumber || !amount || amount <= 0) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Invalid transfer request");
    }
    if (sender.userId.toString() === user._id.toString()) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Cannot transfer to self");
    }
    const [senderWallet, receiverWallet] = yield Promise.all([
        wallet_mode_1.Wallet.findOne({ user: sender.userId }),
        wallet_mode_1.Wallet.findOne({ user: user._id }),
    ]);
    console.log(senderWallet);
    if ((senderWallet === null || senderWallet === void 0 ? void 0 : senderWallet.status) === "BLOCKED") {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "your account BLOCKED, contact to support");
    }
    if (!senderWallet || senderWallet.balance < amount) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    }
    if (!receiverWallet) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Receiver wallet not found");
    }
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        senderWallet.balance -= amount;
        receiverWallet.balance += amount;
        yield senderWallet.save({ session });
        yield receiverWallet.save({ session });
        yield transaction_model_1.Transaction.create([{
                user: sender.userId,
                type: transaction_constant_1.TransactionType.TRANSFER,
                amount,
                status: transaction_interface_1.TransactionStatus.SUCCESS,
                receiver: user._id
            }], { session });
        yield session.commitTransaction();
        session.endSession();
        return {
            senderWallet,
            receiverWallet,
        };
    }
    catch (err) {
        yield session.abortTransaction();
        session.endSession();
        throw new AppError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "Transfer failed");
    }
});
const blockWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_mode_1.Wallet.findById(walletId);
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    wallet.status = wallet_interface_1.WalletStatus.BLOCKED;
    yield wallet.save();
    return wallet;
});
const activeWallet = (walletId) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_mode_1.Wallet.findById(walletId);
    if (!wallet)
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, 'Wallet not found');
    wallet.status = wallet_interface_1.WalletStatus.ACTIVE;
    yield wallet.save();
    return wallet;
});
exports.WalletServices = {
    getMyWallet,
    withdraw,
    sendMoney,
    blockWallet,
    activeWallet,
    topUp
};
