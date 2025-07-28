/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express"
import { getMyProfile, UserServices } from "./user.service"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"


const createUser = catchAsync(async(req: Request, res: Response) => {
    const user = await UserServices.createUser(req.body)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "User created successfully",
        data: user
    })
})


export const getLoggedInUser = async (req: Request, res: Response) => {
  const userId = (req as any).user?._id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = await getMyProfile(userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};



export const UserControllers = {
    createUser
}