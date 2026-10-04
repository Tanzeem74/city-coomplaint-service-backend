# City Complaint & Service Request Platform — Backend API

A backend-focused smart-city service platform where citizens can submit city complaints/service requests, administrators can manage users, departments, categories and assignments, and staff can process assigned complaints through a controlled status workflow.

This project was developed for **Programming Hero Level 2 — B7A6 Backend Assignment**.

## Project Overview

The platform provides a RESTful API for managing city complaints and public service requests. It uses three fixed roles:

- **CITIZEN** — creates and tracks complaints, manages own profile, completes service payments, and closes/cancels eligible complaints.
- **STAFF** — views assigned complaints and updates their progress.
- **ADMIN** — manages users, departments, categories, complaint assignments, payments, audit logs, and dashboard statistics.

The API follows versioned routes under `/api/v1`.

## Key Features

- Email/password authentication
- Google/GCP social login
- JWT access and refresh token flow
- Role-based authorization for `CITIZEN`, `STAFF`, and `ADMIN`
- Citizen profile management
- Admin user management and soft delete
- Department and category management
- Complaint creation and tracking
- Complaint assignment to staff
- Controlled complaint status workflow
- Search, filtering, sorting, and pagination
- PostgreSQL database with Prisma ORM
- Prisma relationships, indexes, and transactions
- Stripe Checkout payment integration
- Payment verification, cancellation, and history
- Audit/activity logs for payment-related critical actions
- Admin dashboard statistics
- Zod request validation
- Centralized error handling
- Helmet security headers
- CORS configuration
- API rate limiting
- Admin seed script
- Postman API collection

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Validation | Zod |
| Authentication | JWT, bcrypt |
| Social Login | Google Auth |
| Payment | Stripe Checkout |
| Security | Helmet, CORS, express-rate-limit |
| API Testing / Documentation | Postman |

## Project Structure

```text
city-complaint-service-backend/
├── prisma/
│   ├── migrations/
│   ├── schema/
│   │   ├── schema.prisma
│   │   ├── enums.prisma
│   │   ├── user.prisma
│   │   ├── department.prisma
│   │   ├── category.prisma
│   │   ├── complaint.prisma
│   │   ├── assignment.prisma
│   │   ├── complaintUpdate.prisma
│   │   ├── attachment.prisma
│   │   ├── payment.prisma
│   │   └── auditLog.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── config/
│   │   ├── errors/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── Department/
│   │   │   ├── Category/
│   │   │   ├── Complaint/
│   │   │   ├── Payment/
│   │   │   ├── Dashboard/
│   │   │   └── AuditLog/
│   │   └── utils/
│   ├── generated/
│   ├── types/
│   ├── app.ts
│   └── server.ts
├── .env.example
├── package.json
├── prisma7.config.ts
└── tsconfig.json
```

## Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_BACKEND_GITHUB_REPOSITORY_URL>
cd city-complaint-service-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000
DATABASE_URL="YOUR_POSTGRESQL_DATABASE_URL"

JWT_ACCESS_SECRET="YOUR_ACCESS_TOKEN_SECRET"
JWT_ACCESS_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="YOUR_REFRESH_TOKEN_SECRET"
JWT_REFRESH_EXPIRES_IN="30d"

BCRYPT_SALT_ROUNDS=12

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"

FRONTEND_URL="http://localhost:3000"

STRIPE_SECRET_KEY="YOUR_STRIPE_SECRET_KEY"
PAYMENT_SUCCESS_URL="http://localhost:3000/payment/success"
PAYMENT_CANCEL_URL="http://localhost:3000/payment/cancel"

