import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes"
import bcryptjs from "bcryptjs";
import { generateToken } from "../../utils/jwt";
import { envVars } from "../../config/env";



const credentialsLogin = async(payload: Partial<IUser>) => {
    const {phone, password} = payload;

    const isUserExist = await User.findOne({phone})
    if(!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "Phone number invalid")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

    if(!isPasswordMatched){
        throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
    }

    const jwtPayload = {
        userId: isUserExist._id,
        phone: isUserExist.phone,
        role: isUserExist.role
    }
    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return {
        accessToken
    }


}

export const AuthServices = {
    credentialsLogin
}