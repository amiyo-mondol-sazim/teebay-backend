# Features

This repository implements a small marketplace-style app (“TeeBay”) where users can register/login, list products, browse products, and create purchase/rental transactions against products.

> Note: This document describes behavior and functionality only (what the project does), not the underlying stack.

---

## What the project currently does

### 1) User accounts
- **Register a user** with:
  - email, password, first name
  - optional last name, address, phone number
- **Login a user** using email + password and receive a login result (returned as a single value from the API).
- Users are represented with profile/contact fields and have relationships to:
  - **Products** they own
  - **Transactions** they have made as a customer

**API surface (observed)**
- Mutations:
  - `registerUser(...)`
  - `loginUser(email, password)`

---

### 2) Product listings
- **Create a product listing** with:
  - title
  - categories
  - description
  - purchase price
  - rent price
  - rental period (DAY / WEEK / MONTH)
  - ownerId (the user who owns the listing)
- **Edit a product listing** (partial updates supported).
- **Delete a product listing**.
- **Fetch products**:
  - by product id
  - by owner/user id (products posted by a user)
  - fetch all products with a paginated response that includes `products` and `totalCount`
- **Increment product view count** via a dedicated mutation.

**API surface (observed)**
- Queries:
  - `getProductById(id)`
  - `getProductsByUserId(ownerId)`
  - `getAllProducts` → returns `{ products, totalCount }`
- Mutations:
  - `addProduct(...)`
  - `editProduct(...)`
  - `deleteProduct(id)`
  - `incrementViews(id)`

---

### 3) Transactions (buy / rent)
- Supports recording a **transaction** between a customer and a product.
- Transaction types:
  - `BUY`
  - `RENT`
- For rentals, transactions carry a **time window** (`rentTimeFrom`, `rentTimeTo`).
- Transactions are connected to:
  - the **product**
  - the **customer** (a user)

**API surface (observed)**
- A Transaction type exists in the API and is included in the combined schema. (Specific query/mutation names for creating/fetching transactions are defined in the transaction module but were not fully visible in the sampled files.)

---

### 4) Seed/sample data (for testing)
- There is an optional seed step described that creates:
  - sample users
  - sample products
  - sample transactions

This enables testing flows without manual setup.

---

### 5) Basic end-to-end flow supported
A typical supported usage looks like:
1. Register → login as a user
2. Create one or more product listings as that user
3. Browse products (all products / by id / by owner)
4. Increment views when a product is opened
5. Create a buy or rent transaction for a product
6. Observe user/product relationships to transactions

---

## What you’d need to implement to recreate (“copy”) this project

If you want to rebuild a project with the same behavior, implement the following functional requirements:

### A) Domain model & relationships
Implement these core entities and relations:
- **User**
  - required: id, firstName, email, password
  - optional: lastName, address, phoneNumber
- **Product**
  - required: id, title, categories, description, ownerId, viewCount, createdAt, updatedAt
  - required pricing + rental metadata (purchasePrice, rentPrice, rentalPeriod)
- **Transaction**
  - required: id, productId, customerId, transactionType, createdAt
  - rental-only fields: rentTimeFrom, rentTimeTo

Relationships:
- User (owner) → Products (1-to-many)
- User (customer) → Transactions (1-to-many)
- Product → Transactions (1-to-many)

Enums:
- RentalPeriod: DAY/WEEK/MONTH
- TransactionType: BUY/RENT

---

### B) API behavior (queries/mutations)
Recreate the same API surface and semantics:

#### User
- `registerUser(...)`
  - Create user record
  - Validate uniqueness (email, optionally phone number)
  - Store password securely
- `loginUser(email, password)`
  - Validate credentials
  - Return a login result (commonly a session token or equivalent)

#### Products
- `addProduct(...)`
  - Validate required fields
  - Attach to owner
- `editProduct(...)`
  - Partial updates
  - Prevent invalid transitions (e.g., negative pricing)
- `deleteProduct(id)`
  - Remove product (and ensure transactions remain consistent per your rules)
- `incrementViews(id)`
  - Increase view count atomically
- `getProductById(id)`
- `getProductsByUserId(ownerId)`
- `getAllProducts`
  - Return `{ products, totalCount }`
  - Implement consistent pagination rules (page/limit or cursor) even if the current API doesn’t expose arguments yet

#### Transactions
Implement mutations/queries that enable:
- Creating a BUY transaction
- Creating a RENT transaction (must include rentTimeFrom/to)
- Fetching transactions by user and/or by product
- Returning linked `product` and `customer` data for a transaction

(Exact operation names should match what you choose, but behavior should support the same flows described above.)

---

### C) Validation rules & consistency fixes (important gaps)
The repo contains explicit notes indicating some data consistency issues that you should address when recreating it:

1. **Product required fields should not be nullable**
   - The UI/flows treat `title`, `categories`, `description`, `purchasePrice`, `rentPrice`, `rentalPeriod` as required inputs.
   - Ensure the stored product record enforces these requirements.

2. **Transaction rental window should be conditional**
   - `rentTimeFrom` / `rentTimeTo` should be:
     - required for RENT
     - absent/nullable for BUY
   - Enforce this at validation time (and ideally at persistence level via constraints or clear invariants).

3. **Schema/type duplication cleanup**
   - There are comments noting duplicate Query/Mutation/type declarations in parts of the API definitions.
   - When copying, keep a single, consistent source of truth for operation and type definitions.

---

### D) Application pages/features to replicate (behavioral)
To match the current user experience implied by the API usage, implement:
- Registration screen
- Login screen
- Product list view (browse all products)
- Product detail view (and trigger view increment)
- “My products” view (products by current user)
- Create/edit/delete product flows
- Checkout flow to create:
  - a buy transaction
  - a rental transaction (choose time window)

---

## Notes / limitations of this analysis
- I only inspected a subset of files from the repository (tooling output is capped), so there may be additional features or operations not captured here.
- You can review more code in the GitHub UI here: https://github.com/AmiyoKm/graphql_basics
