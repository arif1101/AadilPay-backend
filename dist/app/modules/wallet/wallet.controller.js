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
exports.WalletControllers = exports.getMyWallet = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const wallet_service_1 = require("./wallet.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const sendResponse_1 = require("../../utils/sendResponse");
exports.getMyWallet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const wallet = yield wallet_service_1.WalletServices.getMyWallet(user.userId);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Retrieved successfully",
        data: wallet
    });
}));
const topUp = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { amount } = req.body;
    const result = yield wallet_service_1.WalletServices.topUp(user, amount);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: 'Wallet topped up successfully',
        data: result,
    });
}));
// const withdraw = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
//     const {amount, agentId} = req.body;
//     const user = req.user;
//     const result = await WalletServices.withdraw(user, amount, agentId);
//     sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Withdrawal successful",
//     data: result,
//     });
// })
const withdraw = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, agentNumber } = req.body;
    const user = req.user;
    const result = yield wallet_service_1.WalletServices.withdraw(user, agentNumber, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Withdrawal successful",
        data: result,
    });
}));
// transfer or send money 
// using receiverId and amoun 
// const sendMoney = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
//     const {receiverId, amount} = req.body
//     const sender = req.user
//     const result = await WalletServices.sendMoney(sender, receiverId, amount)
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "send money successful",
//         data: result,
//     });
// })
// using receiver number and amoun 
const sendMoney = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverNumber, amount } = req.body;
    const sender = req.user;
    const result = yield wallet_service_1.WalletServices.sendMoney(sender, receiverNumber, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "send money successful",
        data: result,
    });
}));
const blockWallet = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.params.id;
    const result = yield wallet_service_1.WalletServices.blockWallet(walletId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Wallet blocked successfully',
        data: result,
    });
}));
const activeWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const walletId = req.params.id;
    const result = yield wallet_service_1.WalletServices.activeWallet(walletId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: 'Wallet unblocked successfully',
        data: result,
    });
}));
exports.WalletControllers = {
    getMyWallet: exports.getMyWallet,
    withdraw,
    sendMoney,
    blockWallet,
    activeWallet,
    topUp
};
