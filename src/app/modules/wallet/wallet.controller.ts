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


export const WalletControllers = {
    getMyWallet
}