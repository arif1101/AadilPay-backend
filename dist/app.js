"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const routes_1 = require("./app/routes");
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.set("trust proxy", 1);
// app.use(cors({
//     origin: "http://localhost:5173",
//     credentials: true
// }))
app.use((0, cors_1.default)({
    origin: "https://aadil-pay-client.vercel.app",
    credentials: true
}));
app.use("/api", routes_1.router);
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Digital payment system"
    });
});
app.use(globalErrorHandler_1.globalErrorHandler);
app.use(notFound_1.default);
exports.default = app;
