/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import httpStatus from "http-status-codes"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { AuthServices } from "./auth.service"
import { setAuthCookie } from "../../utils/setCookie"
import { envVars } from "../../config/env"

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body)

    setAuthCookie(res, loginInfo)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged In Successfully",
        data: loginInfo,
    })
})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    res.clearCookie("accessToken", {
        httpOnly: true,
        // secure: envVars.NODE_ENV === "production", // match login
        secure: true,
        sameSite: "none",
        path: "/",
    })

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged Out Successfully",
        data: null,
    })
})

export const AuthControllers = {
    credentialsLogin,
    logout
}