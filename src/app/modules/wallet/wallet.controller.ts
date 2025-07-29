/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { WalletServices } from "./wallet.service";
import httpStatus from "http-status-codes"
import { sendResponse } from "../../utils/sendResponse";


export const getMyWallet = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload

    const wallet = await WalletServices.getMyWallet(user.userId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Retrieved successfully",
        data: wallet
    })

})

const withdraw = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {amount, agentId} = req.body;
    const user = req.user;

    const result = await WalletServices.withdraw(user, amount, agentId);

    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdrawal successful",
    data: result,
    });
})

// transfer or send money 

const sendMoney = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {receiverId, amount} = req.body
    const sender = req.user
    const result = await WalletServices.sendMoney(sender, receiverId, amount)
    console.log("result : ", result)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "send money successful",
        data: result,
    });
})


export const WalletControllers = {
    getMyWallet,
    withdraw,
    sendMoney
}