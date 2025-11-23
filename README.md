# StockMaster - Inventory Management System
A comprehensive modular inventory management system with OTP-based authentication, designed for inventory managers and warehouse staff.

---

- **Reviewer:** [Aman Patel(ampa)](https://github.com/ampa-odoo)

### Team Members
- **Leader:** [Purvanshu Machhi](https://github.com/Puru1375)
- **Member:** [Tejas Panchal](https://github.com/Tejas-Panchal)
- **Member:** [Dhyeya Dawawala](https://github.com/Dhyeya-Dawawala)
- **Member:** [Dev Jagtap](https://github.com/jagtapdev55-afk)

---

## Features

- 🔐 **Secure OTP Authentication** - Two-factor authentication via email
- 📊 **Real-time Dashboard** - Track KPIs, stock levels, and operations
- 📦 **Product Management** - Full CRUD operations for inventory items
- 🚛 **Operations Module**
  - Receipts (Stock In from vendors)
  - Deliveries (Stock Out to customers)
  - Internal Transfers (Move between warehouses)
  - Inventory Adjustments (Stock corrections)
- 🔍 **Dynamic Filtering** - Filter by status, search by reference/product
- 🏢 **Multi-Warehouse Support** - Track stock across multiple locations
- 👤 **User Profiles** - Manage user details and settings

## Tech Stack

### Backend

- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Nodemailer (Email OTP)
- bcryptjs (Password hashing)

### Frontend

- React 18
- React Router v6
- Axios
- Tailwind CSS
- React Icons

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Gmail account (for OTP emails)

## Installation

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
MONGO_URI=mongodb://localhost:27017/stockmaster
PORT=5000
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Important:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

Run database seeding (optional):

```bash
node index.js
```

Start backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
```

Start frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Authentication Flow

1. **Register** - Navigate to `/signup` and create an account
2. **Login** - Enter email and password
3. **OTP Verification** - Check your email (or backend console) for the 6-digit OTP
4. **Dashboard** - After successful OTP verification, access the dashboard

> **Development Tip:** OTP is logged to the backend console for easy testing

### Main Features

#### Products

- Create, view, edit, and delete products
- Track SKU, name, category, and total stock

#### Operations

**Receipts (Stock In)**

- Create receipt orders from vendors
- Validate to increase stock levels
- Filter by status (Draft/Done) and search

**Deliveries (Stock Out)**

- Create delivery orders to customers
- Validate to decrease stock levels
- Filter and search functionality

**Internal Transfers**

- Move stock between warehouses/locations
- Track source and destination

**Inventory Adjustments**

- Correct stock discrepancies
- Support positive (gain) and negative (loss) adjustments

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and send OTP
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Products

- `GET /api/products` - List all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Stock Moves

- `GET /api/moves?type=receipt` - Get receipts
- `GET /api/moves?type=delivery` - Get deliveries
- `GET /api/moves?type=internal` - Get internal transfers
- `GET /api/moves?type=adjustment` - Get adjustments
- `POST /api/moves` - Create stock move
- `PUT /api/moves/:id/validate` - Validate move (update stock)

### Locations

- `GET /api/locations` - List all warehouses/locations

### Dashboard

- `GET /api/dashboard` - Get dashboard KPIs

### User Profile

- `GET /api/user/profile` - Get user details
- `PUT /api/user/profile` - Update user profile

## Project Structure

```
stockmaster/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Location.js
│   │   └── StockMove.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── locationRoutes.js
│   │   ├── moveRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── index.js
│   └── seed.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Products.jsx
    │   │   ├── Receipts.jsx
    │   │   ├── Deliveries.jsx
    │   │   ├── InternalTransfers.jsx
    │   │   ├── InventoryAdjustments.jsx
    │   │   ├── Profile.jsx
    │   │   └── Settings.jsx
    │   ├── App.jsx
    │   └── api.js
    └── package.json
```

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ OTP verification (10-minute expiry)
- ✅ Protected routes (frontend & backend)
- ✅ Secure logout with state cleanup

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues or questions, please open an issue on GitHub.

---

**Built for hackathons and production use** 🚀



