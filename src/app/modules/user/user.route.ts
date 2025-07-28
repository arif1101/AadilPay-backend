import { Router } from "express";
import { getLoggedInUser, UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { auth } from "../../middlewares/auth.middleware";




const router = Router()

router.get('/me', auth, getLoggedInUser);

router.post("/register",validateRequest(createUserZodSchema),UserControllers.createUser)

export const UserRoutes = router