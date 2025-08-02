# 💼 AadilPay — Digital Wallet System

## 🧭 Project Overview

AadilPay is a digital wallet system where users, agents, and admins interact to manage wallets, perform transactions, and enforce business rules like agent commissions and wallet blocking.

---

## 🚀 Features

- 🔐 JWT-based authentication and role-based access control
- 👤 User profile and wallet management
- 💸 Instant money transfer between users
- 🧑‍🔧 Agent cash-in/cash-out handling
- 💼 Admin control panel (wallet blocking, agent approval)
- 📊 Transaction and commission tracking (coming....)

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcryptjs
- **Validation:** Zod
- **Utilities:** dotenv, cookie-parser
- **Dev Tools:** ESLint, TypeScript, Postman, vsCode


---

## 📦 Installation & Setup

```bash
# Initialize project
npm init -y

# Install core dependencies
npm install express mongoose zod jsonwebtoken cors dotenv
npm install http-status-codes bcryptjs cookie-parser

# Install development type definitions
npm install -D typescript
npm install -D @types/cors @types/dotenv @types/jsonwebtoken @types/bcryptjs @types/cookie-parser

# Initialize TypeScript
tsc --init
```

> ✅ Make sure to configure `tsconfig.json` with:
```json
{
  "rootDir": "./src",
  "outDir": "./dist"
}
```

---

## 🧹 ESLint Setup (TypeScript)

```bash
npm install --save-dev eslint @eslint/js typescript typescript-eslint
```

Create `eslint.config.mjs`:

```js
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
    }
  }
);
```

Run lint check:
```bash
npx eslint .
```

---

## 📁 Folder Structure (Recommended)

```
src/
│
├── app/
│   ├── config/           # Application configuration (DB, env, etc.)
│   ├── errorHelpers/     # Custom error handling utilities
│   ├── interfaces/       # TypeScript interfaces and types
│   ├── middlewares/      # Express middleware (auth, error handlers, etc.)
│   ├── modules/          # All domain-specific logic divided by features
│   │   ├── admin/        # Admin-specific controllers, services, routes
│   │   ├── agent/        # Agent role-related logic (e.g., cash-in/out)
│   │   ├── auth/         # Authentication logic (login, signup)
│   │   ├── transaction/  # Transaction-related services and routes
│   │   ├── user/         # End user-related logic
│   │   └── wallet/       # Wallet operations (balance, credit, debit)
│   ├── routes/           # Route entry point for the whole app
│   │   └── index.ts      # Combines all module routes
│   └── utils/            # Utility functions/helpers
│
├── app.ts                # Express app configuration (middlewares, routes)
├── server.ts             # Server entry point (listens to port)
│
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── eslint.config.mjs     # ESLint configuration
├── package.json          # Project metadata and scripts
├── package-lock.json     # Dependency lock file
└── README.md             # You are here 📘

```

---
# 🌐 Environment Variables
Create a .env file in the root directory and add the following variables:

env Copy Edit PORT=5000

DB_URL=mongodb+srv://(name):(password)@cluster0.hvsn9.mongodb.net/AadilPay?retryWrites=true&w=majority&appName=AadilPay
NODE_ENV=development

# JWT
JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=4d

# BCRYPT
BCRYPT_SALT_ROUND=10

# SUPER ADMIN 
ADMIN_EMAIL=super@gmail.com

ADMIN_PASSWORD=11112222

⚠️ Important: Do not share .env file in production. Keep your secrets secure.
---

## 🔐 Authentication & Authorization

- JWT token-based auth
- Roles: `USER`, `AGENT`, `ADMIN`
- Middleware: `checkAuth`, `restrictToRole`

---

## 🔄 Business Logic Implemented

