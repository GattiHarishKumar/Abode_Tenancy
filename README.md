<div align="center">

# 🏢 Abode Tenancy

### *Enterprise-Grade Operating System for Modern PGs, Hostels & Co-Living Spaces*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis_7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

<p align="center">
  <b>Abode Tenancy</b> is an end-to-end PG & co-living property management system engineered to automate rent collections, live dining counts, maintenance SLAs, gate QR visitor onboarding, and deposit settlements.
</p>

[Key Features](#-key-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Role Portals](#-role-portals) • [Contributing](#-contributing) • [API Contracts](#-api-structure)

---

</div>

## 🌟 Executive Overview

Managing paying guest (PG) accommodations, hostels, and shared living communities is traditionally fraught with manual leakages—untracked cash rent collections, food preparation waste due to inaccurate headcount, chaotic maintenance communication, and deposit dispute delays upon vacating.

**Abode Tenancy** provides a modular, domain-driven operating platform that connects all property stakeholders into a single high-availability system:
- **Owners & Property Managers**: Complete financial ledger, real-time bed inventory, automated WhatsApp payment triggers, and SLA tracking.
- **Tenants & Residents**: Self-service dining RSVPs, instant UPI QR payments, 1-click maintenance dispatch, and digital lease & deposit visibility.
- **Kitchen Staff & Cooks**: High-visibility industrial display with multi-language support (English, Telugu, Kannada, Hindi, Tamil), automated raw material procurement math, and food waste reduction logging.
- **Prospective Tenants**: Seamless QR gate discovery, instant bed vacancy checking, and paperless KYC application onboarding.

---

## 🏗️ Architecture

Abode Tenancy is built as a **Modular Monolith** in Java 21 / Spring Boot 3 paired with a modern React TypeScript frontend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        React 18 + TypeScript PWA                         │
│   (TailwindCSS • Lucide Icons • Responsive Light Theme • Vite Bundler)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ REST / JSON (JWT Auth)
┌────────────────────────────────────▼────────────────────────────────────┐
│                  Spring Boot 3.2 Modular Monolith                       │
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────────┐ │
│  │   Auth & RBAC     │  │ Property & Rooms  │  │   Tenant 360 & KYC  │ │
│  └───────────────────┘  └───────────────────┘  └─────────────────────┘ │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────────┐ │
│  │ Billing & Rent    │  │  Food & Kitchen   │  │ Maintenance SLA     │ │
│  └───────────────────┘  └───────────────────┘  └─────────────────────┘ │
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────────┐ │
│  │ Public Discovery  │  │ WhatsApp Triggers │  │ Analytics Engine    │ │
│  └───────────────────┘  └───────────────────┘  └─────────────────────┘ │
└───────────────────┬─────────────────────────────────┬───────────────────┘
                    │                                 │
          ┌─────────▼─────────┐             ┌─────────▼─────────┐
          │   PostgreSQL 16   │             │      Redis 7      │
          │ (Relational Data) │             │  (Cache & Tokens) │
          └───────────────────┘             └───────────────────┘
```

### Architectural Highlights
- **Strict Data Isolation**: Multi-tenancy enforcement ensuring users never access cross-property or cross-tenant datasets.
- **Domain-Driven Design (DDD)**: Clear separation of concerns with dedicated repositories, services, controllers, and DTO boundaries.
- **Stateless Authentication**: JWT tokens with role-based authorization (`ROLE_OWNER`, `ROLE_TENANT`, `ROLE_COOK`).

---

## ✨ Key Features

### 1. 🏢 Owner Operations & Financial Control
- **Dynamic Room & Bed Matrix**: Real-time room vacancy grid with AC vs Non-AC, attached washroom, and balcony tags.
- **30-Day Vacancy Pipeline**: Anticipate future vacancies from tenants currently serving their notice period.
- **Daily Housekeeping Tracker**: Room-by-room status flags (Cleaned vs Pending) for hygiene accountability.
- **1-Click WhatsApp Reminders**: Direct WhatsApp reminder links with pre-filled overdue balances and payment details.
- **Security Deposit Calculator**: Automated deduction calculator for room painting, deep cleaning, and unpaid EB/rent dues.
- **Offline Cash Payment Recording**: Manual payment reconciliation with digital receipt issuance.

### 2. 🍲 Food & Kitchen Command
- **Live Meal Headcount**: Real-time headcount for Breakfast, Lunch, and Dinner.
- **Cook Touch Board**: Industrial high-contrast display with multi-language switching (English, Telugu, Kannada, Hindi, Tamil).
- **Rule-Based Ingredient Estimator**: Auto-calculates required Rice (kg), Dal (kg), Veggies (kg), and Cooking Oil (L) based on live RSVPs.
- **Leftover Food Waste Logger**: Tracks waste volume (`ZERO`, `LOW`, `MEDIUM`, `HIGH`) to optimize next-day grocery orders.
- **Tenant Guest Meal Surcharge**: Instant +1 guest coupon additions automatically billed to tenant's monthly invoice.

### 3. 🛠️ Helpdesk & Maintenance SLA
- **Categorized Issue Reporting**: Electrical, Plumbing, Internet/WiFi, Cleanliness, Food, and Noise.
- **1-Click WhatsApp Technician Dispatch**: Pre-configured technician presets (Plumber, Electrician, WiFi ISP, Housekeeping) for instant WhatsApp dispatch with ticket ID and room details.
- **SLA State Machine**: `NEW` → `ACKNOWLEDGED` → `IN_PROGRESS` → `RESOLVED` → `CLOSED`.

### 4. 🚪 Public Gate Discovery & Paperless KYC
- **Printable A4 Gate QR Flyer**: Print-ready gate poster for walk-in visitor lead capture.
- **Public Co-Living Page**: Modern listing highlighting vacant beds, meal plans, pricing, and amenities.
- **Direct Digital Application**: Candidates submit move-in date, sharing preferences, and contact info for owner approval.

---

## 🚀 Quick Start

### Prerequisites
- **Java 21** (JDK)
- **Node.js 18+** & `npm`
- **Docker** & **Docker Compose** (for PostgreSQL & Redis)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/GattiHarishKumar/Abode_Tenancy.git
cd Abode_Tenancy
```

---

### Step 2: Start Infrastructure (PostgreSQL & Redis)
```bash
docker-compose up -d
```
*Starts PostgreSQL on port `5432` and Redis on port `6379`.*

---

### Step 3: Run the Backend (Spring Boot)
```bash
cd backend
./mvnw clean spring-boot:run -Dspring-boot.run.profiles=local
```
*Backend runs on `http://localhost:8080`.*

---

### Step 4: Run the Frontend (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*

---

## 🔑 Default Seed Credentials (Quick Testing)

The system seeds sample operational accounts automatically on first boot:

| Role | Phone Number | Default Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Owner** | `9845011223` | `Admin@123` | Financial Ledger, Room Matrix, Lead Onboarding, SLA Board |
| **Tenant** | `9845011224` | `Tenant@123` | Dining RSVP, UPI Invoices, Raise Tickets, Lease Profile |
| **Cook** | `9845011225` | `Cook@123` | Kitchen Headcount Board, Ingredient Math, Waste Logger |

---

## 📁 Repository Structure

```
Abode_Tenancy/
├── backend/                        # Spring Boot 3.2 Modular Monolith
│   ├── src/main/java/com/abode/
│   │   ├── auth/                   # JWT & Spring Security RBAC
│   │   ├── properties/             # Properties, Rooms, Beds & Vacancies
│   │   ├── tenants/                # Tenant 360, Agreements & KYC
│   │   ├── rent/                   # Invoices, Payments, Settlement & PDF Receipts
│   │   ├── food/                   # Menus, RSVPs, Cook Headcount & Waste Logging
│   │   ├── complaints/             # Helpdesk SLA & Maintenance Dispatch
│   │   ├── applications/           # Inbound Leads & Public Applications
│   │   └── config/                 # Security, Redis & CORS Configurations
│   └── src/main/resources/         # Application Profiles & Flyway/Schema configs
│
├── frontend/                       # React 18 + TypeScript PWA
│   ├── src/
│   │   ├── api/                    # Axios Client with Auth Interceptors
│   │   ├── context/                # Authentication & Tenant State Context
│   │   ├── design-system/          # Design Tokens & Palette Foundations
│   │   ├── components/layout/      # Owner, Tenant, and Cook Layout Shells
│   │   ├── pages/
│   │   │   ├── auth/               # Login & Role Selectors
│   │   │   ├── owner/              # Owner Portal Screens
│   │   │   ├── tenant/             # Tenant Portal Screens
│   │   │   ├── cook/               # Cook Dashboard Display
│   │   │   └── public/             # Public PG Booking Page
│   │   └── types/                  # Shared TypeScript Interfaces
│   └── tailwind.config.js          # Tailwind Theme & Styling Foundations
│
├── docker-compose.yml              # Local PostgreSQL & Redis configuration
├── .gitignore                      # Git exclusion rules
└── README.md                       # Project Documentation
```

---

## 🤝 Contributing

We welcome contributions from developers, architects, and designers! Whether it's fixing bugs, improving docs, adding integrations (Razorpay, Twilio, SendGrid), or enhancing UI/UX, your help is appreciated.

### Contribution Workflow

1. **Fork the Repository**:
   Click the **Fork** button at the top right of this page.

2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Abode_Tenancy.git
   cd Abode_Tenancy
   ```

3. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make Your Changes & Test**:
   - For backend: Ensure `./mvnw test` passes.
   - For frontend: Ensure `npm run build` compiles with 0 TypeScript errors.

5. **Commit Your Changes**:
   ```bash
   git commit -m "feat(module): add amazing feature description"
   ```

6. **Push to Your Fork & Open a Pull Request**:
   ```bash
   git push origin feature/amazing-feature
   ```
   Open a **Pull Request** to the `main` branch with a clear description of the enhancements made.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by passionate engineers. If you find this project helpful, please give it a ⭐️ on GitHub!</sub>
</div>
