import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletControllers } from "./wallet.controller";





const router = Router()

router.get("/me", checkAuth(...Object.values(Role)), WalletControllers.getMyWallet)

export const WalletRoutes = router