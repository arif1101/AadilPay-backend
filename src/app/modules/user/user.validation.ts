import { z } from "zod";
import { Role, UserStatus } from "./user.interface";

export const createUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be a string." })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    .string({ error: "Email must be a string." })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .optional(),

  password: z
    .string({ error: "Password must be a string." })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/(?=.*[A-Z])/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least one special character.",
    })
    .regex(/(?=.*\d)/, {
      message: "Password must contain at least one number.",
    }),

  phone: z
    .string({ error: "Phone number must be a string." })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),

  address: z
    .string({ error: "Address must be a string." })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),

  role: z
    .enum([Role.USER, Role.AGENT, Role.ADMIN])
    .default(Role.USER),

  status: z
    .enum([UserStatus.ACTIVE, UserStatus.BLOCKED])
    .default(UserStatus.ACTIVE),

  isApproved: z
    .boolean()
    .default(false),

  commissionRate: z
    .number()
    .min(0)
    .default(0),
});
