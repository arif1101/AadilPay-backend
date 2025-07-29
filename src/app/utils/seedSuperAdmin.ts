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
console.log("-----------")
        const hashedPasssword = await bcryptjs.hash(envVars.ADMIN_PASSWORD,Number(envVars.BCRYPT_SALT_ROUND))
console.log("-----------")//not print get Error: Illegal arguments: undefined, number
        const payload : IUser ={
            name: "Aadil-controller",
            role: Role.ADMIN,
            email: envVars.ADMIN_EMAIL,
            password: hashedPasssword,
            phone: "01402667768"
        }

        const Admin = await User.create(payload)
        console.log("Admin create successfull ! \n")
        console.log(Admin)
        
    }catch(error){
        console.log(error)
    }
}