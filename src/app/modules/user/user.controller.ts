import { Request, Response } from "express"
import { UserServices } from "./user.service"
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

export const UserControllers = {
    createUser
}