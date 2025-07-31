"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const wallet_route_1 = require("../modules/wallet/wallet.route");
const transaction_route_1 = require("../modules/transaction/transaction.route");
const agent_route_1 = require("../modules/agent/agent.route");
const admin_route_1 = require("../modules/admin/admin.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/wallet",
        route: wallet_route_1.WalletRoutes
    },
    {
        path: "/transaction",
        route: transaction_route_1.TransactionRoutes
    },
    {
        path: "/agents",
        route: agent_route_1.AgentRoutes
    },
    {
        path: "/admin",
        route: admin_route_1.AdminRouter
    }
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
