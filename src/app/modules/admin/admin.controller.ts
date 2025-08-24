/* eslint-disable @typescript-eslint/no-unused-vars */
import {Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminServices } from "./admin.service";
import httpStatus from "http-status-codes"



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

const suspendAgent = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const result = await adminServices.suspandAgent(agentId);
    console.log(result)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Agent suspended',
      data: result,
    });
})

const approvedAgent = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
    const agentId = req.params.id;
    const result = await adminServices.approvedAgent(agentId);
    console.log(result)
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Agent approved',
      data: result,
    });
})

const updateAdmin = catchAsync(async (req: Request, res: Response) => {
  // get logged in admin from decoded JWT
  const adminId = req.user.userId;  

  const result = await adminServices.updateAdmin(adminId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});


const getAdminInfo = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user.userId;

  const result = await adminServices.getAdminInfo(adminId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin info fetched successfully",
    data: result,
  });
});


export const adminControllers = {
    getAllUsers,
    getAllAgents,
    getAllWallets,
    getAllTransactions,
    suspendAgent,
    approvedAgent,
    updateAdmin,
    getAdminInfo
}