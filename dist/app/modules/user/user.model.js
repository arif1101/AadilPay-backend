"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.USER
    },
    walletId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Wallet" },
    accountStatus: { type: String, enum: Object.values(user_interface_1.AccountStatus), default: user_interface_1.AccountStatus.APPROVED },
    commissionRate: { type: Number, default: 0 },
    status: {
        type: String,
        enum: Object.values(user_interface_1.UserStatus), default: user_interface_1.UserStatus.ACTIVE
    },
}, {
    timestamps: true,
    versionKey: false
});
exports.User = (0, mongoose_1.model)("User", userSchema);
