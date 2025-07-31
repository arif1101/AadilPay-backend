"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const wallet_interface_1 = require("./wallet.interface");
const walletSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", // assuming single User model with role
        required: true,
        unique: true, // one wallet per user/agent
    },
    balance: {
        type: Number,
        required: true,
        default: 50,
        min: 0,
    },
    status: {
        type: String,
        enum: Object.values(wallet_interface_1.WalletStatus),
        default: wallet_interface_1.WalletStatus.ACTIVE
    },
}, {
    timestamps: true,
});
exports.Wallet = (0, mongoose_1.model)("Wallet", walletSchema);
