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

const topUp = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.user as JwtPayload;
    const {amount} = req.body;

    const result = await WalletServices.topUp(user, amount);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'Wallet topped up successfully',
        data: result,
    });
})

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

const withdraw = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {amount, agentNumber} = req.body;
    const user = req.user;

    const result = await WalletServices.withdraw(user, agentNumber, amount);

    sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdrawal successful",
    data: result,
    });
})

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

const sendMoney = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const {receiverNumber, amount} = req.body
    const sender = req.user
    const result = await WalletServices.sendMoney(sender, receiverNumber, amount)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "send money successful",
        data: result,
    });
})

const blockWallet = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const walletId = req.params.id;
    const result = await WalletServices.blockWallet(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet blocked successfully',
      data: result,
    });
})

const activeWallet = catchAsync(async (req: Request, res: Response) => {
    const walletId = req.params.id;
    const result = await WalletServices.activeWallet(walletId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Wallet unblocked successfully',
      data: result,
    });
})


export const WalletControllers = {
    getMyWallet,
    withdraw,
    sendMoney,
    blockWallet,
    activeWallet,
    topUp
}