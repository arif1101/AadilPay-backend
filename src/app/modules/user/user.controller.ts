/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { getMyProfile, UserServices } from "./user.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { JwtPayload } from "jsonwebtoken"
import AppError from "../../errorHelpers/AppError"


const createUser = catchAsync(async(req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})

// get my profile 
export const getLoggedInUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await getMyProfile(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Retrieved successfully",
      data: user
  })
};

// update own user 
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const verifiedToken = req.user as JwtPayload;

  const userId = verifiedToken?.userId;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user information");
  }

  const payload = req.body;

  const updateUser = await UserServices.updateUser(userId, payload, verifiedToken);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: updateUser,
  });
});




export const UserControllers = {
    createUser,
    updateUser
}