ADMIN_EMAIL="admin@cityservice.com"
ADMIN_PASSWORD="Admin12345"
```

> Never commit the real `.env` file or production secrets to GitHub.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

For production deployment, use the appropriate Prisma production migration command for your hosting environment.

### 6. Seed the admin account

```bash
npm run seed
```

### 7. Start development server

```bash
npm run dev
```

Local API:

```text
http://localhost:5000
```

Health/root endpoint:

```http
GET /
```

## Authentication

Protected endpoints use Bearer token authentication.

```http
Authorization: Bearer <ACCESS_TOKEN>
```

The backend also supports refresh-token handling and Google login.

### Roles

| Role | Main Permissions |
| --- | --- |
| CITIZEN | Own profile, create/view own complaints, eligible complaint status actions, payments |
| STAFF | Own profile, view assigned complaints, update assigned complaint workflow |
| ADMIN | User management, departments, categories, assignments, dashboard, payments, audit logs |

## Complaint Workflow

The complaint statuses are:

```text
SUBMITTED
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
CLOSED
```

Additional terminal/alternative statuses:

```text
REJECTED
CANCELLED
```

Implemented workflow rules include:

- New citizen complaints start as `SUBMITTED`.
- Admin can assign an eligible complaint to an active staff member.
- Assignment changes the complaint to `ASSIGNED`.
- Assigned staff can move `ASSIGNED → IN_PROGRESS`.
- Assigned staff can move `IN_PROGRESS → RESOLVED`.
- Citizen can close a `RESOLVED` complaint.
- Citizen can cancel an eligible `SUBMITTED` complaint.
- Complaint status changes are stored in complaint update history.

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Public | Register citizen |
| POST | `/api/v1/auth/login` | Public | Email/password login |
| GET | `/api/v1/auth/me` | Authenticated | Get authenticated user |
| POST | `/api/v1/auth/refresh-token` | Public/Cookie | Refresh access token |
| POST | `/api/v1/auth/logout` | Public | Clear refresh cookie |
| POST | `/api/v1/auth/google` | Public | Google login |

### Users

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/users/me` | Authenticated | Get own profile |
| PATCH | `/api/v1/users/me` | Authenticated | Update own profile |
| GET | `/api/v1/users` | ADMIN | List/search users |
| PATCH | `/api/v1/users/:id` | ADMIN | Update user role/status |
| DELETE | `/api/v1/users/:id` | ADMIN | Soft-delete user |

### Departments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/departments` | ADMIN | Create department |
| GET | `/api/v1/departments` | Authenticated | List departments |
| GET | `/api/v1/departments/:id` | Authenticated | Get department |
| PATCH | `/api/v1/departments/:id` | ADMIN | Update department |
| DELETE | `/api/v1/departments/:id` | ADMIN | Soft-delete department |

### Categories

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/categories` | ADMIN | Create category |
| GET | `/api/v1/categories` | Authenticated | List categories |
| GET | `/api/v1/categories/:id` | Authenticated | Get category |
| PATCH | `/api/v1/categories/:id` | ADMIN | Update category |
| DELETE | `/api/v1/categories/:id` | ADMIN | Soft-delete category |

### Complaints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/complaints` | CITIZEN | Create complaint |
| GET | `/api/v1/complaints/my` | CITIZEN | Get own complaints |
| GET | `/api/v1/complaints/my/:id` | CITIZEN | Get own complaint details |
| PATCH | `/api/v1/complaints/my/:id/status` | CITIZEN | Close/cancel eligible complaint |
| GET | `/api/v1/complaints/manage/all` | ADMIN, STAFF | List complaints with advanced querying |
| PATCH | `/api/v1/complaints/:id/assign` | ADMIN | Assign complaint to staff |
| GET | `/api/v1/complaints/staff/assigned` | STAFF | Get assigned complaints |
| PATCH | `/api/v1/complaints/:id/status` | STAFF | Update assigned complaint status |

Supported complaint list capabilities include pagination, search, filtering, and sorting where implemented.

Example:

```http
GET /api/v1/complaints/manage/all?page=1&limit=10&searchTerm=road&status=SUBMITTED&sortBy=createdAt&sortOrder=desc
```

### Payments

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/payments/create` | CITIZEN | Create Stripe Checkout payment |
| GET | `/api/v1/payments/verify?sessionId=...` | CITIZEN | Verify Stripe payment |
| GET | `/api/v1/payments/my` | CITIZEN | Get own payment history |
| PATCH | `/api/v1/payments/:id/cancel` | CITIZEN | Cancel eligible pending payment |
| GET | `/api/v1/payments/admin/all` | ADMIN | Get all payments |

The current service fee is configured in the payment service. Stripe Checkout is used for real payment processing.

### Dashboard

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/dashboard/admin` | ADMIN | Admin statistics/dashboard data |

