import { model, Schema } from "mongoose";
import { IUser, Role, UserStatus } from "./user.interface";




const userSchema = new Schema<IUser>({
    name: {type: String, required:true},
    email:{type: String},
    phone: {type: String, required: true},
    password: {type: String, required: true},
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    walletId: {type: Schema.Types.ObjectId, ref: "Wallet"},
    isApproved: {type: Boolean, default: false},
    commissionRate: {type: Number, default: 0},
    status: {
        type: String, 
        enum: Object.values(UserStatus), default: UserStatus.ACTIVE
    },

},{
    timestamps: true,
    versionKey: false
})

export const User = model<IUser>("User", userSchema)