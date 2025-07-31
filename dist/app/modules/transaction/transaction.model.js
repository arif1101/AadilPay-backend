"use strict";
// src/modules/transaction/transaction.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transaction_constant_1 = require("./transaction.constant");
const transactionSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: transaction_constant_1.TransactionTypes,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    status: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionStatus),
        default: transaction_interface_1.TransactionStatus.SUCCESS
    }
}, {
    versionKey: false,
    timestamps: true
});
exports.Transaction = (0, mongoose_1.model)('Transaction', transactionSchema);
