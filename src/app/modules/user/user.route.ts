import { Router } from "express";
import { getLoggedInUser, UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { auth } from "../../middlewares/auth.middleware";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";




const router = Router()

router.get('/me', auth, getLoggedInUser);

router.post("/register",validateRequest(createUserZodSchema),UserControllers.createUser)

router.patch('/update', checkAuth(...Object.values(Role)) ,UserControllers.updateUser);


export const UserRoutes = router