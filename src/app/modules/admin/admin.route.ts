import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { adminControllers } from "./admin.controller";
import { Role } from "../user/user.interface";
import { WalletControllers } from "../wallet/wallet.controller";



const router = Router()

router.get("/users", checkAuth("ADMIN"), adminControllers.getAllUsers)

router.get("/agents", checkAuth("ADMIN"), adminControllers.getAllAgents)

router.get("/wallets", checkAuth("ADMIN"), adminControllers.getAllWallets)

router.get("/transactions", checkAuth("ADMIN"), adminControllers.getAllTransactions)

router.patch("/wallet/active/:id", checkAuth(Role.ADMIN), WalletControllers.activeWallet)




export const AdminRouter =  router