### Audit Logs

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/audit-logs` | ADMIN | Get audit/activity logs |

Audit log listing supports query options such as pagination and applicable filters. Critical payment activities such as payment creation, success, and cancellation are recorded.

## API Response Format

Successful API responses follow a structured format similar to:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Errors are handled centrally and returned in a consistent structured form.

```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```

## Stripe Payment Flow

1. Citizen creates a complaint.
2. Citizen calls the payment creation endpoint with the complaint ID.
3. Backend creates a local `PENDING` payment record.
4. Backend creates a Stripe Checkout Session.
5. Client redirects the citizen to the returned Stripe Checkout URL.
6. After successful checkout, the client receives the Stripe session ID.
7. Client calls the payment verification endpoint.
8. Backend verifies the session directly with Stripe.
9. Local payment status is updated to `PAID`.
10. Relevant payment activity is recorded in the audit log.

Stripe test card commonly used during development:

```text
4242 4242 4242 4242
```

Use any valid future expiry date and test CVC in Stripe test mode.

## Database Design

Main entities:

- `User`
- `Department`
- `Category`
- `Complaint`
- `ComplaintAssignment`
- `ComplaintUpdate`
- `Attachment`
- `Payment`
- `AuditLog`

Important relationships include:

- A citizen can create multiple complaints.
- A department contains categories and receives complaints.
- A complaint belongs to one citizen, department, and category.
- Complaints can have assignment and status-update histories.
- Users can have complaint assignment/update relationships according to their roles.
- Payments belong to both a user and a complaint.
- Audit logs can reference the user responsible for an activity.

Indexes are used on commonly queried relation/status fields, and transactions are used for multi-step complaint operations.

## Security

The API includes:

- bcrypt password hashing
- JWT authentication
- Role-based authorization middleware
- User account status checks
- Zod validation
- Helmet security headers
- CORS configuration
- API rate limiting
- Environment-based secrets
- Soft deletion for managed resources
- Centralized application error handling

## Postman Documentation

A Postman collection is included/submitted separately:

```text
City_Complaint_Service_API.postman_collection.json
```

It contains organized folders for:

- Authentication
- Users
- Departments
- Categories
- Complaints
- Payments
- Dashboard
- Audit Logs

Set the collection `baseUrl` variable to the local or deployed backend URL before testing.

## Demo Admin Credentials

```text
Email: admin@cityservice.com
Password: Admin12345
```

> If deployment uses different `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables, update this section before final submission.

## Deployment

**Live API URL:** `<ADD_DEPLOYED_BACKEND_URL>`

After deployment:

1. Replace the placeholder above with the live API URL.
2. Update Postman `baseUrl`.
3. Configure the deployed frontend URL in `FRONTEND_URL`.
4. Set Stripe success/cancel URLs to the deployed frontend routes.
5. Verify all required environment variables on the hosting provider.
6. Run production database migrations and admin seed as required.

## API Walkthrough Video

**Video URL:** `<ADD_5_TO_10_MINUTE_WALKTHROUGH_VIDEO_URL>`

Recommended walkthrough order:

1. Project/API overview
2. Register/login and role authorization
3. Department/category management
4. Citizen complaint creation
5. Admin staff assignment
6. Staff complaint status workflow
7. Search/filter/pagination
8. Stripe payment and verification
9. Admin dashboard
10. Audit logs and database overview

## Assignment Requirement Coverage

| Requirement | Implementation |
| --- | --- |
| PostgreSQL + Prisma | Implemented |
| 3 fixed roles | `CITIZEN`, `STAFF`, `ADMIN` |
| Email/password authentication | Implemented |
| Google social login | Implemented |
| Bearer-token protected routes | Implemented |
| Role-based authorization | Implemented |
| 20+ meaningful APIs | Implemented |
| Validation | Zod |
| Search/filter/sort/pagination | Implemented on relevant list APIs |
| Soft delete | Implemented |
| Transactions | Used for multi-step complaint operations |
| Payment integration | Stripe Checkout |
| Payment status tracking | Implemented |
| Audit/activity tracking | Implemented for critical payment activity |
| Rate limiting | Implemented |
| Security headers | Helmet |
| CORS | Configured |
| Postman documentation | Collection prepared |
| Admin credentials | Seeded demo admin |
| Deployment | `<ADD BEFORE SUBMISSION>` |
| Walkthrough video | `<ADD BEFORE SUBMISSION>` |

## Scripts

Common project commands:

```bash
npm run dev
npm run build
npm start
npm run seed
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

## Notes Before Final Submission

Update these placeholders before submitting:

- `<YOUR_BACKEND_GITHUB_REPOSITORY_URL>`
- `<ADD_DEPLOYED_BACKEND_URL>`
- `<ADD_5_TO_10_MINUTE_WALKTHROUGH_VIDEO_URL>`
- Demo admin credentials if changed for deployment
- Frontend URL / Stripe redirect URLs after frontend deployment

Also confirm that:

- `.env` is not committed.
- `.env.example` contains variable names but no real secrets.
- The Postman collection uses the deployed API URL.
- At least 20 meaningful backend Git commits are present.
- The deployed API and Stripe test flow work.
- The final walkthrough video demonstrates the major role-based workflows.

## Author

**Shah Tanzeem Afsar**  
Computer Science & Engineering  
Leading University, Sylhet

---

This README documents the current backend implementation and can be updated with final deployment, repository, and video links before submission.
