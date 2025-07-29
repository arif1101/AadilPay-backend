/* eslint-disable @typescript-eslint/no-unused-vars */
import {Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionServices } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes"


const MyTransaction = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const transaction = await TransactionServices.MyTransaction(user.userId)
    sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Transaction history fetched successfully",
    data: transaction
    });
})

export const TransactionControllers = { MyTransaction };
