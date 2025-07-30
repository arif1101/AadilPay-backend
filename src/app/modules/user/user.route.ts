import { Router } from "express";
import { UserControllers } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";




const router = Router()

router.get('/me', checkAuth(...Object.values(Role)),UserControllers.getMyProfile);

router.post("/register",validateRequest(createUserZodSchema),UserControllers.createUser)

router.patch('/update', checkAuth(...Object.values(Role)) ,UserControllers.updateUser);


export const UserRoutes = router