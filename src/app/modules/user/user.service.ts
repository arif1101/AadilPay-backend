import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";



const createUser = async (payload: Partial<IUser>) => {
    const {phone, password, ...rest } = payload;

    const isUserExist = await User.findOne({phone})

    if(isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    
    const user = await User.create({
        phone,
        password: hashedPassword,
        ...rest
    })

    return user
}

export const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  return user;
};

export const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    console.log("-------",userId)

    const isUserExist = await User.findById(userId);

    if(!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if(payload.role){
        if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
            throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
        }
    }
    if(payload.isApproved || payload.commissionRate) {
        if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
            throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }

    const newUpdateduser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

    return newUpdateduser
}

export const UserServices = {
    createUser,
    updateUser
}