import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { adminControllers } from "./admin.controller";



const router = Router()

router.get("/users", checkAuth("ADMIN"), adminControllers.getAllUsers)

router.get("/agents", checkAuth("ADMIN"), adminControllers.getAllAgents)

router.get("/wallets", checkAuth("ADMIN"), adminControllers.getAllWallets)

router.get("/transactions", checkAuth("ADMIN"), adminControllers.getAllTransactions)


export const AdminRouter =  router