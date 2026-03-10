import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError";
import { IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { Wallet } from "../wallet/wallet.mode";



const createUser = async (payload: Partial<IUser>) => {
    const {phone, password, ...rest } = payload;

    const isUserExist = await User.findOne({phone})

    if(payload.role === Role.ADMIN){
        throw new AppError(httpStatus.BAD_REQUEST, "Your cannot create ADMIN") 
    }

    if(isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
    }

    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    
    // user create 
    const user = await User.create({
        phone,
        password: hashedPassword,
        ...rest
    })

    // wallet create 
    await Wallet.create({
        user: user._id,
        balance: 1000,
        isBlocked: false,
    })
    
    return user
}

const getMyProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-password');
  if(!user){
    throw new Error('User not found');
  }

  const wallet = await Wallet.findOne({user: userId})
  
  return {
    user,
    wallet
  }
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

    const isUserExist = await User.findById(userId);

    if(!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found")
    }

    if(payload.role){
        if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
            throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
        }
    }
    if(payload.accountStatus || payload.commissionRate || payload.status) {
        if(decodedToken.role === Role.USER || decodedToken.role === Role.AGENT){
            throw new AppError(httpStatus.FORBIDDEN, "Your are not authorized")
        }
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(payload.password, Number(envVars.BCRYPT_SALT_ROUND))
    }

    if(payload.phone){
        const phoneRegex = /^01[0-9]{9}$/;
        if(!phoneRegex.test(payload.phone)){
            throw new AppError(httpStatus.BAD_REQUEST, 'Invalid phone number format')
        }
    }

    const newUpdateduser = await User.findByIdAndUpdate(userId, payload, {new: true, runValidators: true})

    return newUpdateduser
}

export const UserServices = {
    createUser,
    updateUser,
    getMyProfile
}