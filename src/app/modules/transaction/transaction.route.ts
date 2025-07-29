import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { TransactionControllers } from "./transaction.controller";



const router = Router()

router.get("/me", checkAuth(...Object.values(Role)), TransactionControllers.MyTransaction)


export const TransactionRoutes = router