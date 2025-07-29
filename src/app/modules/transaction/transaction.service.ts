import { Transaction } from "./transaction.model"



const MyTransaction = async(userId: string) => {
    const transaction = await Transaction.find({
        $or: [
            {sender: userId},
            {receiver: userId},
            {user: userId}
        ]
    }).sort({createdAt: -1})

    return transaction
}

export const TransactionServices = {
    MyTransaction
}