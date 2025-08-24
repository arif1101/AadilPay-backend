/* eslint-disable @typescript-eslint/no-unused-vars */
import {Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"
import { AgentServices } from "./agent.service";
import { Transaction } from "../transaction/transaction.model";



const getAgentTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const agentId = req.user.userId;

    const result = await AgentServices.getAgentTransactions(agentId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Agent transactions fetched successfully",
      data: result,
    });
  }
);



const agentCashIn = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const agent = req.user; //AGENT
    const {userPhone, amount} = req.body
    const result = await AgentServices.agentCashIn(agent, userPhone, amount);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Cash-in successful",
        data: result,
    });
})

// Agent → Withdraw money from user's wallet
export const agentCashOut = catchAsync(async (req, res) => {
  const agent = req.user;
  const { userPhone, amount } = req.body;

  const result = await AgentServices.agentCashOut(agent, userPhone, amount);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash-out successful",
    data: result,
  });
});


export const AgentControllers = {
    agentCashIn,
    agentCashOut,
    getAgentTransactions
} 