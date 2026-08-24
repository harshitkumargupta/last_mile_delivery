# Last-Mile Delivery Tracker

## Full-Stack Delivery Management & Tracking Platform

Last-Mile Delivery Tracker is a full-stack web application for managing
the complete last-mile delivery workflow between **customers, delivery
agents, and administrators**.

The system provides secure authentication, customer order creation,
automatic/manual delivery assignment, delivery tracking, pricing and
delivery configuration, notifications, email updates, agent
availability, rescheduling, and role-based dashboards.

------------------------------------------------------------------------

# 1. Project Overview

The application follows this general flow:

``` text
                    LAST-MILE DELIVERY TRACKER
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          CUSTOMER       DELIVERY AGENT      ADMIN
              │               │               │
              ▼               ▼               ▼
         Create Order    Assigned Orders   Manage System
              │               │               │
              └───────────────┼───────────────┘
                              │
                              ▼
                         SPRING BOOT API
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                 JWT        Services     JPA
                  │           │           │
                  └───────────┼───────────┘
                              │
                              ▼
                            MySQL
                              │
                  ┌───────────┴───────────┐
                  │                       │
             Notifications             Email
```

------------------------------------------------------------------------

# 2. Main Features

## Customer Features

-   Customer registration
-   Customer login
-   JWT authentication
-   Customer dashboard
-   Create delivery order
-   View own orders
-   View order details
-   Track delivery
-   View tracking history
-   View order history
-   View profile
-   Receive application notifications
-   Receive email notifications
-   View delivery status
-   Refresh order information

## Delivery Agent Features

-   Delivery-agent login
-   JWT authentication
-   Delivery-agent dashboard
-   View assigned deliveries
-   View active deliveries
-   View completed deliveries
-   Check agent availability
-   Go online/offline
-   View delivery information
-   Update delivery status
-   View delivery history
-   Automatic order assignment support
-   Agent-specific APIs

## Admin Features

-   Admin authentication
-   View orders
-   View customer orders
-   View delivery-agent orders
-   Manage delivery agents
-   Assign delivery agents
-   Manage zones
-   Manage rate cards
-   Manage pricing
-   Manage COD charges
-   Manage delivery configuration
-   View order status
-   Update order status
-   Rescheduling support
-   Delivery tracking management

## Notification Features

-   Database-backed notifications
-   Order-created notification
-   Order-status notification
-   Read/unread notification state
-   Notification type
-   Notification creation timestamp
-   Email notification support
-   Customer-specific notifications

## Email Features

The application uses:

``` text
Spring Boot Starter Mail
JavaMailSender
SMTP
```

The email recipient is the **email stored for the customer account**.

The system does not use one fixed customer email.

For example:

``` text
Customer registers
       ↓
customer@gmail.com
       ↓
Account created
       ↓
Customer creates order
       ↓
Order status changes
       ↓
EmailNotificationService
       ↓
customer@gmail.com receives email
```

------------------------------------------------------------------------

# 3. Technology Stack

## Frontend

-   React
-   Vite
-   JavaScript
-   JSX
-   CSS
-   REST API communication

## Backend

-   Java 17
-   Spring Boot
-   Spring Web MVC
-   Spring Data JPA
-   Spring Security
-   JWT
-   Spring Validation
-   Spring Mail
-   Lombok
-   Maven

## Database

-   MySQL
-   JPA
-   Hibernate

## Authentication

``` text
Spring Security
+
JWT
+
BCrypt Password Encoding
```

------------------------------------------------------------------------

# 4. Complete Project Structure

