# Zoom Clone — Video Conferencing & RBAC Platform

A modern, high-performance Zoom-style video conferencing application built with **Next.js**, **TypeScript**, **Tailwind CSS**, **FastAPI**, **SQLAlchemy**, and **SQLite**.

Features a complete **Role-Based Access Control (RBAC)** admin console and real-time database-driven participant management.

---

## 🌟 Key Features

### 🔐 Authentication & Authorization
- **Multi-Tier Account Roles (`OWNER`, `ADMIN`, `MEMBER`)**:
  - Secure JWT authentication with role claims.
  - Protected frontend routes (`AdminRoute`, `ProtectedRoute`).
  - Strict backend security dependencies gating endpoints (`require_admin`, `require_owner`, `require_meeting_host`).
  - Active user enforcement (`is_active` toggle with immediate session revocation).

### 👨‍💼 Admin Console & Management
- **Overview Dashboard (`/admin`)**: Metrics for total users, active users, total meetings, live active rooms, scheduled sessions, and participant logs.
- **User Account Management (`/admin/users`)**:
  - View all registered users with search and role/status filtering.
  - Modify account roles (`OWNER`, `ADMIN`, `MEMBER`).
  - Enable or disable user accounts.
- **Meeting Supervision (`/admin/meetings`)**: Platform-wide meeting oversight with force-end controls.
- **Participant Attendance Logs (`/admin/participants`)**: Session entry and exit audit logs.

### 🎥 Meeting Management & Live Room
- ⚡ **Instant Meeting Creation**: Click "New Meeting" to generate a unique 9-digit Meeting ID (`XXX XXX XXX`) and shareable URL.
- 🔗 **Join via ID or Invite Link**: Join existing active meetings with display name validation.
- 📅 **Schedule Meetings**: Plan future video meetings with title, description, date, time, and custom durations.
- 🎥 **Interactive Meeting Room & Media Controls**:
  - **Camera & Hardware Settings**: Toggle between real hardware webcam (`getUserMedia`) and simulated feed, select specific camera hardware input devices.
  - **Microphone Input Control**: Select input microphone device, toggle Mute/Unmute audio track with active audio status indicator.
  - **Live Screen Sharing**: Integrated browser Screen Capture API (`getDisplayMedia`) with live presentation view and Stop Sharing controls.
  - **Privileged Host Controls**: Promote/Demote participants (`HOST`, `CO_HOST`, `PARTICIPANT`), kick/remove participants.
  - In-meeting live chat drawer & live participants drawer.
- 📱 **Responsive Dark Mode UI**: High-end dark mode interface optimized across desktop, tablet, and mobile breakpoints.

---

## 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Next.js 16+ (React)                  │
│             TypeScript + Tailwind CSS + Lucide          │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ HTTP / REST API (JWT Auth)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    FastAPI Backend                     │
│               Uvicorn + Pydantic v2 + CORS             │
└───────────────────────────┬────────────────────────────┘
                            │
                            │ ORM Session
                            ▼
┌────────────────────────────────────────────────────────┐
│                     SQLAlchemy ORM                     │
│               Models & Service Layer Logic             │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                    SQLite Database                     │
│                     (zoom_clone.db)                    │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Relationships

### 1. `users` Table
Stores registered accounts and system roles.
- `id` (Integer, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password_hash` (String)
- `account_role` (String — `OWNER` | `ADMIN` | `MEMBER`)
- `is_active` (Boolean)
- `created_at` (DateTime)

### 2. `meetings` Table
Stores instant and scheduled meeting rooms.
- `id` (Integer, Primary Key)
- `meeting_id` (String, Unique, Indexed — 9-digit human readable ID e.g. `482719365`)
- `title` (String)
- `description` (Text, Nullable)
- `host_user_id` (Integer, ForeignKey `users.id`)
- `scheduled_at` (DateTime, Nullable)
- `duration_minutes` (Integer, Nullable)
- `invite_link` (String)
- `status` (String — `scheduled` | `active` | `ended`)
- `created_at` (DateTime)

### 3. `participants` Table
Tracks participants who join meeting rooms.
- `id` (Integer, Primary Key)
- `meeting_id` (Integer, ForeignKey `meetings.id`)
- `user_id` (Integer, ForeignKey `users.id`)
- `display_name` (String)
- `meeting_role` (String — `HOST` | `CO_HOST` | `PARTICIPANT`)
- `joined_at` (DateTime)
- `left_at` (DateTime, Nullable)

---

## 🔌 API Endpoints Reference

Base URL: `http://localhost:8000/api`

### Auth & User Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Login and receive JWT access token |
| `GET` | `/api/auth/me` | Get current authenticated user details |

### Admin Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Get system overview statistics |
| `GET` | `/api/admin/users` | List users with search and role/status filters |
| `PATCH` | `/api/admin/users/{id}/role` | Update user account role (`OWNER`, `ADMIN`, `MEMBER`) |
| `PATCH` | `/api/admin/users/{id}/status` | Enable or disable user account |
| `GET` | `/api/admin/meetings` | Platform-wide meeting management |
| `GET` | `/api/admin/participants` | System-wide attendance log |

### Meeting Endpoints
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/meetings` | Create instant meeting |
| `POST` | `/api/meetings/schedule` | Schedule future meeting |
| `GET` | `/api/meetings/upcoming` | List upcoming scheduled meetings |
| `GET` | `/api/meetings/recent` | List recent & past meetings |
| `GET` | `/api/meetings/{meeting_id}` | Get meeting details by Meeting ID |
| `POST` | `/api/meetings/{meeting_id}/join` | Join meeting & record participant |
| `GET` | `/api/meetings/{meeting_id}/participants` | Get live meeting participants |
| `PATCH` | `/api/meetings/{meeting_id}/participants/{id}/role` | Promote/demote meeting participant |
| `DELETE` | `/api/meetings/{meeting_id}/participants/{id}` | Kick/remove participant from room |

---

## 🚀 Local Setup & Running

### Prerequisites
- Node.js 18+
- Python 3.11+

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server (auto-creates SQLite DB & seeds initial accounts)
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Default Seeded Test Credentials

| Account Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **OWNER** | `owner@example.com` | `admin123` | Full admin console control & user role assignment |
| **ADMIN** | `admin@example.com` | `admin123` | Admin console, manage members, supervise meetings |
| **MEMBER** | `dhiraj@example.com` | `password123` | Standard user; schedule, host, join meetings |
| **MEMBER** | `member@example.com` | `member123` | Standard user |