| Role     | Action                                   | Route Example                            |
|----------|------------------------------------------|------------------------------------------|
| **User** | View/update profile                      | `GET /api/users/me`                      |
|          | Send money to user                       | `POST /api/wallets/transfer`             |
|          | Top-up own wallet                        | `POST /api/wallets/top-up`               |
|          | View wallet/transaction history          | `GET /api/wallets/me`                    |
| **Agent**| Cash-in/cash-out for user                | `POST /api/agents/cash-in`               |
|          | View agent's commission history          | `GET /api/agents/commission-history`     |
| **Admin**| Block/unblock wallet                     | `PATCH /api/admin/wallets/block/:id`     |
|          | Approve/suspend agent                    | `PATCH /api/admin/agents/approve/:id`    |
|          | Set global transaction fee               | `PATCH /api/admin/system/fees`           |

---

## 🧪 Testing Instructions

Use **Postman** or **Thunder Client**:

1. Register/Login
2. Save the access token
3. Attach token in headers: `Authorization: Bearer <token>`
4. Test protected routes based on roles

---



## 📡 API Endpoints

| **Role**   | **Action**                     | **Method** | **Route**                             |
| ---------- | ------------------------------ | ---------- | ------------------------------------- |
| **Public** | Register new user              | `POST`     | `/api/user/register`                  |
|            | Login                          | `POST`     | `/api/auth/login`                     |
| **User**   | View profile                   | `GET`      | `/api/user/me`                        |
|            | Update profile                 | `PATCH`    | `/api/user/update`                    |
|            | View wallet info               | `GET`      | `/api/wallet/me`                      |
|            | View transaction history       | `GET`      | `/api/transaction/me`                 |
|            | Transfer money to another user | `POST`     | `/api/wallet/transfer`                |
|            | Top-up own wallet              | `POST`     | `/api/wallet/top-up`                  |
|            | Withdraw from own wallet       | `POST`     | `/api/wallet/withdraw`                |
| **Agent**  | Cash-in to a user's wallet     | `POST`     | `/api/agents/cash-in`                 |
|            | Cash-out from a user's wallet  | `POST`     | `/api/agents/cash-out`                |
|            | View agent's transactions      | `GET`      | `/api/agents/transactions`            |
| **Admin**  | View all transactions          | `GET`      | `/api/admin/transactions`             |
|            | Block a user wallet            | `PATCH`    | `/api/admin/wallet/block/:walletId`   |
|            | Unblock a user wallet          | `PATCH`    | `/api/admin/wallet/active/:walletId`  |
|            | Suspend an agent               | `PATCH`    | `/api/admin/agents/suspend/:agentId`  |
|            | Approve an agent               | `PATCH`    | `/api/admin/agents/approved/:agentId` |

---

## 🛡️ Admin Access
The admin account is auto-generated when the server starts, using credentials from the .env file (PHONE, ADMIN_PASSWORD, ADMIN_EMAIL).

To access admin-only routes, follow these steps:
- Log in using the admin credentials (phone, password) to receive a JWT token
- Include this token in the Authorization header (as Bearer <token>) when making requests to admin routes

With this token, admins can:
- Approve or suspend agents
- Block or unblock user wallets
- View all transactions
- Set global transaction fees

## 🧑‍💼 User Access
Users can register and log in using their phone number and password. Upon successful login, they will receive a JWT token.
This token must be included in the Authorization header (as Bearer <token>) for accessing protected user routes such as:
- Viewing and updating profile
- Sending money to other users
- Viewing wallet balance and transaction history
- Topping up their own wallet

## 🧑‍🔧 Agent Access
Agents must first register and wait for admin approval. Once approved, agents can log in with their credentials (phone and password).
After login, they will receive a JWT token. This token must be used in the Authorization header for accessing agent-specific routes like:
- Performing cash-in and cash-out transactions for users
- Viewing their own commission transaction history

---
## 📝 Notes

- Admin account is auto-created on project start.
- If you're checking the project: login as admin using the default seeded account or setup credentials in `.env`.


📜 License & Contribution
---
🔖 License
This project is licensed under the MIT License — see the LICENSE file for details.

🤝 Contributing
Contributions are welcome! To contribute:
- Fork the repository
- Create a new branch (git checkout -b feature/your-feature-name)
- Commit your changes (git commit -m 'Add new feature')
- Push to the branch (git push origin feature/your-feature-name)
- Open a pull request

## 👨‍💻 Author
Arif Rahman
Full Stack Developer — LinkedIn
GitHub: @arif1101