# Smart PG / Hostel Platform

> **The Digital Operating System for PGs & Hostels.**
> One platform to discover, join, manage, live in, and operate a PG/Hostel, while reducing food waste and simplifying daily operations.

This README is the **single source of truth** for building the product from scratch to a production-ready application. It consolidates every idea, feature, workflow, screen, rule, phase, and architectural recommendation from three separate design conversations. It is written so that an AI (or a human team) can build the system end to end without needing any other context.

---

## Table of Contents

0. [How to use this document (instructions for the AI builder)](#0-how-to-use-this-document)
1. [Vision, positioning and value proposition](#1-vision-positioning-and-value-proposition)
2. [Product principles and non-goals](#2-product-principles-and-non-goals)
3. [Users, roles and access control (RBAC)](#3-users-roles-and-access-control-rbac)
4. [Product map (the five areas)](#4-product-map)
5. [End-to-end tenant lifecycle and user journeys](#5-end-to-end-tenant-lifecycle-and-user-journeys)
6. [Feature modules (complete specification)](#6-feature-modules-complete-specification)
7. [Role-specific experiences: screens, dashboards and navigation](#7-role-specific-experiences)
8. [Notifications](#8-notifications)
9. [Analytics and insights](#9-analytics-and-insights)
10. [Intelligence (prediction, forecasting, AI)](#10-intelligence-prediction-forecasting-ai)
11. [Phased delivery plan (MVP, Phase 2, Phase 3)](#11-phased-delivery-plan)
12. [Technical architecture](#12-technical-architecture)
13. [Domain model (entities and relationships)](#13-domain-model)
14. [API surface](#14-api-surface)
15. [Security, privacy and non-functional requirements](#15-security-privacy-and-non-functional-requirements)
16. [UI / UX design direction](#16-ui--ux-design-direction)
17. [Step-by-step build plan (scratch to production)](#17-step-by-step-build-plan)
18. [Production-readiness checklist](#18-production-readiness-checklist)
19. [Risks, adoption challenges and business validation](#19-risks-adoption-challenges-and-business-validation)
20. [Product evaluation summary](#20-product-evaluation-summary)
21. [Traceability: coverage of the source conversations](#21-traceability)

---

## 0. How to use this document

**Instructions for the AI builder:**

1. Read the whole document before writing code.
2. Follow the order in **Section 17**. Do not start coding until the "freeze" artifacts (scope, journeys, screens, entities, APIs, architecture) are agreed. Sections 5, 7, 13, 14 and 12 provide these.
3. Build **Phase 1 (MVP) only** first (Section 11). Phase 2 and 3 features are specified so the design leaves room for them, but they are **not** to be built initially.
4. Every feature must answer one of four questions. If a feature does not help one of these workflows, it does not belong in the first version:

| Persona | The question the product must answer |
|---|---|
| **Owner** | "What needs my attention today?" |
| **Tenant** | "What do I need to do today?" |
| **Cook** | "How many people do I need to cook for?" |
| **New tenant** | "Should I join this PG, and how do I join?" |

5. All sample numbers in wireframes (e.g., 86 tenants, ₹72,500 pending) are **illustrative UI data, not real measurements.** Use them for seed/demo data only.
6. Sections marked **(derived)** contain engineering detail added to make the product buildable. They follow the recommendations from the conversations but expand them into concrete implementation guidance. Everything else comes directly from the conversations.

---

## 1. Vision, positioning and value proposition

### 1.1 What the product is

Not "a food-confirmation app". Not "an app with 100 features". It is a **complete PG/Hostel Operations & Tenant Management Platform** in which **food management is the initial differentiator**, and which handles the daily operational workflow between:

**Owner ↔ Tenant ↔ Cook ↔ Prospective Tenant**

### 1.2 Positioning

Do **not** position it as:
- ❌ "Food Waste Management App"
- ❌ "PG Management App"

Position it as: **"The Digital Operating System for PGs & Hostels"** ("A daily operating system for PGs and hostels").

### 1.3 Three pillars (plus intelligence)

| Pillar | Scope |
|---|---|
| 🏠 **Run the Property** | Rooms • Beds • Tenants • Vacancies • Maintenance |
| 💰 **Run the Operations** | Rent • Payments • Complaints • Staff • Documents |
| 🍽️ **Run the Food** | Menus • Meal confirmation • Kitchen • Inventory • Waste reduction |
| 🤖 **Run it Intelligently** (later) | Analytics → Predictions → Automation → AI |

Alternative framing from the conversations (equivalent):
- 🏠 Run the Property: Rooms • Tenants • Rent • Complaints • Vacancies
- 🍽️ Run the Food: Menu • Meal confirmation • Kitchen count • Food feedback • Waste reduction
- 👥 Run the Tenant Experience: Join • Onboard • Pay • Raise issues • Get notifications • Vacate
- 🤖 Run it Intelligently: Predictions • Analytics • Automation • AI

### 1.4 The "final vision" (acceptance picture for the finished product)

An owner opens the app at 8:00 AM. They do not need to check WhatsApp groups. They see:

> **86 tenants | 82 occupied | 4 vacancies | ₹72K rent pending | 3 complaints | Breakfast: 61 | Lunch: 73 | Dinner: 68**

- The **cook** sees: *Breakfast: 61 people*.
- The **tenant** sees: today's menu + meal confirmation + rent + complaints.
- A **person outside the PG** scans a QR code and sees: facilities + price + room availability + food + photos + contact + Join.
- The **owner** controls everything from one system.

The food-waste component provides the initial differentiation. PG operations, tenant management and onboarding give the application enough depth to become a serious SaaS product.

### 1.5 Business value the owner must see (the core business metric)

The product must prove value to the owner. Example monthly summary:

```
THIS MONTH
Occupancy:            92%
Rent collected:       ₹8.4L
Pending rent:         ₹72K
Meals served:         5,240
Estimated food waste: ↓ 18%
Complaints:           34 → 21
Food rating:          4.2 / 5
```

This is what makes it a business product, not "just a CRUD project".

### 1.6 Commercial framing

- **SaaS**, sold as PG-owner subscriptions.
- Scalable from individual PGs → hostels → co-living → larger properties.
- Long-term: PG discovery marketplace layer (Section 6.14), which turns the product from PG-management SaaS into a **discovery + management ecosystem**. **Do not build discovery first.**

---

## 2. Product principles and non-goals

### 2.1 Principles

1. **Daily operating system, not a feature dump.** Every feature must serve the four persona questions (Section 0).
2. **More useful features, not more gimmicky features.**
3. **Each role gets a completely different, purpose-built experience.** The owner has a command-center dashboard; the tenant has a "today" screen; the cook has a giant-button screen; the new tenant has a mini listing website.
4. **Show "what needs attention", not a giant menu.**
5. **One-tap UX for tenants.** If confirming dinner takes 30 seconds, people will stop doing it. If it takes one tap, adoption is realistic.
6. **Owner tools must be substantially easier than WhatsApp + Excel + phone calls + UPI apps + paper registers**, not merely more feature-rich.
7. **Every dashboard chart must answer a question.** No "look how many charts we have."
8. **Rule-based first, AI later.** Do not make AI mandatory for MVP. Don't call it "AI" everywhere; users care about the answer, not whether an LLM was used.
9. **Real data, defensible claims.** Don't claim exact food/₹ savings unless there is a defensible calculation method. Track actual observations (e.g., leftover kg entered by the cook).
10. **Start with a modular monolith**, not microservices.
11. **Security is a product requirement** (rent, deposits, IDs, phone numbers, documents).

### 2.2 Explicit non-goals / "do NOT do"

- ❌ No wallet, coins, points, levels, or artificial gamification (referrals give a **rent discount only**).
- ❌ No complicated financial wallet. Just **rent management + payment + receipts.**
- ❌ No microservices at the start.
- ❌ No AI-mandatory MVP.
- ❌ No giant owner menu on open.
- ❌ No complicated owner dashboard shown to the cook.
- ❌ Do not build PG discovery marketplace first (QR link is the entry point).
- ❌ Do not force prospective tenants through the approval flow only — **always also support direct Call / WhatsApp / Message to owner.**
- ❌ Do not build all ~50 features simultaneously (the biggest risk).
- ❌ Do not over-build emergency information (simple utility).
- ❌ Do not start writing hundreds of APIs before the domain model is designed.
- ❌ Do not claim food-waste savings that the system cannot defend.

---

## 3. Users, roles and access control (RBAC)

### 3.1 Roles

```
SUPER ADMIN
   │
   ├── OWNER
   │     ├── MANAGER
   │     └── COOK
   │
   └── TENANT

PROSPECTIVE TENANT  (public / lightly-authenticated)
```

Also referenced: **Staff** (generic: manager, caretaker, housekeeping, security) and **Security** (visitor view).

```
                SMART PG / HOSTEL PLATFORM
                           │
       ┌───────────────────┼───────────────────┐
     OWNER              TENANT               COOK
                           │
                 PROSPECTIVE TENANT
```

### 3.2 What each role sees

| Role | Sees |
|---|---|
| **Super Admin** | Platform-level administration across owners (derived: owner onboarding, subscriptions, platform health). |
| **Owner** | Everything for their properties: dashboard, properties, rooms/beds, tenants, applications, food, payments, maintenance, announcements, analytics, staff, settings. |
| **Manager / Caretaker** | Operational subset configured by the owner (e.g., housekeeping task updates, complaints, rooms). |
| **Cook** | Only meal counts, menu, cooking status, waste entry, ingredient checklist. |
| **Tenant** | Only their own data: room, rent, meals, complaints, documents, payments, notice, profile. |
| **Prospective Tenant** | Public PG profile only, plus join request and owner contact. |

### 3.3 Hard access rules

**Cook must NOT see:** tenant rent, documents, private tenant information, complaints unrelated to food.

**Tenant must NOT see:** other tenants' rent, owner financial information, private documents (of others).

### 3.4 Owner-controlled staff permissions

Owner can: **add staff, remove staff, set permissions, control who can access tenant information.**

Example permission matrix for a Cook:

```
Cook
 ☑ View meal counts
 ☑ Update meal status
 ☑ View menu
 ☐ View rent
 ☐ View documents
 ☐ View complaints
```

Permissions must be granular and configurable per staff member (derived: implement as a permission set attached to a role assignment scoped by property).

---

## 4. Product map

### 4.1 Five major areas

```
SMART PG / HOSTEL
        │
 ┌──────┼──────────────┐
 │      │              │
DISCOVER  LIVE        OPERATE
 │        │              │
New Tenant Tenant       Owner
 │        │              │
 └──────┬─┴──────────────┘
        │
   FOOD / KITCHEN
        │
       COOK
        │
    ANALYTICS
```

The **Owner Dashboard is the command center.**

### 4.2 Complete product structure

```
SMART PG PLATFORM
        │
 ┌──────┴──────────┬─────────────────┐
 DISCOVERY      MANAGEMENT        OPERATIONS
 QR / Search    Tenants           Food
 PG Details     Rooms             Cook
 Pricing        Rent              Complaints
 Vacancy        Documents         Maintenance
 Facilities     Vacating          Notifications
        │
    ANALYTICS
  Food • Rent • Occupancy
  Waste • Revenue • Complaints
  Trends • Dues • Ratings
```

---

## 5. End-to-end tenant lifecycle and user journeys

### 5.1 Daily usage loop (why the product has natural retention)

```
New Tenant → Discovers PG → Joins → Gets Room → Pays Rent → Confirms Meals
→ Eats Food → Gives Feedback → Raises Issues → Uses PG Services → Eventually Vacates
```

Owner loop: `Manages Property → Rooms → Tenants → Collects Rent → Manages Food → Manages Complaints → Tracks Operations → Analyzes Business`

Cook loop: `Sees Meal Count → Prepares Food → Updates Status → Records Waste`

### 5.2 Seven-step lifecycle

| Step | Flow |
|---|---|
| **1. Discovery** | QR / Link → PG Profile → Facilities, Pricing, Food, Vacancy, Photos, Rules → Interested? |
| **2. Application** | Join Request → Owner Notification → Owner Reviews → Approve / Reject / Contact |
| **3. Onboarding** | Owner assigns Property, Room, Bed, Rent, Deposit, Joining Date → tenant account becomes active |
| **4. Daily Living** | Menu → Meal Confirmation → Kitchen Count → Cooking → Meal → Feedback |
| **5. Monthly Operations** | Rent → Payment → Receipt |
| **6. Issues** | Complaint → Owner → Resolution → Tenant Confirmation |
| **7. Leaving** | Vacating Request → Notice Period → Owner Approval → Final Settlement → Vacated |

### 5.3 Prospective-tenant journey detail

1. Scans "SCAN TO VIEW THIS PG" QR (or opens link).
2. Sees the public profile (facilities, photos, price, vacancy, rules, food, location, FAQs).
3. Either **(a)** Send Joining Request (form) or **(b)** Call / WhatsApp / Message owner directly.
4. Owner receives 🔔 *New Tenant Request* → **[View Profile] [APPROVE] [REJECT] [CONTACT]**.
5. If approved: tenant sees *"Application Approved. Please contact the owner to complete the joining process."*
6. Owner assigns Room/Bed/Rent/Deposit/Joining Date; the tenant account becomes **active**.

---

## 6. Feature modules (complete specification)

The conversations enumerate these **25 modules**:

```
01 Authentication            14 Notifications
02 Property Management       15 Vacating / Notice
03 PG Public Profile         16 Food Feedback
04 Vacancy Management        17 Announcements
05 Tenant Management         18 Documents
06 Room & Bed Management     19 Referrals
07 Tenant Onboarding         20 Analytics
08 Food & Menu Management    21 Food Waste Tracking
09 Meal Confirmation         22 AI Prediction
10 Cook Operations           23 WhatsApp Integration
11 Rent & Payments           24 Multi-Property Management
12 Complaints                25 Staff & Permissions
13 Maintenance
```

The following sections specify each module, plus the extended modules from later conversations (inventory, purchases, vendors, housekeeping, visitors, etc.).

---

### 6.1 Authentication & accounts (Module 01)

- Login for **Owner, Tenant, Cook** (and staff/manager). Prospective tenants use the public page with a light join-request flow.
- Role-based sessions and authorization (Section 3).
- (derived) Phone-number OTP is the natural login in India; email/password for owners/admin; JWT access + refresh tokens; account lockout; audit of logins.
- Tenant account becomes **active** only after the owner approves and assigns room/bed.

### 6.2 Property management (Modules 02, 24)

An owner may have multiple properties:

```
My Properties
├── Sri Sai PG
│    ├── Building A
│    ├── Building B
│    └── Building C
└── Lakshmi Men's Hostel
```

Each **property** has its own: **Rooms, Tenants, Pricing, Food, Complaints, Payments, Staff, Vacancies, Analytics.**

**Multi-property owner (eventually):**

```
Harish Properties
 Property 1  Sri Sai PG        86 tenants
 Property 2  Lakshmi Hostel   124 tenants
 Property 3  Green View PG     62 tenants

Current Property:  Sri Sai PG ▼   (switcher)
```

Also supports buildings and floors.

**Property overview (owner):**

```
Sri Sai PG
Total Rooms        48
Total Beds        120
Occupied Beds     103
Available Beds     17
Occupancy         85.8%
```

### 6.3 Room management (Module 06) — visual room map

```
ROOMS
101 🟢   102 🔴   103 🔴
104 🟡   105 🔴   106 🟢
201 🔴   202 🟢   203 🟡
204 🔴   205 🔴   206 🟢
```

- 🟢 Available   🔴 Full   🟡 Partially occupied

Clicking a room opens **Room Detail** — "the owner's digital room register":

```
Room 204
3 Sharing   Capacity: 3   Occupied: 2   Available: 1
──────────────────────
Tenants
  Rahul Kumar   (Joined: 12 Jan 2026)
  Kiran Reddy   (Joined: 20 Feb 2026)
Rent
  Rahul   PAID
  Kiran   PENDING
Room Issues
  Bathroom tap → IN PROGRESS
Room Actions
  + Add Tenant | Transfer Tenant | Report Maintenance | View History
```

**Owner actions on a room:** Add tenant • Remove tenant • Transfer tenant • View tenant profile • View rent status • View complaints • View joining date • View notice status • Contact tenant • Report maintenance • View history.

### 6.4 Bed-level management

Do not stop at rooms. For shared rooms:

```
Room 204
 Bed A — Rahul
 Bed B — Kiran
 Bed C — AVAILABLE
```

This makes vacancy information exact and feeds the public profile's per-sharing-type availability.

### 6.5 Room transfer

```
Transfer Rahul
Current:  Room 204
Move to:  Room 312
Reason:   Room maintenance
```

The system automatically updates: **room occupancy, tenant room, rent (if applicable), meal records, history.**

### 6.6 Tenant management (Module 05)

**Search:** `🔍 Search tenant "Rahul"`.

**Tenant profile (basic):**

```
Rahul Kumar
Room: 204   Sharing: 3   Joined: 12 Jan 2026
Rent: ₹9,500   Current Month: ✅ Paid
Food Plan: Regular   Notice: No   Complaints: 1 Open
```

**Actions:** Call • Message • Notify rent • View payment history • View complaints • View documents • Change room • Mark vacated.

**Tenant 360° profile** (a complete professional profile, not just name + phone):

```
Rahul Kumar
Room 204 • 3 Sharing
Joined: 12 Jan 2026     ₹9,500/month
Rent: ✅ Current   Food: Regular   Complaints: 1 Open   Notice: None   Documents: 4/4
```

Tabs: **Overview • Payments • Food • Complaints • Documents • Attendance • History**

**Tenant activity history (timeline):**

```
20 Sep  Paid September rent
18 Sep  Raised bathroom complaint
15 Sep  Confirmed dinner
01 Sep  Monthly rent generated
12 Jan  Joined PG
```

### 6.7 Tenant onboarding (Module 07)

On approval, owner assigns:

```
Room: 204   Bed: 3   Rent: ₹9,500   Deposit: ₹15,000   Joining Date: 01 Oct 2026
```

The tenant account becomes active. Tenant's own **profile** shows: Name, Phone, Emergency Contact, PG, Room, Sharing, Joined date, Monthly Rent, Next Due.

### 6.8 PG public profile, QR onboarding, application (Modules 03, 04)

**QR code** placed physically ("SCAN TO VIEW THIS PG"). The page must feel like a **mini PG listing website** (mobile web / PWA):

```
Sri Sai PG   ⭐ 4.3   📍 Marathahalli
[ View Photos ]
₹9,500 / month     2 / 3 / 4 Sharing
```

**Public profile contents:**

- **Basic info:** PG name, Location, Contact, Owner details, Photos, Rules, Gender (men/women/co-ed), Food availability, Timings
- **Facilities:** Wi-Fi, Washing machine, Parking, Power backup, AC, Hot water, Housekeeping, CCTV, Security, Laundry
- **Food:** Breakfast ✅ Lunch ✅ Dinner ✅, Veg / Non-Veg details
- **Pricing:**
  ```
  Single      ₹18,000
  2 Sharing   ₹12,000
  3 Sharing    ₹9,500
  4 Sharing    ₹8,000
  ```
- **Vacancy (live from bed-level data):**
  ```
  2 Sharing  🔴 Full
  3 Sharing  🟢 1 bed available
  4 Sharing  🟢 2 beds available
  ```
  Also owner-facing: "Most vacancies are currently in 4-sharing rooms."
- **Photo gallery** (owner uploads): Exterior, Room, Bathroom, Kitchen, Dining area, Common area, Facilities.
- **PG rules:** e.g., Visitors allowed until 9 PM; No smoking; No loud music after 10 PM; Food timings; Notice period; Deposit policy.
- **Common questions (owner-configurable answers):** Is food included? Electricity included? Wi-Fi included? Parking available? What is the deposit? Notice period? Are visitors allowed?
- **Location / map:** PG location, nearby metro, bus stops, colleges, IT parks, hospitals, grocery stores (integrate maps later).
- **Direct owner contact:** Call Owner • WhatsApp Owner • Message Owner (always available).

**New tenant application form:**

```
Name • Phone • Age • Occupation • Company/College • Preferred Sharing • Expected Joining Date
[ SEND JOINING REQUEST ]
```

**Owner's notification:**

```
🔔 New Tenant Request
Rahul Kumar — Interested in: 3 Sharing — Expected joining: 1 Oct
[ View Profile ] [ APPROVE ] [ REJECT ] [ CONTACT ]
```

The tenant sees the application status.

### 6.9 Vacancy management (Module 04)

```
PROPERTY OCCUPANCY
Total Beds: 120   Occupied: 103   Available: 17

Room 204 — 3 Sharing — 2 Occupied — 1 Available
```

Owner sees a breakdown by sharing type (e.g., 2 Sharing: 2 available, 3 Sharing: 5 available, 4 Sharing: 10 available). This information is exposed to prospective tenants via the public profile.

### 6.10 Rent management & receipts (Module 11)

Keep it simple: **rent management + payment + receipts** (no wallet).

**Owner rent dashboard (month view):**

```
September
Total expected    ₹8,60,000
Collected         ₹7,87,500
Pending              ₹72,500
Overdue              ₹21,000
```
(Paid 79 / Pending 7 / Overdue 3 as counts.) Plus a collection chart.

**Tenant list view:**

| Tenant | Room | Rent | Status |
|---|---|---|---|
| Rahul | 204 | ₹9,500 | Paid |
| Kiran | 204 | ₹9,500 | Pending |
| Ajay | 203 | ₹10,000 | Paid |

**Owner can:** Send rent reminder • View payment • View receipt • **Record offline payment** • View payment history • Set rent amount • Set due date.

**Tenant flow:** Pay Rent → Payment Successful → Receipt Generated. Tenant sees "Rent due in 5 days", next due date, payment history; can download/share receipts.

**Automatic rent workflow (owner-configurable policy):**

```
5 days before due → Reminder
2 days before     → Reminder
Due date          → Payment notification
After due date    → Overdue notification
```

**Rent receipt format:**

```
RENT RECEIPT
Tenant: Rahul Kumar
Room: 204
Amount: ₹9,500
Month: September 2026
Payment Date: 05 Sep 2026
Payment Status: PAID
Receipt ID: PG-SEP-204-001
```

Receipts are downloadable/shareable (PDF). Deposit and final settlement are handled in the vacating flow (6.20). Rent analytics: collection rate, pending amount, overdue amount, month-over-month collection, payment completion, outstanding by tenant, outstanding by room.

### 6.11 Food & menu management (Module 08) — core differentiator

**Owner creates tomorrow's menu with timings:**

```
BREAKFAST  8:00 AM – 10:00 AM   Idli, Vada, Sambar, Chutney
LUNCH     12:30 PM –  2:30 PM   Rice, Dal, Vegetable Curry, Curd
DINNER     7:30 PM –  9:30 PM   Chapati, Paneer Curry, Rice, Dal
```

**Cook/owner can update today's menu:** each meal has **[ Edit ]**, then **POST MENU** → tenants immediately receive the updated menu (notification: "Tomorrow's menu has been posted").

### 6.12 Tenant meal confirmation (Module 09)

Very simple, one-tap:

```
Tomorrow's Meals
Breakfast  ☑ Yes  ☐ No
Lunch      ☑ Yes  ☐ No
Dinner     ☐ Yes  ☑ No
```
or per-meal: `🍳 Breakfast — Will you eat? [YES] [NO]`.

### 6.13 Auto meal preference (reduces friction)

```
Meal Preferences
Breakfast   Weekdays: NO    Weekends: YES
Lunch       Always YES
Dinner      Always YES
```

The system automatically creates the **expected meal count**. Tenants can **override** any day.

### 6.14 Meal cutoff

Owner configures:

```
Breakfast confirmation closes: 9:00 PM previous day
Lunch:  9:00 AM
Dinner: 3:00 PM
```

After cutoff: *"Dinner confirmation closed. Contact owner if necessary."* This prevents unreliable last-minute numbers.

Notification: *"Dinner confirmation closes in 1 hour."*

### 6.15 Cook operations (Module 10)

**Cook app — extremely simple.** No complicated owner dashboard, no graphs, no financial data, no tenant information.

```
TODAY
🍳 BREAKFAST   Prepare for: 62 PEOPLE   ⏰ 8:00 – 10:00 AM
🍚 LUNCH       Prepare for: 71 PEOPLE
🍛 DINNER      Prepare for: 66 PEOPLE
```

**Cooking status:** per meal `[ STARTED ] [ READY ] [ COMPLETED ]` (in "big button" mode: `[ START ] [ READY ] [ FINISHED/DONE ]`). The owner instantly sees `Breakfast 🟢 Ready`.

**Big-button mode (for low-tech users):** enormous buttons, icons, large text, minimal typing; **voice assistance later**; **local-language support later**.

**Multi-language cook UI (practical, valuable in India):** owner selects Cook Language — **English, తెలుగు (Telugu), ಕನ್ನಡ (Kannada), हिन्दी (Hindi), தமிழ் (Tamil)**. Same workflow in the cook's language.

**Cook features (full list):** simple dashboard • meal counts • view/update menu • cooking status • ingredient checklist • waste entry • local language • History.

**Ingredient planning (rule-based first):**

```
Expected: 72 people
Estimated ingredients
  Rice        11 kg
  Dal          4 kg
  Vegetables   8 kg
  Curd         6 kg
  Milk         8 L
```

**Food waste entry by cook (actual observation, not claims):**

```
Breakfast
Leftover food: 2.5 kg
Reason: Low attendance
```
Feeds a food-waste trend over time.

### 6.16 Food command center (owner)

```
TODAY
Breakfast   Confirmed: 61   Expected: 64   Served: —
Lunch       Confirmed: 72   Expected: 74
Dinner      Confirmed: 68   Expected: 70

Food status
Breakfast 🟢 Completed
Lunch     🟢 Ready
Dinner    🟡 Preparation
```

Also on the owner dashboard: a "Today's Meals" panel, e.g., *Breakfast: Confirmed 61 / Expected 67 / Not confirmed 19*.

**Meal attendance analytics:** show patterns, not just today's number (e.g., *Friday dinner attendance is usually 12% lower*, *Food attendance is usually lower on Sunday breakfast*).

### 6.17 Food feedback (Module 16)

After a meal:

```
How was today's dinner?  ⭐ ⭐ ⭐ ⭐ ⭐
Optional: [ Add feedback ]
```

Owner dashboard:

```
Today's Food Rating
Breakfast ⭐ 4.2   Lunch ⭐ 3.8   Dinner ⭐ 4.5
```

Also track **Taste, Quality, Quantity, Variety** (keep the first version simple).

**Broader tenant feedback (not only food):**

```
Food ⭐ 4.2   Cleanliness ⭐ 4.0   Wi-Fi ⭐ 3.8   Maintenance ⭐ 4.1
```
Owner can identify recurring problems.

### 6.18 Inventory, purchases and food cost (owner/cook)

**Inventory** (owner/cook):

```
Rice   Current: 42 kg   Low-stock threshold: 20 kg
Dal    Current: 14 kg   Threshold: 10 kg
Milk   Current: 18 L    Threshold: 10 L

Status: 🟢 Healthy   🟡 Low   🔴 Critical
```

**Purchase management:**

```
Purchase
Rice        50 kg   ₹3,200
Vegetables  35 kg   ₹2,850
Milk        40 L    ₹2,200
```
Store: Supplier, Date, Quantity, Cost, Category, Invoice/photo. Enables eventual food-cost calculation.

**Food cost analytics:**

```
September
Food purchases         ₹1,42,000
Meals served             5,240
Approx food cost/meal    ₹27.10
```
Operational metric, not a gimmick.

### 6.19 Food waste impact (Module 21)

```
FOOD IMPACT — This Month
🍚 Food saved            42 KG
🍽️ Meals optimized       1,240
💰 Est. food cost saved  ₹8,600
```
**Be careful with calculations.** Show exact amounts only with a defensible method (based on cook-entered leftover data and confirmed vs. expected counts). Waste trend reports: e.g., "Monday lunch has consistently higher leftover quantities."

### 6.20 Complaints (Module 12)

**Tenant raises complaint:**

```
Raise Complaint
Category: ○ Plumbing ○ Electricity ○ Wi-Fi ○ Room ○ Bathroom ○ Cleaning ○ Food ○ Other
Description: "Bathroom tap is leaking."
[Optional photo]  [Submit]
```

**Owner receives:**

```
🔴 New Complaint
Room 204 — Bathroom tap leaking
[ View ] [ Assign ] [ Resolve ]
```

**Lifecycle (important):**

```
NEW → ACKNOWLEDGED → IN PROGRESS → RESOLVED → CLOSED
```

Tenant sees: `Complaint #1024 — Status: 🟡 In Progress — Expected resolution: Today`. This avoids tenants repeatedly calling the owner. Tenant confirms resolution.

**Complaint analytics** (e.g., this month 28: Plumbing 9, Electricity 5, Wi-Fi 4, Cleaning 4, Food 3, Other 3), average resolution time.

### 6.21 Maintenance management (Module 13)

More than complaints — a **Maintenance Center**:

- Categories: **Water, Electricity, Plumbing, Wi-Fi, Furniture, Appliances, Cleaning, Other**
- Statuses: **New → Assigned → In Progress → Waiting → Resolved → Closed**
- Room-level maintenance requests ("Report Maintenance" from Room Detail).

**Vendor management:** store Plumber, Electrician, Internet provider, Laundry service, Cleaning service, Food supplier, Water supplier. Per vendor: Contact, Service, Previous work, Amount paid, Last visit.

**Maintenance schedule (recurring):**

```
Water tank cleaning        Every 30 days
AC servicing               Every 6 months
Pest control               Every 3 months
Fire equipment inspection  Every 6 months
```
Dashboard: 🔔 *2 maintenance activities due this week.*

**Housekeeping task board (manager/caretaker updates):**

```
TODAY'S TASKS
☐ Floor cleaning  ☐ Bathroom cleaning  ☐ Common area
☐ Garbage collection  ☐ Kitchen cleaning
```
Housekeeping scope: cleaning schedule, common-area cleaning, room cleaning, bathroom cleaning, laundry area, garbage collection. Tenants can report e.g. "Bathroom hasn't been cleaned."

**Facility / service status (owner posts):**

```
PG Services
Wi-Fi 🟢 Working   Water 🟢 Available   Power 🟢 Available
Laundry 🟡 Maintenance   Hot Water 🟢 Available
```
Reduces repetitive calls.

### 6.22 Announcements (Module 17)

Owner posts e.g. *"Water maintenance tomorrow 10 AM–12 PM."* Targeting: `☑ All tenants ☐ Floor 2 ☐ Room 204`. Types: holiday notice, food changes, maintenance, visitor rules, rent reminders, building notices. All targeted tenants receive a notification. Better than relying on WhatsApp groups.

### 6.23 Vacating / notice management (Module 15)

**Tenant:** Vacate PG → choose Notice Period (**15 Days / 30 Days**) → submit.

**Owner receives:**

```
Vacating Request
Rahul Kumar — Room 204 — Notice: 30 Days — Expected Vacating: 20 Oct 2026
[ Approve ] [ Contact Tenant ]
```

The system automatically tracks the notice period. Tenant sees a transparent status:

```
Vacating Request
Submitted: 20 Sep     Notice period: 30 days
Expected move-out: 20 Oct     Status: Owner Approved ✓
```

**Final checklist:**

```
☐ Room inspection  ☐ Key returned  ☐ Pending rent
☐ Damage assessment  ☐ Deposit settlement  ☐ Final receipt
```

Flow: Vacating Request → Notice Period → Owner Approval → Final Settlement → Vacated. Notification: *"Your notice period ends in 7 days."* Beds freed feed the vacancy forecast ("4 beds may become available next month based on current notices").

### 6.24 Documents (Module 18)

Owner maintains: **ID proof, Joining form, Agreement, Emergency contact, Other required documents.** Tenants upload required documents. **Secure access control is essential.**

**Tenant document vault:** Rent receipts • Agreement • Payment history • Uploaded ID • Joining information — no need to search WhatsApp for old receipts.

### 6.25 Referrals (Module 19)

Keep it simple:

```
Refer a Friend
Share PG with your friend. If your friend joins → you receive ₹500 rent discount.
```
Owner configures **Referral Reward: ₹500**. **No wallet. No points.** Just: successful referral → configured rent discount.

### 6.26 Visitor management

Useful for larger PGs. Tenant adds: Name, Phone, Expected arrival, Expected departure. Owner/security sees *Today's Visitors* (e.g., `Rahul → Friend → 7 PM`). Depends on the PG's rules.

### 6.27 Emergency information

Simple utility: Emergency Contacts — **Owner, Security, Emergency Contact, Police, Ambulance, Fire.**

### 6.28 WhatsApp integration (Module 23) — Phase 2/3

```
Smart PG: Tomorrow's dinner? Reply: YES / NO
Or: "YES DINNER"
```
Backend processes the reply. Treat as Phase 2/3: WhatsApp Business API adds complexity and cost. Also a fallback for tenant meal confirmations.

### 6.29 PG discovery (long-term only)

```
Find PGs   📍 Marathahalli   ₹8K – ₹15K
Sharing: 2 / 3 / 4      Filters: Food, Wi-Fi, Parking, AC
```
Turns the system into PG discovery + management. **Do not build first.**

### 6.30 Tenant calendar and personal statistics

**Calendar (one timeline for everything):**

```
September
20  🍛 Dinner   💰 Rent reminder
21  📢 Maintenance
25  💰 Rent due
30  🍽️ Monthly food summary
```

**Tenant personal stats (useful, no fake levels/points):**

```
This Month
Meals confirmed: 72   Meals attended: 68
Complaints: 2   Resolved: 2   Rent: Paid ✓
```

### 6.31 Analytics, insights, notifications, staff

Covered in Sections 8, 9, 10 and 3.4.

---

## 7. Role-specific experiences

### 7.1 Platform per role

| Role | Platform |
|---|---|
| Tenant | Mobile-first |
| Cook | Mobile-first |
| Owner | Web dashboard + mobile app |
| Prospective tenant | Mobile web / PWA |

### 7.2 Owner — Command Center (dashboard)

The owner opens the app in the morning and must understand in seconds: **"What is happening in my PG today?"** — not a giant menu.

```
Good Morning 👋
Sri Sai PG — Marathahalli    20 September 2026

[ Tenants 86 ] [ Occupied 92% (or 42/48 rooms) ] [ Vacancy 7 ]
[ Rent Due ₹72,500 (7 tenants) ] [ Complaints 3 ] [ Applications 4 ]

Today's Meals
 BREAKFAST  Confirmed 61  Expected 67  Not confirmed 19
 LUNCH      Confirmed 72
 DINNER     Confirmed 68

⚠️ Attention Required / Needs attention
 🔴 3 complaints pending
 🟠 7 tenants have rent pending
 🟠 Room 204 has vacancy / maintenance request
 🟠 4 tenants haven't confirmed dinner
 🟠 4 new joining requests
 🟡 1–2 tenants vacating / notice period ending soon
 🟢 Kitchen preparation updated
```

### 7.3 Owner "Action Center" (strongly recommended)

One intelligent section; **every item is clickable** so the owner never searches menus:

```
Action Center
🔴 3 complaints need attention
🟠 7 rent payments pending
🟠 4 new tenant applications
🟠 Room 204 has a maintenance request
🟡 2 tenants' notice period ending soon
🟢 Breakfast preparation completed
```

### 7.4 "Today's Operations" — the heart of the application

A live operational summary generated every morning; the "brain of the entire system":

```
══════════ TODAY'S OPERATIONS ══════════
🏠 PROPERTY     103 / 120 beds occupied
💰 RENT         7 payments pending
🍳 BREAKFAST    61 confirmed   🟢 Kitchen ready
🍚 LUNCH        72 confirmed   🟡 Preparation
🍛 DINNER       68 confirmed
🔧 ISSUES       3 open complaints
📝 NEW TENANTS  4 applications
🚪 VACATING     2 upcoming
📦 INVENTORY    Rice → 🟢   Milk → 🟡
⚠️ ATTENTION    Room 204 maintenance pending
════════════════════════════════════════
```

### 7.5 Owner navigation (sidebar)

```
SMART PG
⌂ Dashboard
🏢 Properties
   ├── Rooms
   ├── Beds
   └── Vacancies
👥 Tenants
📝 Applications
🍽️ Food
   ├── Menu
   ├── Meals
   ├── Kitchen
   └── Inventory
💰 Payments
   ├── Rent
   └── Receipts
🔧 Maintenance
📢 Announcements
📊 Analytics
👨‍🍳 Staff
⚙️ Settings
```

### 7.6 Tenant — "Today" home screen ("My Day")

Tenants should not see 50 features. Their home focuses on today:

```
Good Morning Rahul 👋
TODAY
🍳 Breakfast  8:00–10:00   ✓ Confirmed
🍚 Lunch      12:30–2:30   Tap to confirm / Not confirmed
🍛 Dinner     7:30–9:30    ✓ Confirmed
──────────────
💰 Rent        Due in 5 days
🔧 Complaint   Bathroom → In Progress
📢 Notice      Water maintenance at 10 AM
```

**"My PG"** groups: My Room • My Rent • My Meals • My Complaints • My Documents • My Payments • My Notice • My Profile.

**Tenant bottom navigation (keep small):** **Home • 🍽️ Meals • 💰 Rent • 🔧 Issues • 👤 Profile.** Everything else lives inside these.

### 7.7 Cook — screens

- **Home ("Today"):** 3 large meal cards with head-counts + START / READY / DONE buttons; View for each meal.
- **Navigation (only):** **Today • Menu • History • Profile.**
- No complicated graphs, no finance, no tenant info.

### 7.8 New tenant — public PG page

QR/link → PG profile (Section 6.8) → Interested? → Join request or direct contact.

---

## 8. Notifications

**Categories (with user-controlled preferences):** All • Rent • Food • Complaints • Maintenance • Announcements • Joining • Vacating.

Useful notifications (don't send random ones):

| Type | Example |
|---|---|
| Food | "Dinner confirmation closes in 1 hour." |
| Rent | "Your rent is due in 3 days." |
| Complaint | "Your plumbing complaint has been resolved." |
| Owner | "Your rent payment has been received." |
| Vacating | "Your notice period ends in 7 days." |
| Menu | "Tomorrow's menu has been posted." |
| Owner alerts | New complaint, new join request, vacating request, low inventory, maintenance due |

Channels: in-app + push (PWA/web push); WhatsApp later (Section 6.28). (derived) SMS/email fallback for critical reminders.

Background jobs drive: meal reminders, cutoff reminders, rent reminders, overdue notices, maintenance-due alerts.

---

## 9. Analytics and insights

Every chart must answer a question:

| Owner asks | Chart |
|---|---|
| Are we making money? | Rent chart |
| Are rooms being utilized? | Occupancy chart |
| Where are problems happening? | Complaint chart |
| How much food should we prepare? | Meal attendance trend |
| Are we wasting food? | Waste trend |
| Where should I act? | Action Center |

**Analytics domains:**

- **Property:** occupancy %, vacancy %, bed utilization, room utilization, new joins, vacates, average stay duration; occupancy trend; vacancy analytics by sharing type.
- **Financial:** rent collected, rent pending, overdue, monthly revenue, food expenditure, maintenance expenditure; collection rate, month-over-month, outstanding by tenant/room.
- **Food:** meals confirmed, meals served, attendance, food cost/meal, waste, food rating, meals planned vs. consumed, estimated waste.
- **Operations:** complaints (open/resolved, avg resolution time), maintenance, staff activity.
- **Tenant:** new tenants, vacated tenants, applications, notice periods.

**Owner Insights** (data-driven, later AI-assisted; not chart dumps):

- Food attendance is usually lower on Sunday breakfast.
- Room 204 has had 3 maintenance complaints this month.
- Rent collection is ₹18,000 below last month at this point in the cycle.
- 4 beds may become available next month based on current notices.

---

## 10. Intelligence (prediction, forecasting, AI)

**Only after collecting real data.** Path: `Historical data → Analytics → Prediction → AI recommendations`.

**Stage A (MVP/Phase 2 — rule-based):** confirmed meals + historical attendance → basic prediction; rule-based ingredient estimates.

**Stage B (Phase 3):** historical data + day of week + menu + holiday + weather → ML/AI prediction.

```
Tomorrow — Dinner
Confirmed: 61     Historical expected: 67
Predicted: 65 ± 4  (or 67; "Recommended preparation: 65–70 servings")
```

**Prediction factors:** day of week • historical attendance • holidays • weekend • tenant behavior • menu • seasonal patterns • (eventually) weather.

**Intelligence features:** meal prediction • ingredient prediction (e.g., "Estimated rice requirement: 10.5 kg") • attendance patterns (e.g., Friday dinner 12% lower) • waste analysis (Monday lunch leftovers) • vacancy forecasting • rent reminders • operational insights • anomaly detection.

---

## 11. Phased delivery plan

### Phase 1 — Real MVP (build only this first)

**Owner:** Login • PG/property • Rooms • Tenants • Vacancy • Menu • Meal counts • Complaints • Rent status
**Tenant:** Login • Today's dashboard • Menu • Yes/No meal confirmation • Complaints • Rent • Receipt • Profile
**Cook:** Login • Breakfast count • Lunch count • Dinner count • Menu • Ready/completed status
**New tenant:** QR • PG profile • Facilities • Pricing • Vacancy • Join request • Contact owner

> "That's already a real product."

### Phase 2

Notifications • Auto meal preferences • Vacating requests • Announcements • Food ratings • Referral system • Maintenance • Documents • Staff management • WhatsApp

(Also natural in Phase 2: bed-level detail/room transfer refinements, tenant 360°, rent automation, housekeeping, vendors, inventory/purchases, visitor management, emergency info.)

### Phase 3 — Intelligence

Historical data → Analytics → Prediction → AI recommendations: food prediction, ingredient planning, attendance patterns, waste analysis, vacancy forecasting, owner insights, anomaly detection, weather.

### Later

Multi-property switcher (design for it from day 1), PG discovery marketplace, maps integration, native mobile apps (React Native) if traction justifies.

---

## 12. Technical architecture

### 12.1 Recommended stack

```
React (TypeScript) PWA  ──REST APIs──►  Spring Boot (modular monolith)
                                          │
                     ┌────────────────────┼─────────────────┐
                 PostgreSQL              Redis        Object storage
                                                      (images/documents)
                                          │
                                   Background jobs
                        (meal reminders, rent reminders, notifications)
```

- **Frontend:** React + TypeScript **PWA first** → React Native later if traction justifies (Option A: React Native for dedicated Android/iOS; Option B: PWA + React — much faster for MVP; **recommended: PWA first**).
- **Backend:** Java + Spring Boot, **modular monolith** (no microservices).
- **Database:** PostgreSQL. **Cache/queues/rate limits:** Redis. **Storage:** S3-compatible for photos/documents. **Background jobs:** scheduled reminders and notifications.

### 12.2 Backend modules (packages)

```
auth  users  owners  properties  rooms  beds  tenants  applications
meals  menus  meal-confirmations  cooks  complaints  maintenance
payments  rent  vacating  notifications  ratings  referrals  analytics
```
(Also as features arrive: inventory, purchases, vendors, housekeeping, announcements, documents, visitors, staff, forecasting.)

### 12.3 (derived) Engineering recommendations

- Java 21 LTS, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA, Flyway migrations, Bean Validation, OpenAPI/Swagger docs.
- Multi-tenant data isolation: every business table carries `owner_id` / `property_id`; all queries are scoped by the caller's property permissions.
- Real-time updates (cook status, meal counts) via SSE or WebSocket.
- Payment gateway supporting UPI/cards (e.g., Razorpay or similar) with server-side signature/webhook verification; idempotent payment records.
- Push via Web Push/FCM; scheduled jobs via Spring `@Scheduled`/Quartz with ShedLock to avoid duplicate runs.
- Frontend: Vite, React Router, TanStack Query, a component library with light/dark themes, i18n (English + Telugu/Kannada/Hindi/Tamil for the cook UI), service worker for PWA install/offline shell.
- Observability: structured logs, Micrometer/Prometheus metrics, health checks, error tracking, uptime alerts. Tests: JUnit + Testcontainers, Vitest/RTL, Playwright E2E. CI/CD with Docker images, staged deploys, DB backups.

### 12.4 Design principle

**Design the domain model before writing hundreds of APIs.** Freeze in this order: **MVP scope → user journeys → screen list → database entities/relationships → API list → system architecture → development phases.**

---

## 13. Domain model

### 13.1 Core hierarchy

```
User
 ├── Owner
 ├── Tenant
 ├── Cook
 └── Staff

Owner
 └── Property
      ├── Room
      │    └── Bed
      │         └── Tenant
      ├── Menu
      ├── Meal
      ├── Complaint
      ├── Payment
      └── Announcement

Tenant
 ├── MealConfirmation
 ├── Payment
 ├── Complaint
 ├── FoodRating
 ├── VacatingRequest
 └── Referral
```

### 13.2 (derived) Entity checklist

| Area | Entities |
|---|---|
| Identity | User, Role, Permission, StaffAssignment, AuditLog |
| Property | Owner/Organization, Property, Building, Floor, Room, Bed, Facility, PropertyRule, FaqItem, Photo, PublicProfile, Pricing (per sharing type) |
| Tenancy | Tenant, Tenancy (bed, rent, deposit, join/vacate dates), EmergencyContact, Document, RoomTransfer, JoinApplication, ActivityEvent |
| Rent | RentCharge (monthly), Payment, Receipt, RentPolicy, ReminderSchedule, Referral, ReferralConfig |
| Food | MealSlot config (timings, cutoffs), Menu, MenuItem, MealPreference, MealConfirmation, MealPrepStatus, FoodRating, WasteEntry, InventoryItem, InventoryTxn, Purchase, PurchaseItem, Supplier/Vendor |
| Operations | Complaint, ComplaintEvent, MaintenanceTicket, MaintenanceSchedule, HousekeepingTask, ServiceStatus, Announcement (+targets), Visitor, VacatingRequest, VacateChecklist |
| Comms | Notification, NotificationPreference, DeviceToken |
| Analytics | Daily/Monthly snapshot tables, Forecast records |

Key relationships: Owner 1—N Property; Property 1—N Room 1—N Bed; Bed 0..1—1 active Tenancy; Tenant 1—N Payment/Complaint/MealConfirmation/Rating; Property 1—N Menu per date/meal.

---

## 14. API surface

**(derived — REST, versioned `/api/v1`, all scoped by property and role):**

| Module | Representative endpoints |
|---|---|
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/otp/request`, `/auth/otp/verify`, `GET /me` |
| Properties | `GET/POST /properties`, `GET/PUT /properties/{id}`, `/properties/{id}/public-profile`, `/properties/{id}/qr` |
| Rooms & beds | `GET/POST /properties/{id}/rooms`, `GET /rooms/{id}`, `POST /rooms/{id}/beds`, `GET /properties/{id}/vacancy` |
| Tenants | `GET/POST /tenants`, `GET /tenants/{id}` (360°), `POST /tenants/{id}/transfer`, `POST /tenants/{id}/vacate` |
| Applications | `POST /public/properties/{id}/applications`, `GET /applications`, `POST /applications/{id}/approve|reject` |
| Menu | `GET/PUT /properties/{id}/menus?date=`, `POST /menus/{id}/post` |
| Meals | `GET/PUT /me/meal-confirmations?date=`, `PUT /me/meal-preferences`, `GET /properties/{id}/meal-counts?date=`, `PUT /meals/{id}/status` |
| Food extras | `POST /meals/{id}/ratings`, `POST /waste-entries`, `GET/PUT /inventory`, `POST /purchases` |
| Rent | `GET /rent?month=`, `POST /rent/{id}/remind`, `POST /payments/initiate`, `POST /payments/webhook`, `POST /payments/offline`, `GET /receipts/{id}` |
| Complaints | `POST /complaints`, `GET /complaints`, `PUT /complaints/{id}/status`, `POST /complaints/{id}/assign` |
| Maintenance | `/maintenance/tickets`, `/maintenance/schedules`, `/vendors`, `/housekeeping/tasks`, `/service-status` |
| Vacating | `POST /vacating-requests`, `PUT /vacating-requests/{id}/approve`, `PUT /vacating-requests/{id}/checklist` |
| Announcements | `POST /announcements`, `GET /announcements` |
| Documents | `POST /tenants/{id}/documents` (signed upload), `GET /documents/{id}` (authorized) |
| Referrals | `POST /referrals`, `GET /referrals`, config under settings |
| Notifications | `GET /notifications`, `PUT /notification-preferences`, `POST /devices` |
| Staff | `GET/POST /staff`, `PUT /staff/{id}/permissions` |
| Analytics | `GET /analytics/dashboard`, `/analytics/occupancy`, `/rent`, `/food`, `/complaints`, `/insights`, `GET /operations/today` |

---

## 15. Security, privacy and non-functional requirements

Once the system handles **rent, receipts, deposits, identity documents, phone numbers, and tenant information**, security is a serious product requirement. Required:

- **Authentication** and **authorization** (RBAC + property-scoped permissions, Section 3).
- **Encryption** in transit (TLS) and at rest; encrypt sensitive fields/documents.
- **Audit logs** for sensitive actions (document access, rent edits, permission changes, offline payments).
- **Access control** for tenant information (owner decides which staff see it).
- **Secure document storage** (private buckets, short-lived signed URLs, virus/size/type checks).
- **Payment verification** (server-side verification of gateway callbacks; idempotency; reconciliation).
- **Tenant isolation:** a tenant sees only their own data; the cook sees nothing of rent/documents/private info.
- (derived) Rate limiting, input validation, secure headers, dependency scanning, secrets management, backups/DR, data-retention and deletion policy, consent for storing IDs, privacy policy/ToS.

Non-functional: responsive, accessible, fast on low-end Android phones and poor networks, real-time where operationally needed, offline-tolerant PWA shell, localization.

---

## 16. UI / UX design direction

Don't make it look like an old-fashioned hostel-management system.

**Design principles:** clean white/neutral surfaces • large cards • strong typography • minimal borders • rounded components • clear status indicators • consistent icons • excellent spacing • responsive layouts • **light + dark mode** • accessible contrast • skeleton loading • empty states • smooth transitions.

**Status color language:** 🟢 healthy/available/done • 🟡 partial/low/in progress • 🟠 pending attention • 🔴 critical/full/urgent.

**Role-specific UX:** owner = command center; tenant = "Today" + 5-tab nav; cook = big buttons, local language; new tenant = listing-style mobile page.

---

## 17. Step-by-step build plan

**Stage 0 — Freeze the blueprint (no code):** confirm MVP scope (Section 11 Phase 1) → user journeys (Section 5) → screen list (Section 7) → entities/relations (Section 13) → API list (Section 14) → architecture (Section 12) → phases.

**Stage 1 — Foundations:** monorepo (`/backend`, `/frontend`, `/infra`), Docker Compose (Postgres, Redis, storage emulator), CI (lint, test, build), Flyway baseline, design system/theme tokens, error-handling and logging conventions.

**Stage 2 — Auth, RBAC and tenancy:** users, roles, OTP/password login, JWT, property-scoped permissions, audit log skeleton. *Accept when:* each role can log in and sees only its allowed routes; unauthorized API calls are rejected in tests.

**Stage 3 — Property, rooms, beds, vacancy:** CRUD, visual room map, room detail, vacancy computation. *Accept when:* occupancy and per-sharing vacancy match seeded data.

**Stage 4 — Tenants and onboarding:** tenant CRUD, assign room/bed/rent/deposit/date, tenant profile, search.

**Stage 5 — Public profile, QR, applications:** public page (facilities, photos, pricing, vacancy, rules, FAQ, contact buttons), QR generation, join request → owner approve/reject/contact → onboarding.

**Stage 6 — Food core:** menu posting with timings, meal confirmation, cutoffs, expected counts, cook dashboard with counts and START/READY/DONE, owner food command center. *Accept when:* tenant one-tap confirmation updates cook count in real time and cutoffs are enforced.

**Stage 7 — Rent and receipts:** monthly rent generation, owner rent dashboard, gateway payment + offline recording, receipt PDF with ID format `PG-<MON>-<ROOM>-<SEQ>`, tenant history. *Accept when:* payment webhooks are verified and idempotent.

**Stage 8 — Complaints:** raise (category, description, photo) → lifecycle → tenant status view → owner Action Center entries.

**Stage 9 — Owner dashboard / Today's Operations / Action Center** aggregating Stages 3–8.

**Stage 10 — MVP hardening and pilot:** security review, load tests, seed/demo data, backups, monitoring, onboarding of one real PG; measure daily use.

**Phase 2 stages:** notifications + background jobs → auto preferences → announcements → ratings/feedback → vacating workflow + checklist → maintenance/vendors/schedules/housekeeping/service status → documents vault → referrals → staff permissions UI → inventory/purchases/food cost/waste tracking → visitors/emergency → WhatsApp.

**Phase 3 stages:** analytics warehouse tables → owner insights → rule-based then ML forecasting (meals, ingredients, vacancy) → anomaly detection → weather features.

---

## 18. Production-readiness checklist

- [ ] All Phase 1 features implemented with automated tests (unit, integration with Testcontainers, E2E).
- [ ] RBAC verified for every endpoint (positive and negative tests); cook/tenant data-leak tests pass.
- [ ] Payments verified server-side, idempotent, reconciled; offline payment audited.
- [ ] Documents stored privately with signed URLs and access logs.
- [ ] Database migrations versioned; backups and restore drill completed.
- [ ] HTTPS everywhere, secrets in a secret manager, rate limiting, security headers.
- [ ] Monitoring, alerting, error tracking, health checks, structured logs.
- [ ] Performance tested on low-end mobile and slow networks; PWA installable.
- [ ] Accessibility, dark mode, empty/loading/error states complete.
- [ ] Notification jobs are reliable, deduplicated, and respect user preferences.
- [ ] Legal: privacy policy, terms, data-retention rules.
- [ ] Pilot with a real PG; adoption metrics: owner daily opens, % tenants confirming meals, cook status updates, complaints closed.

---

## 19. Risks, adoption challenges and business validation

**Five real risks (why it isn't yet "10/10"):**

1. **Feature overload** — the ideas would fill three products. Complex → slow → confusing → hard to test/launch. **Stay with a disciplined MVP.**
2. **Owner adoption** — owners use WhatsApp, Excel, phone calls, UPI apps and paper registers; the app must be substantially easier.
3. **Tenant participation** — food system depends on tenants confirming meals: need **one-tap UX + sensible reminders + auto preferences + WhatsApp fallback.**
4. **Payments and sensitive data** — rent, deposits, IDs, phone numbers require authentication, authorization, encryption, audit logs, access control, secure document storage, payment verification.
5. **Food prediction needs real data** — don't lead with "AI-powered food prediction"; start with confirmed meals + historical attendance, then ML once data exists.

**Execution difficulty:** the biggest risk is trying to build everything simultaneously.

**Startup questions that need real-world validation (not assumptions):** Will owners pay? How much? How hard is onboarding? Will tenants actually use it? What existing solutions do owners use? How much support will each PG require? What is the acquisition cost per PG? Which features create measurable savings?

---

## 20. Product evaluation summary

Overall **⭐ 9.1 / 10** — a strong idea *if built as a PG/Hostel Operating System* rather than only a food-waste app. Software-engineering project value **9.7/10**; portfolio value **9.8/10**; startup potential **8.8/10** (unvalidated).

| Area | Rating | Why |
|---|---|---|
| Problem being solved | 9.5 | Recurring problems around tenants, rent, food, complaints, vacancies, operations |
| Real-world usefulness | 9.5 | Owner, tenant and cook use it daily |
| Food-waste concept | 9.5 | Meal forecasting + confirmation is a strong differentiator |
| Owner value | 9.6 | Centralizes property, tenant, rent, food, maintenance |
| Tenant value | 9.2 | Rent, receipts, food, complaints, notices, documents |
| Cook usability | 9.0 | Simple meal-count workflow is practical |
| New-tenant experience | 9.4 | QR → info → vacancy → application → approval |
| Analytics potential | 9.3 | Occupancy, rent, food, complaints, waste |
| AI potential | 9.4 | Food prediction, inventory forecasting, insights |
| Monetization | 9.0 | Clear SaaS opportunity |
| Scalability | 9.2 | PGs → hostels → co-living → larger properties |
| Technical project value | 9.7 | RBAC, payments, notifications, analytics, real-time, AI |
| UX potential | 9.3 | Purpose-built interface per role |
| India relevance | 9.6 | Rent, food, WhatsApp, shared rooms, QR onboarding, local languages |
| Execution difficulty | 7.5 | Scope control is the main risk |

**Portfolio value:** demonstrates system design, DB design, API architecture, RBAC, authentication, frontend architecture, responsive UI, payment integration, notifications, analytics, AI, real-world workflows, cloud deployment, testing, observability — the full stack from React/TypeScript through Spring Boot, PostgreSQL, storage, payments, real-time and AI/ML to monitoring.

---

## 21. Traceability

Source-conversation coverage map (every numbered point from the three conversations is captured):

| Source topic | Section |
|---|---|
| Product concept, 4 roles, principles, final vision, value proposition | 1, 2, 3 |
| Owner dashboard, Action Center, Today's Operations, sidebar | 7.2–7.5 |
| Property, multi-property, buildings, room map, room detail, bed-level, transfer | 6.2–6.5 |
| Tenant management, 360° profile, activity history, search, actions | 6.6 |
| Rent, receipts, auto reminders, rent dashboard/analytics | 6.10 |
| Food: menu, confirmation, auto preference, cutoff, cook app, status, menu update, ingredients, forecast, feedback, inventory, purchases, food cost, waste, impact | 6.11–6.19, 10 |
| Cook big-button mode, multi-language, navigation | 6.15, 7.7 |
| Complaints & lifecycle, maintenance, vendors, schedules, housekeeping, service status | 6.20, 6.21 |
| Vacating/notice + final checklist | 6.23 |
| Vacancy management, QR, public profile, photos, rules, FAQs, location, application, approval, direct contact | 6.8, 6.9, 5.3 |
| Documents, document vault, tenant profile, tenant calendar, personal stats, tenant nav | 6.24, 6.30, 7.6 |
| Notifications, announcements, emergency info, visitors | 8, 6.22, 6.27, 6.26 |
| WhatsApp, referrals, PG discovery | 6.28, 6.25, 6.29 |
| Analytics (property, financial, food, ops, tenant), insights, dashboard design rules | 9 |
| RBAC, owner security/staff permissions, cook restrictions | 3, 15 |
| Multi-property owner, business metric, positioning, pillars | 1, 6.2 |
| Lifecycle journey (7 steps), daily loops | 5 |
| Phase 1/2/3, tech architecture, backend modules, DB core, PWA vs React Native, modular monolith | 11, 12, 13 |
| UI direction, platforms per role | 16, 7.1 |
| Product ratings, risks, startup validation questions | 19, 20 |
| Blueprint order (scope → journeys → screens → entities → APIs → architecture → phases) | 12.4, 17 |

---

*End of specification. Build Phase 1 first, validate with a real PG, then expand.*
