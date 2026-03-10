"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTypes = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["TOP_UP"] = "TOP_UP";
    TransactionType["WITHDRAW"] = "WITHDRAW";
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["CASH_IN"] = "CASH_IN";
    TransactionType["CASH_OUT"] = "CASH_OUT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
exports.TransactionTypes = Object.values(TransactionType);
