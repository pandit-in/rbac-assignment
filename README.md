# Store Rating Platform (RBAC Assignment)

A comprehensive Full-Stack web application built for a coding challenge. This platform implements a robust Role-Based Access Control (RBAC) system allowing different user types to interact with a store rating ecosystem.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: Shadcn UI
- **State Management/Data Fetching**: SWR
- **Auth Client**: Better Auth

### Backend
- **Framework**: Express.js
- **Runtime**: Bun
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: Better Auth (Server-side)

---

## 👥 User Roles & Functionalities

### 1. System Administrator
- **Dashboard**: High-level metrics showing total users, stores, and ratings.
- **User Management**:
  - Add new Admin, Normal, and Store Owner accounts.
  - View, search, and filter users by Name, Email, Address, and Role.
  - View specific details for all users (including ratings for Store Owners).
- **Store Management**:
  - Add new stores and assign them to Store Owners.
  - View all registered stores with their overall ratings.
  - Delete stores if necessary.

### 2. Normal User
- **Authentication**: Secure signup and login system.
- **Store Interaction**:
  - Browse all registered stores.
  - Search for stores by Name or Address.
  - View store details, overall ratings, and their own submitted rating.
- **Ratings**: Submit new ratings (1-5 stars) or modify existing ones.
- **Security**: Update profile information and change passwords via Settings.

### 3. Store Owner
- **Dashboard**:
  - View the average rating of their specific store.
  - See a list of all users who have submitted ratings/reviews for their store.
- **Security**: Update profile information and change passwords.

---

## 🛡️ Form Validations & Security

The platform enforces strict data integrity using Zod schemas:
- **Name**: 20 - 60 characters.
- **Address**: Maximum 400 characters.
- **Email**: Standard email format validation.
- **Password**: 8 - 16 characters, must include at least one uppercase letter and one special character.
- **Ratings**: Integers between 1 and 5.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Bun](https://bun.sh/) installed.
- PostgreSQL database instance (or a Neon project).

### 1. Clone the repository
```bash
git clone <repository-url>
cd rbac-assignment
```

### 2. Backend Setup
```bash
cd backend
bun install
```
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=your_postgresql_url
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=http://localhost:3001
```
Push the database schema:
```bash
bun db:push
```
Start the backend:
```bash
bun run dev
```

### 3. Frontend Setup
```bash
cd ..
bun install
```
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3001
```
Start the frontend:
```bash
bun run dev
```

---

## 📊 Database Schema

The system uses a normalized schema with the following main tables:
- **`user`**: Stores user profiles, credentials, and roles (Admin, User, Store Owner).
- **`store`**: Contains store information, linked to a Store Owner.
- **`rating`**: Tracks ratings and reviews, linking users to stores.
- **`session/account`**: Managed by Better Auth for secure session handling.

---

## 💅 Design Philosophy
- **Responsive**: Fully optimized for mobile, tablet, and desktop.
- **Clean UI**: Uses a modern "Glassmorphism" inspired design with a curated color palette.
- **UX**: Smooth transitions, loading spinners, and toast notifications for every action.
