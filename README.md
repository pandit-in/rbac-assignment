# Store Rating System (RBAC Assignment)

A high-performance, full-stack Role-Based Access Control (RBAC) application built with Next.js 16, Better Auth, and Drizzle ORM. This system allows users to discover, rate, and review stores, while providing management tools for store owners and system administrators.

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Authentication:** [Better Auth](https://www.better-auth.com/) with RBAC plugin
- **Database:** [Neon](https://neon.tech/) (Serverless PostgreSQL)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Styling:** TailwindCSS 4 & Vanilla CSS
- **UI Components:** Shadcn UI (Radix UI)
- **Data Fetching:** SWR
- **Runtime:** Bun

## 🔐 Role-Based Access Control

The application implements three distinct roles:

### 1. System Administrator (Admin)
- Full access to the Admin Dashboard.
- Manage all users (View, Create, Delete).
- Manage all stores (View, Create, Edit, Delete).
- Oversee global platform metrics and ratings.

### 2. Store Owner
- Access to the Owner Dashboard.
- View performance metrics for their own stores.
- View and manage ratings/reviews for their stores.
- Profile management.

### 3. User (Consumer)
- Discover and view all registered stores.
- Submit ratings and detailed reviews.
- Update their own ratings.
- Manage personal profile and address settings.

## 🔑 Demo Credentials

For testing purposes, you can use the following accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@roxiler.com` | `Admin@123` |
| **User** | `user1@test.com` | `User@123` |
| **Store Owner** | `owner1@store.com` | `Owner@123` |

## 🛠️ Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine.
- A Neon PostgreSQL database instance.

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pandit-in/rbac-assignment.git
   cd rbac-assignment
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root and add your database URL:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]/[dbname]?sslmode=require
   BETTER_AUTH_SECRET=your_secret_here
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. **Sync Database Schema:**
   ```bash
   bunx drizzle-kit push
   ```

5. **Run Development Server:**
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

- `app/`: Next.js App Router (Pages and API routes).
- `components/`: Reusable UI components.
- `lib/`: Shared utilities, API fetchers, database configuration, and auth setup.
- `drizzle/`: Database migration files.
- `public/`: Static assets.

## 📝 License

This project is for assignment purposes.
