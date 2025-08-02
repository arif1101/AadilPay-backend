import { envVars } from "../config/env"
import { IUser, Role } from "../modules/user/user.interface"
import { User } from "../modules/user/user.model"
import bcryptjs from "bcryptjs"


export const seedSuperAdmin = async() => {
    try{
        const isSuperAdminExist = await User.findOne({email: envVars.ADMIN_EMAIL})
        if(isSuperAdminExist){
            console.log("Super admin already exist")
            return
        }
        const hashedPasssword = await bcryptjs.hash(envVars.ADMIN_PASSWORD,Number(envVars.BCRYPT_SALT_ROUND))
        const payload : IUser ={
            name: "Aadil-controller",
            role: Role.ADMIN,
            email: envVars.ADMIN_EMAIL,
            password: hashedPasssword,
            phone: envVars.PHONE
        }

        const Admin = await User.create(payload)
        console.log("Admin create successfull ! \n")
        console.log(Admin)
        
    }catch(error){
        console.log(error)
    }
}