``` text
last-mile-delivery-tracker/
│
├── backend/
│   └── delivery-tracker/
│       │
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/
│       │   │   │       └── deliverytracker/
│       │   │   │           │
│       │   │   │           ├── config/
│       │   │   │           │
│       │   │   │           ├── controller/
│       │   │   │           │   ├── AuthController.java
│       │   │   │           │   ├── NotificationController.java
│       │   │   │           │   ├── OrderController.java
│       │   │   │           │   ├── OrderAssignmentController.java
│       │   │   │           │   ├── OrderTrackingController.java
│       │   │   │           │   ├── DeliveryAgentController.java
│       │   │   │           │   ├── DeliveryAgentSelfController.java
│       │   │   │           │   ├── PricingController.java
│       │   │   │           │   ├── RateCardController.java
│       │   │   │           │   ├── CodChargeController.java
│       │   │   │           │   ├── RescheduleController.java
│       │   │   │           │   └── ZoneController.java
│       │   │   │           │
│       │   │   │           ├── dto/
│       │   │   │           │   ├── LoginRequest.java
│       │   │   │           │   ├── RegisterRequest.java
│       │   │   │           │   ├── AuthResponse.java
│       │   │   │           │   ├── CreateOrderRequest.java
│       │   │   │           │   ├── OrderResponse.java
│       │   │   │           │   └── other DTOs
│       │   │   │           │
│       │   │   │           ├── entity/
│       │   │   │           │   ├── User.java
│       │   │   │           │   ├── Order.java
│       │   │   │           │   ├── Notification.java
│       │   │   │           │   ├── OrderAssignment.java
│       │   │   │           │   ├── OrderTrackingHistory.java
│       │   │   │           │   ├── RateCard.java
│       │   │   │           │   ├── Zone.java
│       │   │   │           │   ├── ZoneArea.java
│       │   │   │           │   └── other entities
│       │   │   │           │
│       │   │   │           ├── repository/
│       │   │   │           │
│       │   │   │           ├── security/
│       │   │   │           │   ├── SecurityConfig.java
│       │   │   │           │   ├── JwtService.java
│       │   │   │           │   ├── JwtAuthenticationFilter.java
│       │   │   │           │   └── CustomUserDetailsService.java
│       │   │   │           │
│       │   │   │           └── service/
│       │   │   │               ├── AuthService.java
│       │   │   │               ├── OrderService.java
│       │   │   │               ├── NotificationService.java
│       │   │   │               ├── EmailNotificationService.java
│       │   │   │               └── other services
│       │   │   │
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       ├── static/
│       │   │       └── templates/
│       │   │
│       │   └── test/
│       │
│       ├── pom.xml
│       ├── mvnw
│       └── mvnw.cmd
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── TrackOrder.jsx
│   │   │   ├── TrackDelivery.jsx
│   │   │   ├── Tracking.jsx
│   │   │   ├── DeliveryAgentDashboard.jsx
│   │   │   └── corresponding CSS files
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── database/
│
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

# 5. Authentication

Authentication is handled using:

``` text
Spring Security
JWT
BCrypt
```

## Registration Flow

``` text
React
  │
  │ POST /api/auth/register
  ▼
AuthController
  │
  ▼
AuthService
  │
  ├── Check email
  ├── Validate role
  ├── BCrypt password
  └── Save User
  │
  ▼
Generate JWT
  │
  ▼
AuthResponse
```

## Login Flow

``` text
React Login
    │
    │ POST /api/auth/login
    ▼
AuthController
    │
    ▼
AuthenticationManager
    │
    ▼
UserRepository
    │
    ▼
Password verification
    │
    ▼
JWT generated
    │
    ▼
Frontend stores JWT
```

For protected requests:

``` http
Authorization: Bearer <JWT_TOKEN>
```

The JWT is processed by:

``` text
JwtAuthenticationFilter
        ↓
JwtService
        ↓
CustomUserDetailsService
        ↓
SecurityContext
        ↓
Controller
```

------------------------------------------------------------------------

# 6. User Roles

The project uses three main roles:

``` text
CUSTOMER
DELIVERY_AGENT
ADMIN
```

## CUSTOMER

Can:

``` text
Register
Login
Create Order
View Own Orders
Track Delivery
View Notifications
```

## DELIVERY_AGENT

Can:

``` text
Login
View Assigned Orders
View Deliveries
Update Delivery Status
Manage Availability
```

## ADMIN

Can:

``` text
Login
View Orders
Manage Agents
Assign Orders
Manage Zones
Manage Pricing
Manage Rate Cards
Manage COD
Manage Delivery Configuration
```

------------------------------------------------------------------------

# 7. Demo Login Credentials

These are the recommended **development/demo credentials**.

They are not automatically created simply by adding them to this README.
The corresponding accounts must exist in the database.

  Role             Email                       Password
  ---------------- --------------------------- ------------------
  ADMIN            `admin@lastmile.local`      `Admin@12345`
  DELIVERY_AGENT   `agent@lastmile.local`      `Agent@12345`
  CUSTOMER         `customer@lastmile.local`   `Customer@12345`

### Important

These credentials are for local development/testing only.

Do not use these passwords in production.

For a customer, the normal registration flow can create the account.

For ADMIN and DELIVERY_AGENT accounts, create/seed the accounts through
the application's supported administrative/database setup and ensure
their `role` is correct.

Because passwords are BCrypt-hashed, never store the plain-text
passwords directly in the `password` database column.

------------------------------------------------------------------------

# 8. Email Configuration

## How email works

The application uses:

``` text
JavaMailSender
```

The sender account is configured on the backend.

The recipient is taken from the customer account.

``` java
message.setTo(email);
```

Therefore:

``` text
Sender
    ↓
