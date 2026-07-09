# FlowCore Backend

Enterprise Workflow Management System Backend

## Tech Stack

- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- JWT Authentication with Refresh Tokens
- Socket.IO for real-time notifications
- Nodemailer for emails
- Cloudinary for file uploads
- PDFKit + ExcelJS for reports

## Installation

```bash
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

## API Documentation

### Auth
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh-token
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/verify-email/:token
- POST /api/auth/change-password

### Employees
- GET /api/employees
- POST /api/employees
- GET /api/employees/:id
- PUT /api/employees/:id
- DELETE /api/employees/:id
- POST /api/employees/:id/photo
- GET /api/employees/:id/attendance
- GET /api/employees/:id/performance

### Departments
- GET /api/departments
- POST /api/departments
- GET /api/departments/:id
- PUT /api/departments/:id
- DELETE /api/departments/:id

### Production Orders
- GET /api/production-orders
- POST /api/production-orders
- GET /api/production-orders/:id
- PUT /api/production-orders/:id
- DELETE /api/production-orders/:id
- PUT /api/production-orders/:id/workflow

### Inventory
- GET /api/inventory
- POST /api/inventory
- GET /api/inventory/:id
- PUT /api/inventory/:id
- POST /api/inventory/stock-in
- POST /api/inventory/stock-out

### Reports
- GET /api/reports/production
- GET /api/reports/employees
- GET /api/reports/inventory
- GET /api/reports/export/pdf
- GET /api/reports/export/excel

## License

MIT
