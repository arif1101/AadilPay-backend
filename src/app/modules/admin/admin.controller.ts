/* eslint-disable @typescript-eslint/no-unused-vars */
import {Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";




const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const result = await adminServices.getAllUsers()

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users fetched successfully',
        data: result,
    });
})

const getAllAgents = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const agents = await adminServices.getAllAgents()

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users fetched successfully',
        data: agents,
    });
})

const getAllWallets = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const wallets = await adminServices.getAllWallets()

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'Users fetched successfully',
        data: wallets,
    });
})

export const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllTransactions();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Transactions fetched successfully',
    data: result,
  });
});

export const adminControllers = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions
}