# Market Flow — Multi-Vendor Marketplace

Market Flow is a production grade multi vendor marketplace where independent sellers can list products, manage orders, and receive payouts all without touching each other's money. I built it end-to-end as a portfolio project to push my full-stack skills into genuinely complex territory.

## 🚀 Live Demo & Documentation

* **Live Deployment:** https://marketflowapp.vercel.app/
* **Portfolio Case Study:** https://hamza-farooq.vercel.app/projects/1
* **Source Code:** https://github.com/Hamza7800/market-flow

## ⚡ Core Engineering Features

### 1. Multi-Vendor Payments with Stripe Connect

Implemented marketplace payment flows using **Stripe Connect and webhooks**.

* Routes marketplace payments between the platform and connected vendor accounts.
* Calculates and separates the platform's commission from vendor revenue.
* Handles events such as successful payments and payment-related state changes without relying exclusively on the user's browser session.

### 2. Optimistic Cart Mutations

Built an optimistic cart experience using **TanStack React Query mutations**.

* Cart changes update the UI immediately instead of waiting for the server response.
* Supports adding products, updating quantities, and removing items.
* Preserves the previous cache state before mutations.
* Automatically rolls back optimistic changes when a server validation or network error occurs.
* Synchronizes the client cache with the server after successful mutations.

### 3. Type-Safe Data Layer

Used **TypeScript + Drizzle ORM** to keep the application strongly typed across the data layer.

* PostgreSQL relational schema managed through Drizzle.
* Type-safe database queries.
* Structured server-side mutations.
* Validation between client input and server-side operations.
* Clear separation between product, cart, order, vendor, payment, and user-related data.

## 🧠 What I Focused On

Market Flow was primarily built to go beyond a simple CRUD marketplace and explore the engineering problems that appear in real-world commerce systems:

* Multi-vendor payment architecture
* Stripe Connect
* Webhook-driven workflows
* Optimistic UI updates
* Cache synchronization
* Database consistency
* Type-safe backend operations
* Server/client data synchronization
* Error recovery and rollback strategies

## 📦 Local Setup

This project uses **pnpm**.

### 1. Clone the repository

```bash
git clone https://github.com/Hamza7800/market-flow.git
cd market-flow
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables in
.env file

Then populate the required environment variables for PostgreSQL, Better Auth, Stripe, UploadThing, and other services.

### 4. Set up the database

Push the Drizzle schema to your PostgreSQL database:

```bash
pnpm db:push
```

To open the Drizzle database studio:

```bash
pnpm db:studio
```

### 5. Start the development server

```bash
pnpm dev
```

## 🔗 Links

* **Live Application:** https://marketflowapp.vercel.app/
* **Portfolio:** https://hamza-farooq.vercel.app/projects/1
* **GitHub:** https://github.com/Hamza7800
* **Repository:** https://github.com/Hamza7800/market-flow
