import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { agentCashOut, AgentControllers } from "./agent.controller";



const router = Router()


router.post("/cash-in", checkAuth("AGENT"),AgentControllers.agentCashIn)
router.post("/cash-out", checkAuth("AGENT"), agentCashOut);
export const AgentRoutes = router