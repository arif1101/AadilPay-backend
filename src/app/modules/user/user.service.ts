import bcryptjs from "bcryptjs"
import AppError from "../../errorHelpers/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes"
import { envVars } from "../../config/env";



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

export const UserServices = {
    createUser
}