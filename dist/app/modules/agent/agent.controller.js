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
exports.AgentControllers = exports.agentCashOut = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const agent_service_1 = require("./agent.service");
const getAgentTransactions = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agentId = req.user.userId;
    const result = yield agent_service_1.AgentServices.getAgentTransactions(agentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent transactions fetched successfully",
        data: result,
    });
}));
const agentCashIn = (0, catchAsync_1.catchAsync)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = req.user; //AGENT
    const { userPhone, amount } = req.body;
    const result = yield agent_service_1.AgentServices.agentCashIn(agent, userPhone, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash-in successful",
        data: result,
    });
}));
// Agent → Withdraw money from user's wallet
exports.agentCashOut = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const agent = req.user;
    const { userPhone, amount } = req.body;
    const result = yield agent_service_1.AgentServices.agentCashOut(agent, userPhone, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash-out successful",
        data: result,
    });
}));
// const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//   const verifiedToken = req.user as JwtPayload;
//   const userId = verifiedToken?.userId;
//   if (!userId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user information");
//   }
//   const payload = req.body;
//   const updateUser = await AgentServices.updateAgent(userId, payload, verifiedToken);
//   sendResponse(res, {
//     success: true,
//     statusCode: httpStatus.OK,
//     message: "User updated successfully",
//     data: updateUser,
//   });
// });
exports.AgentControllers = {
    agentCashIn,
    agentCashOut: exports.agentCashOut,
    getAgentTransactions
};
