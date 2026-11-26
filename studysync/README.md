# StudySync

An intelligent student collaboration platform that connects learners with compatible study partners, study groups, shared academic resources, and scheduled study sessions.

## Tech Stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, React Router v6, Axios, Lucide React, React Hot Toast
- **Backend:** Node.js, Express 4, SQLite (`better-sqlite3`), JWT (`jsonwebtoken`), `bcryptjs`, Multer, Morgan, CORS, dotenv

## Features

1. **Intelligent Partner Matchmaking:** Calculates compatibility scores between students based on shared subjects, interests, academic goals, availability slots, and college/course context.
2. **Guided Student Onboarding:** Multi-step onboarding flow to capture academic details, subjects, interests, goals, and study availability.
3. **Study Groups & Membership Management:** Create public or private study groups, browse and filter groups, request to join, approve/reject members, and manage group roles.
4. **Shared Resource Library:** Upload, browse, filter, and download study notes, slides, and reference files (with download tracking and group association).
5. **Study Session Scheduling:** Schedule upcoming study sessions with date, time, location, and participant limits, and RSVP (join/leave) to sessions.
6. **Real-Time Notifications Center:** Receive notifications for group join requests, approvals, and session updates with unread counts and mark-as-read actions.
7. **Personalized Dashboard:** Unified overview of recommended study partners, active groups, upcoming sessions, and recent notifications.
8. **User Profiles & Account Settings:** View peer profiles with compatibility breakdowns, edit your own profile, and manage account preferences.
9. **JWT Authentication:** Secure registration and login with bcrypt password hashing and persistent token-based sessions.

## Installation

1. **Clone or open the project directory:**
   ```bash
   cd studysync
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Seed the SQLite database with demo data:**
   ```bash
   npm run seed
   ```
   *(This creates `studysync.db` in `server/` with 6 demo students, study groups, resources, sessions, and notifications.)*

4. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

## How to Run

1. **Start the Backend Server (Port 5000):**
   ```bash
   cd server
   npm start
   ```
   The API server will run at `http://localhost:5000` (health check at `http://localhost:5000/api/health`).

2. **Start the Frontend Dev Server (Port 5173):**
   ```bash
   cd client
   npm run dev
   ```
   Open `http://localhost:5173` in your browser. Vite automatically proxies `/api` and `/uploads` requests to `http://localhost:5000`.

## Demo Credentials

All demo accounts share the password **`password123`**:

| Name | Email | College & Course | Year | Password |
| :--- | :--- | :--- | :---: | :--- |
| Priya Sharma | `priya@university.edu` | IIT Delhi — B.Tech CSE | 3 | `password123` |
| Rahul Patel | `rahul@university.edu` | IIT Delhi — B.Tech CSE | 3 | `password123` |
| Seed Singh | `seed@university.edu` | IIT Delhi — B.Tech IT | 2 | `password123` |
| Arjun Kumar | `arjun@university.edu` | IIT Delhi — B.Tech ECE | 4 | `password123` |
| Sneha Reddy | `sneha@university.edu` | IIT Delhi — MCA | 1 | `password123` |
| Vikram Gupta | `vikram@university.edu` | IIT Delhi — B.Tech CSE | 2 | `password123` |

## API Documentation Summary

All protected endpoints require an `Authorization: Bearer <token>` header.

- **Health**
  - `GET /api/health` — Server health check
- **Authentication (`/api/auth`)**
  - `POST /api/auth/register` — Register a new student account
  - `POST /api/auth/login` — Authenticate and receive a JWT token
- **Users & Matchmaking (`/api/users`)**
  - `GET /api/users/me` — Get current authenticated user profile
  - `PUT /api/users/me` — Update current user profile / onboarding data
  - `GET /api/users` — List & search compatible study partners
  - `GET /api/users/:id` — Get a specific user's public profile
  - `GET /api/users/:id/compatibility` — Get compatibility score breakdown with a user
- **Study Groups (`/api/groups`)**
  - `GET /api/groups` — List & filter study groups
  - `POST /api/groups` — Create a new study group
  - `GET /api/groups/:id` — Get group details and members
  - `PUT /api/groups/:id` — Update group details
  - `DELETE /api/groups/:id` — Delete a group
  - `POST /api/groups/:id/join` — Join or request to join a group
  - `POST /api/groups/:id/leave` — Leave a group
  - `PUT /api/groups/:id/members/:userId` — Approve/update member status or role
  - `DELETE /api/groups/:id/members/:userId` — Remove or reject a member
- **Resources (`/api/resources`)**
  - `GET /api/resources` — List & filter shared resources
  - `POST /api/resources` — Upload a new resource (`multipart/form-data`)
  - `GET /api/resources/:id` — Get resource metadata
  - `GET /api/resources/:id/download` — Download a resource file
  - `DELETE /api/resources/:id` — Delete a resource
- **Study Sessions (`/api/sessions`)**
  - `GET /api/sessions` — List study sessions
  - `POST /api/sessions` — Create a new study session
  - `GET /api/sessions/:id` — Get session details and participants
  - `PUT /api/sessions/:id` — Update a study session
  - `DELETE /api/sessions/:id` — Delete a study session
  - `POST /api/sessions/:id/join` — RSVP / join a study session
  - `POST /api/sessions/:id/leave` — Leave a study session
- **Notifications (`/api/notifications`)**
  - `GET /api/notifications` — List notifications for the current user
  - `GET /api/notifications/count` — Get unread notification count
  - `PUT /api/notifications/read-all` — Mark all notifications as read
  - `PUT /api/notifications/:id/read` — Mark a specific notification as read

## Project Structure

```text
studysync/
├── README.md
├── server/
│   ├── package.json
│   ├── studysync.db              # Generated after running seed/server
│   ├── uploads/                  # Uploaded study resources
│   └── src/
│       ├── index.js              # Express app entry point
│       ├── seed.js               # Database seeding script
│       ├── config/
│       │   └── database.js       # SQLite connection & schema setup
│       ├── middleware/
│       │   ├── auth.js           # JWT authentication middleware
│       │   └── upload.js         # Multer file upload configuration
│       ├── routes/
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── groups.js
│       │   ├── resources.js
│       │   ├── sessions.js
│       │   └── notifications.js
│       └── utils/
│           └── matchmaking.js    # Compatibility scoring algorithm
└── client/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── constants.js
        ├── api/
        │   └── axios.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── layout/           # AppLayout, Sidebar, Topbar
        │   ├── shared/           # GroupCard, NotificationItem, PartnerCard, ResourceCard, SessionCard
        │   └── ui/               # Avatar, Badge, Button, Card, EmptyState, Input, LoadingSpinner, Modal
        └── pages/                # Landing, Login, Register, Onboarding, Dashboard, FindPartners,
                                  # Groups, GroupDetails, Resources, Sessions, Profile, UserProfile,
                                  # Notifications, Settings
```
