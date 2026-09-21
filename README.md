# Abode Tenancy — Modern PG & Hostel Operating System

> **Production-Ready, Modular Monolith Platform for PG & Hostel Owners, Tenants, Kitchen Staff, and Prospective Tenants.**

Built strictly against the 25-module specification in `README (5).md`.

---

## 🌟 Core Persona Experiences & Philosophies

1. **Owner Command Center**: *"What needs my attention today?"*
   - Real-time KPI dashboard: Occupancy %, Rent collection rate, Kitchen headcount, Open complaints.
   - 1-Click Operations center with actionable alerts (overdue rent, unconfirmed meals, pending move-ins).
   - Visual Room & Bed allocation matrix with color-coded live statuses.
   - Batch monthly invoicing and automated offline payment recording with PDF tax receipt generation.
   - QR code generator & printable physical gate flyers.

2. **Tenant "Today" (My Day) Screen**: *"What do I need to do today?"*
   - 1-Tap daily meal confirmation (YES/NO) with cutoff enforcement.
   - Weekly menu planning and dietary schedule preferences.
   - Transparent rent balance, payment history, and instant PDF receipt downloads.
   - In-app maintenance ticket tracker with real-time status updates.
   - 360° digital tenancy record & 30-day vacating notice submission.

3. **Cook High-Contrast Interface**: *"How many people do I need to cook for?"*
   - Giant meal cards with live headcounts (eating vs skipping) and veg/non-veg splits.
   - Big-button state transitions: `START COOKING` ➔ `MARK READY` ➔ `MEAL OVER (DONE)`.
   - Automated rule-based ingredient estimator (Rice kg, Dal kg, Veggies, Cooking Oil).
   - Food waste & leftover tracking logging modal.
   - Multi-language support: **English, తెలుగు (Telugu), ಕನ್ನಡ (Kannada), हिन्दी (Hindi), தமிழ் (Tamil)**.

4. **Public QR Landing Page**: *"Should I join this PG, and how do I join?"*
   - Mobile-first mini listing website accessible instantly via gate QR scans (`/p/:slug`).
   - Real-time vacant bed counters and transparent room sharing pricing.
   - Food menu highlights, facility badges, and house rules.
   - Direct Call & WhatsApp buttons to reach the property manager.
   - Instant digital join request modal for immediate onboarding.

---

## 🛠 Tech Stack & Architecture

- **Backend**: Java 21 LTS, Spring Boot 3.3.4 (Modular Monolith)
- **Database**: PostgreSQL 16 with Flyway migrations and strict `property_id` data isolation
- **Caching & Cutoffs**: Redis 7
- **Security**: Spring Security + JWT Authentication + Strict RBAC
- **PDF Engine**: Apache PDFBox 3.0.3 (Compliant invoice & receipt generation: `PG-<MON>-<ROOM>-<SEQ>`)
- **API Spec**: OpenAPI 3 / Swagger UI (`http://localhost:8080/swagger-ui/index.html`)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons & Heroicons
- **Packaging**: Multi-stage Dockerfiles + Docker Compose

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)

```bash
# Clone and enter directory
cd Abode_Tenancy

# Start all services (PostgreSQL, Redis, Spring Boot Backend, React Frontend)
docker-compose up --build
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api/v1](http://localhost:8080/api/v1)
- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **Gate QR Mini Site**: [http://localhost:3000/p/sri-sai-pg-marathahalli](http://localhost:3000/p/sri-sai-pg-marathahalli)

---

### Option 2: Local Development Setup

#### 1. Backend

```bash
cd backend
export JAVA_HOME=/usr/local/opt/openjdk@21 # Or your Java 21 JDK path
mvn spring-boot:run
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Seed Accounts (1-Click Login Available)

| Persona | Role | Mobile Number | Password | Default Landing Page |
|---|---|---|---|---|
| **Harish Kumar** | `OWNER` | `9876543210` | `Owner@123` | `/owner` (Command Center) |
| **Ramesh Cook** | `COOK` | `9876543211` | `Cook@123` | `/cook` (Kitchen Board) |
| **Rahul Kumar** | `TENANT` | `9876543212` | `Tenant@123` | `/tenant/today` (My Day) |
| **Kiran Reddy** | `TENANT` | `9876543213` | `Tenant@123` | `/tenant/today` (My Day) |
| **Visitor / Guest** | `PUBLIC` | *No login needed* | *No password* | `/p/sri-sai-pg-marathahalli` |

*Note: In test/sandbox mode, SMS OTP verification accepts static OTP `123456`.*

---

## 🛡 Security & RBAC Isolation

- **Role Verification**: Enforced on every controller endpoint using `@PreAuthorize`.
- **Cook Isolation**: Cooks **cannot** view rent ledgers, tenant financial documents, or private tenant PII.
- **Tenant Isolation**: Tenants can **only** view their own invoices, receipts, meal confirmations, and complaints.
- **Negative RBAC Tests**: Validated by automated tests in `SecurityRbacTest.java`.

---

## 🧪 Automated Verification Suite

Run all backend unit and integration tests:

```bash
cd backend
mvn test
```

Build and verify the frontend TypeScript distribution:

```bash
cd frontend
npm run build
```