Configured Gmail account

Recipient
    ↓
Customer's registered email
```

------------------------------------------------------------------------

# 9. Gmail Setup

For local development with Gmail SMTP, use a dedicated Gmail account if
possible.

Google requires 2-Step Verification before an App Password can be
created. Google describes App Passwords as a 16-digit passcode for
applications that cannot use the normal Google sign-in flow.
citeturn0search0turn0search2

## Step 1 --- Create/choose a sender Gmail account

Example:

``` text
your-project-mail@gmail.com
```

This account is the account from which order notifications will be sent.

## Step 2 --- Enable 2-Step Verification

Open your Google Account security settings and enable:

``` text
2-Step Verification
```

Google's current instructions place this under the account's
security/sign-in settings. citeturn0search2

## Step 3 --- Create an App Password

After 2-Step Verification is enabled:

``` text
Google Account
    ↓
Security
    ↓
2-Step Verification
    ↓
App passwords
```

Create an App Password for the delivery-tracker application.

Google notes that App Passwords require 2-Step Verification and are
separate from your normal Google Account password. citeturn0search0

## Step 4 --- Configure Spring Boot

In local configuration:

``` properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

Set:

``` text
MAIL_USERNAME=your-project-mail@gmail.com
MAIL_PASSWORD=your-generated-app-password
```

Do **not** put your normal Gmail password in Spring Boot.

Do **not** commit the App Password to GitHub.

------------------------------------------------------------------------

# 10. Email Flow

``` text
Customer registers
       ↓
Customer email stored in users table
       ↓
Customer creates order
       ↓
Order stored
       ↓
Order status changes
       ↓
OrderService
       ↓
NotificationService
       ↓
EmailNotificationService
       ↓
JavaMailSender
       ↓
Customer's registered email
```

Example:

``` text
Order:
ORD-A9B01ABD2E90

Status:
PICKED_UP

Email recipient:
customer's registered email
```

------------------------------------------------------------------------

# 11. Database Architecture

The application uses MySQL with JPA/Hibernate.

The database stores the major business entities required for delivery
management.

Core entities include:

``` text
users
orders
notifications
order_assignments
order_tracking_history
delivery-agent related data
zones
zone_areas
rate_cards
reschedule information
```

## Users

Stores:

``` text
id
email
password
full_name
phone
role
active
created_at
updated_at
```

The `role` determines the user's permissions.

------------------------------------------------------------------------

# 12. Order Data Flow

``` text
Customer
   │
   │ Create Order
   ▼
POST /api/orders
   │
   ▼
OrderController
   │
   ▼
OrderService
   │
   ├── Validate request
   ├── Identify logged-in customer
   ├── Create order
   ├── Generate order number
   └── Persist order
   │
   ▼
MySQL
   │
   ├── Notification
   ├── Assignment
   └── Tracking
```

------------------------------------------------------------------------

# 13. Order Lifecycle

The delivery lifecycle is:

``` text
CREATED
   ↓
PICKED_UP
   ↓
IN_TRANSIT
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

A status change can trigger:

``` text
Order update
     ↓
Tracking history
     ↓
Notification
     ↓
Email
```

------------------------------------------------------------------------

# 14. Automatic Assignment Flow

``` text
Customer creates order
        ↓
Order saved
        ↓
Assignment service
        ↓
