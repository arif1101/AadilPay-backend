"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserZodSchema = void 0;
const zod_1 = require("zod");
const user_interface_1 = require("./user.interface");
exports.createUserZodSchema = zod_1.z.object({
    name: zod_1.z
        .string({ error: "Name must be a string." })
        .min(2, { message: "Name must be at least 2 characters long." })
        .max(50, { message: "Name cannot exceed 50 characters." }),
    email: zod_1.z
        .string({ error: "Email must be a string." })
        .email({ message: "Invalid email address format." })
        .min(5, { message: "Email must be at least 5 characters long." })
        .max(100, { message: "Email cannot exceed 100 characters." })
        .optional(),
    password: zod_1.z
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
    phone: zod_1.z
        .string({ error: "Phone number must be a string." })
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
        message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    }),
    address: zod_1.z
        .string({ error: "Address must be a string." })
        .max(200, { message: "Address cannot exceed 200 characters." })
        .optional(),
    role: zod_1.z
        .enum([user_interface_1.Role.USER, user_interface_1.Role.AGENT, user_interface_1.Role.ADMIN], "Roll will be USER or AGENT")
        .default(user_interface_1.Role.USER),
    status: zod_1.z
        .enum([user_interface_1.UserStatus.ACTIVE, user_interface_1.UserStatus.BLOCKED])
        .default(user_interface_1.UserStatus.ACTIVE),
    accountStatus: zod_1.z
        .enum([user_interface_1.AccountStatus.APPROVED, user_interface_1.AccountStatus.SUSPENDED])
        .default(user_interface_1.AccountStatus.APPROVED),
    commissionRate: zod_1.z
        .number()
        .min(0)
        .default(0),
});