Find available delivery agent
        ↓
Agent selected
        ↓
Order assignment saved
        ↓
Agent dashboard updated
        ↓
Customer tracking updated
```

If no suitable agent is available, the order can remain unassigned until
an appropriate assignment is made.

------------------------------------------------------------------------

# 15. Main API Endpoints

## Authentication

  Method   Endpoint               Purpose
  -------- ---------------------- ----------------------------
  POST     `/api/auth/register`   Register customer
  POST     `/api/auth/login`      Login
  GET      `/api/auth/me`         Current authenticated user

------------------------------------------------------------------------

## Orders

  Method   Endpoint                              Purpose
  -------- ------------------------------------- -----------------------------
  GET      `/api/orders`                         Retrieve orders
  POST     `/api/orders`                         Create order
  GET      `/api/orders/customer`                Logged-in customer's orders
  GET      `/api/orders/customer/{customerId}`   Customer orders
  GET      `/api/orders/{id}`                    Order by ID
  GET      `/api/orders/number/{orderNumber}`    Order by order number
  GET      `/api/orders/status/{status}`         Orders by status
  PATCH    `/api/orders/{id}/status`             Update status

Protected endpoints require JWT authentication.

------------------------------------------------------------------------

## Notifications

The project includes notification APIs for:

``` text
/api/notifications/**
```

These APIs support customer-specific notification retrieval and
read/unread state.

------------------------------------------------------------------------

## Delivery Agents

The project contains delivery-agent APIs for:

``` text
Agent management
Agent availability
Agent-specific deliveries
Assigned orders
```

The exact endpoints should be verified against the controller
implementations in:

``` text
backend/delivery-tracker/src/main/java/com/deliverytracker/controller/
```

------------------------------------------------------------------------

## Assignment

The assignment controller manages:

``` text
Order assignment
Agent assignment
Assignment information
```

------------------------------------------------------------------------

## Tracking

Tracking APIs manage:

``` text
Current delivery status
Tracking history
Order tracking information
```

------------------------------------------------------------------------

## Pricing

The project contains APIs for:

``` text
/api/pricing/**
/api/rate-cards/**
/api/cod-charges/**
/api/zones/**
```

These support delivery pricing and configuration.

------------------------------------------------------------------------

# 16. Frontend API Flow

The frontend communicates with Spring Boot through HTTP requests.

Example:

``` text
React Page
   ↓
API Request
   ↓
http://localhost:8080/api/...
   ↓
Spring Security
   ↓
JWT Filter
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MySQL
```

For protected requests:

``` text
React
  ↓
JWT from login
  ↓
Authorization header
  ↓
Spring Security
  ↓
JwtAuthenticationFilter
  ↓
Authenticated user
  ↓
Controller
```

------------------------------------------------------------------------

# 17. Frontend Pages

The frontend contains customer and delivery-agent pages including:

``` text
Login
Dashboard
Orders
Profile
Track Order
Track Delivery
Tracking
Delivery Agent Dashboard
```

Each page has corresponding styling where applicable.

------------------------------------------------------------------------

# 18. Backend Setup

## Requirements

Install:

``` text
Java 17
MySQL
Node.js
npm
Git
```

Check:

``` bash
java -version
node -v
npm -v
mysql --version
```

------------------------------------------------------------------------

# 19. Create Database

Start MySQL.

Then create the database required by your local configuration.

Example:

``` sql
CREATE DATABASE delivery_tracker;
```

If your project already contains a database SQL file, import that
schema/data instead of creating a conflicting schema manually.

------------------------------------------------------------------------

# 20. Configure Backend

Open:

``` text
backend/delivery-tracker/src/main/resources/application.properties
```

Configure:

``` properties
spring.datasource.url=jdbc:mysql://localhost:3306/delivery_tracker
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Then configure JWT and mail values using environment variables or
another local secrets mechanism.

Example:

``` properties
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

------------------------------------------------------------------------

# 21. Start Backend

From the project root:

``` bash
cd backend/delivery-tracker
```

Run:

``` bash
./mvnw clean spring-boot:run
```

Windows:

``` cmd
mvnw.cmd clean spring-boot:run
```

Wait for the Spring Boot startup message.

The backend normally runs at:

``` text
http://localhost:8080
```

------------------------------------------------------------------------

# 22. Start Frontend

Open another terminal:

``` bash
cd frontend
```

Install packages:

``` bash
npm install
```

Start Vite:

``` bash
npm run dev
```

The frontend normally runs at:

``` text
http://localhost:5173
```

Use the exact URL printed by Vite if it selects another port.

------------------------------------------------------------------------

# 23. Complete Run Flow

Start:

``` text
MySQL
  ↓
Spring Boot backend
  ↓
React/Vite frontend
```

Then:

``` text
1. Open frontend
2. Register/login
3. Receive JWT
4. Open customer dashboard
5. Create order
6. Verify order
7. Assign delivery agent
8. Login as delivery agent
9. Verify assigned delivery
10. Update delivery status
11. Verify customer tracking
12. Verify notification
13. Verify email
14. Complete delivery
```

------------------------------------------------------------------------

# 24. API Testing With Postman

Recommended testing order:

## Register

``` http
POST /api/auth/register
Content-Type: application/json
```

Request:

``` json
{
  "email": "customer@example.com",
  "password": "Customer@12345",
  "fullName": "Test Customer",
  "phone": "9999999999",
  "role": "CUSTOMER"
}
```

## Login

``` http
POST /api/auth/login
Content-Type: application/json
```

``` json
{
  "email": "customer@example.com",
  "password": "Customer@12345"
}
```

Copy the JWT returned by the backend.

For protected APIs:

``` http
Authorization: Bearer YOUR_JWT
```

------------------------------------------------------------------------

# 25. Security

The backend uses:

``` text
JWT
BCrypt
Spring Security
Role-based authorization
Stateless sessions
CORS
```

Passwords are not stored as plain text.

JWT authentication is stateless.

CORS is configured for the local React development origin.

------------------------------------------------------------------------

# 26. Common 401 / 403 Problems

## 401 Unauthorized

Usually check:

``` text
Is JWT present?
Is JWT expired?
Is Authorization header correct?
```

Correct format:

``` http
Authorization: Bearer <token>
```

## 403 Forbidden

Check:

``` text
JWT accepted?
User role correct?
Endpoint permission correct?
OPTIONS request permitted?
CORS configured?
```

For example:

``` text
CUSTOMER
```

must not attempt an endpoint restricted to:

``` text
ADMIN
```

------------------------------------------------------------------------

# 27. Email Troubleshooting

If email is not sent:

Check:

``` text
1. MAIL_USERNAME exists
2. MAIL_PASSWORD is an App Password
3. Gmail 2-Step Verification is enabled
4. SMTP host is smtp.gmail.com
5. SMTP port is 587
6. STARTTLS is enabled
7. Customer email is valid
8. Backend logs for JavaMailSender errors
```

Do not use the normal Gmail account password for SMTP App Password
authentication.

Google also notes that App Passwords can be revoked and are revoked
after a Google Account password change, so a new App Password may be
required afterward. citeturn0search0

------------------------------------------------------------------------

# 28. GitHub Setup

Clone:

``` bash
git clone https://github.com/harshitkumargupta/last_mile_delivery.git
```

Enter:

``` bash
cd last_mile_delivery
```

Install frontend:

``` bash
cd frontend
npm install
```

Backend:

``` bash
cd ../backend/delivery-tracker
./mvnw clean install
```

------------------------------------------------------------------------

# 29. Git Ignore

The project should not commit:

``` text
target/
node_modules/
dist/
.env
application-local.properties
.idea/
.vscode/
.DS_Store
```

Never commit:

``` text
Database passwords
JWT secrets
Gmail App Passwords
API keys
Production credentials
```

------------------------------------------------------------------------

# 30. Recommended Environment Variables

Use environment variables for:

``` text
DB_USERNAME
DB_PASSWORD
JWT_SECRET
MAIL_USERNAME
MAIL_PASSWORD
```

Example:

``` bash
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export JWT_SECRET=your_long_random_secret
export MAIL_USERNAME=your_sender@gmail.com
export MAIL_PASSWORD=your_gmail_app_password
```

Then reference them from Spring configuration.

------------------------------------------------------------------------

# 31. Complete Business Flow

``` text
                         CUSTOMER
                            │
                            │ Register/Login
                            ▼
                       JWT AUTHENTICATION
                            │
                            ▼
                      CUSTOMER DASHBOARD
                            │
                            │ Create Order
                            ▼
                       ORDER CONTROLLER
                            │
                            ▼
                        ORDER SERVICE
                            │
                  ┌─────────┼─────────┐
                  │         │         │
                  ▼         ▼         ▼
               MySQL   Assignment  Notification
                            │         │
                            ▼         ▼
                    DELIVERY AGENT   Email
                            │
                            │ Update Status
                            ▼
                       ORDER SERVICE
                            │
                  ┌─────────┼─────────┐
                  ▼         ▼         ▼
              Tracking   Database   Notification
                  │                   │
                  └─────────┬─────────┘
                            ▼
                         CUSTOMER
                            │
                            ▼
                    Updated Dashboard
```

------------------------------------------------------------------------

# 32. End-to-End Example

``` text
Customer registers
        ↓
Customer logs in
        ↓
JWT generated
        ↓
Customer creates order
        ↓
Order receives order number
        ↓
Order stored in MySQL
        ↓
Notification generated
        ↓
Email sent to customer's registered email
        ↓
Agent assignment
        ↓
Agent sees assigned order
        ↓
Agent picks up order
        ↓
Status = PICKED_UP
        ↓
Notification + email
        ↓
Status = IN_TRANSIT
        ↓
Notification + email
        ↓
Status = OUT_FOR_DELIVERY
        ↓
Notification + email
        ↓
Status = DELIVERED
        ↓
Final notification + email
```

------------------------------------------------------------------------

# 33. Production Recommendations

Before production deployment:

-   Replace demo credentials
-   Use strong random JWT secret
-   Store secrets in environment variables/secrets manager
-   Use HTTPS
-   Restrict CORS to production domains
-   Disable development-only endpoints
-   Use a dedicated email sender account
-   Do not expose database credentials
-   Use production database credentials
-   Add proper exception handling
-   Add API rate limiting
-   Add automated tests
-   Add database backups
-   Configure production logging

------------------------------------------------------------------------

# 34. Project Modules

  Module            Responsibility
  ----------------- -----------------------------------
  Authentication    Registration, login, JWT
  Users             Customer/agent/admin accounts
  Orders            Create and manage orders
  Assignment        Assign orders to agents
  Delivery Agents   Agent operations and availability
  Tracking          Delivery status and history
  Notifications     In-app customer notifications
  Email             Email order updates
  Pricing           Delivery price calculation
  Rate Cards        Rate configuration
  COD               Cash-on-delivery charges
  Zones             Delivery zones
  Rescheduling      Delivery reschedule workflow
  Frontend          Dashboards and user interface
  Database          Persistent application data

------------------------------------------------------------------------

# 35. Final Project Architecture

``` text
┌──────────────────────────────────────────────┐
│                 React + Vite                 │
│                                              │
│ Customer │ Agent │ Admin │ Tracking │ Orders│
└──────────────────────┬───────────────────────┘
                       │
                       │ REST API + JWT
                       ▼
┌──────────────────────────────────────────────┐
│                Spring Boot                   │
│                                              │
│ Controllers                                  │
│     ↓                                        │
│ Services                                     │
│     ↓                                        │
│ Repositories                                 │
│     ↓                                        │
│ JPA / Hibernate                              │
└───────────────┬───────────────┬──────────────┘
                │               │
                ▼               ▼
             MySQL          Spring Mail
                               │
                               ▼
                            Gmail SMTP
```

------------------------------------------------------------------------

# 36. Current Project Goal

The project is designed to provide a complete last-mile delivery
workflow:

``` text
Secure Login
     ↓
Order Creation
     ↓
Order Assignment
     ↓
Delivery Tracking
     ↓
Agent Status Updates
     ↓
Customer Notifications
     ↓
Email Notifications
     ↓
Successful Delivery
```

The main objective is to keep the customer, delivery agent, and
administrator connected through one centralized delivery platform.

------------------------------------------------------------------------

# Author

**Harshit Kumar Gupta**

GitHub Repository:

https://github.com/harshitkumargupta/last_mile_delivery
