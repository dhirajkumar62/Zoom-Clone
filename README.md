# Zoom Clone

A full-stack real-time video conferencing platform inspired by Zoom, built to provide secure online meetings with authentication, role-based access control, meeting management, and real-time participant communication.

## 🚀 Features

### 🔐 Authentication & Authorization

* User registration and login
* Secure password authentication
* JWT-based authentication
* Protected routes
* Role-based access control
* Automatic authentication validation
* Only authenticated users can access protected meeting features

### 👥 Role-Based Access

The application supports different user roles:

#### Admin

* Access to the admin dashboard
* View all registered users
* View all meetings
* Manage users
* Manage meetings
* Monitor meeting activity
* Control platform-level resources

#### User

* Register and log in securely
* Create meetings
* Join meetings
* View available meetings
* See authenticated participants
* Participate in real-time meetings
* Manage their own meeting activity

### 🎥 Meeting Management

* Create meetings
* Generate unique meeting IDs
* Join meetings using a meeting ID
* View meeting details
* Track meeting participants
* End/leave meetings
* Display authenticated users in meetings

### 💬 Real-Time Communication

* Real-time participant updates
* Real-time meeting communication
* WebSocket/WebRTC-based communication
* Dynamic participant list
* User presence during meetings

### 🛡️ Security

* JWT authentication
* Password hashing
* Protected API endpoints
* Role-based API authorization
* Authentication middleware
* Environment variables for sensitive configuration
* Server-side validation

---

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │   React / Vite       │
                    └──────────┬───────────┘
                               │
                         REST API / WebSocket
                               │
                    ┌──────────▼───────────┐
                    │       Backend        │
                    │ Node.js + Express    │
                    └───────┬───────┬──────┘
                            │       │
                   ┌────────▼─┐   ┌─▼──────────┐
                   │ Database │   │ Real-Time  │
                   │  SQLite  │   │ WebRTC /   │
                   │          │   │ WebSocket  │
                   └──────────┘   └────────────┘
```

---

## 📂 Project Structure

```text
Zoom-Clone/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── utils/
│   │   └── App.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   ├── services/
│   ├── database/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Tailwind CSS
* WebRTC
* WebSocket

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt
* WebSocket

### Database

* SQLite

SQLite is used to store application data such as:

* Users
* Roles
* Meetings
* Meeting participants
* Authentication-related information
* Meeting metadata

For local development, the SQLite database can be stored as a local `.db` file.

> For production deployment, the database strategy should be reviewed depending on the hosting environment. If the deployment platform has ephemeral storage, use a persistent database such as PostgreSQL rather than relying on a local SQLite file.

---

## 🔑 Role-Based Access Flow

```text
User
 │
 ├── Register
 │
 └── Login
      │
      ▼
 Authentication
      │
      ▼
 JWT Token
      │
      ▼
 Role Verification
      │
      ├───────────────┐
      │               │
    Admin            User
      │               │
      ▼               ▼
Admin Dashboard    User Dashboard
      │               │
      ├── Users       ├── Create Meeting
      ├── Meetings    ├── Join Meeting
      ├── Manage      ├── View Meetings
      └── Control     └── Participate
```

---

## 🗄️ Database Design

The application uses SQLite for development.

### Users

```text
users
├── id
├── name
├── email
├── password
├── role
├── created_at
└── updated_at
```

Possible roles:

```text
admin
user
```

### Meetings

```text
meetings
├── id
├── meeting_id
├── title
├── host_id
├── status
├── created_at
└── ended_at
```

### Participants

```text
participants
├── id
├── meeting_id
├── user_id
├── joined_at
└── left_at
```

### Relationships

```text
User
 │
 ├──────────< Meetings
 │             │
 │             └──────────< Participants
 │                            │
 └────────────────────────────┘
```

---

## 🔐 Authentication Flow

```text
Register
   │
   ▼
Validate User
   │
   ▼
Hash Password
   │
   ▼
Store User
   │
   ▼
Login
   │
   ▼
Verify Credentials
   │
   ▼
Generate JWT
   │
   ▼
Client Stores Token
   │
   ▼
Protected API Request
   │
   ▼
JWT Middleware
   │
   ▼
Role Middleware
   │
   ▼
Access Resource
```

---

## 👨‍💼 Admin Dashboard

The admin dashboard provides centralized control over the platform.

Admin can:

* View total registered users
* View active users
* View all meetings
* View meeting participants
* View meeting status
* Manage users
* Manage meetings
* Monitor platform activity
* Restrict unauthorized access

Example dashboard:

```text
Admin Dashboard

-----------------------------------------
 Total Users        Active Meetings
    250                   18

-----------------------------------------
 Users
 ----------------------------------------
 ID | Name       | Email       | Role
 ----------------------------------------
 1  | John       | john@...    | User
 2  | Alex       | alex@...    | User
 3  | Admin      | admin@...   | Admin

-----------------------------------------
 Meetings
 ----------------------------------------
 Meeting ID | Host | Participants | Status
 ----------------------------------------
 123456     | John | 12           | Active
 987654     | Alex | 5            | Ended
```

---

## 👤 User Meeting Flow

```text
User Login
    │
    ▼
User Dashboard
    │
    ├── Create Meeting
    │       │
    │       ▼
    │   Meeting ID
    │
    └── Join Meeting
            │
            ▼
       Authentication
            │
            ▼
       Meeting Room
            │
            ├── Camera
            ├── Microphone
            ├── Participants
            └── Leave Meeting
```

---

## 🌐 API Endpoints

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Users

```http
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
```

### Meetings

```http
POST   /api/meetings
GET    /api/meetings
GET    /api/meetings/:id
PUT    /api/meetings/:id
DELETE /api/meetings/:id
POST   /api/meetings/:id/join
POST   /api/meetings/:id/leave
```

### Admin

```http
GET    /api/admin/users
GET    /api/admin/meetings
GET    /api/admin/statistics
DELETE /api/admin/users/:id
DELETE /api/admin/meetings/:id
```

> Exact endpoint names may vary depending on the implementation.

---

## ⚙️ Environment Variables

Create a `.env` file in the backend directory.

```env
PORT=5000

JWT_SECRET=your_secure_jwt_secret

DATABASE_URL=./database/database.sqlite

CLIENT_URL=http://localhost:5173

NODE_ENV=development
```

Never commit the `.env` file to GitHub.

Add it to `.gitignore`:

```gitignore
.env
node_modules/
*.sqlite
*.sqlite3
dist/
```

---

## 💻 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Zoom-Clone.git
```

```bash
cd Zoom-Clone
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Create:

```text
backend/.env
```

Add the required environment variables.

### 4. Start the backend

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

### 6. Start frontend

```bash
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

---

## 🧪 Testing

Test the API using tools such as:

* Postman
* Thunder Client
* Browser DevTools

Example:

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

After successful authentication, the server returns an authentication token.

The token is then used for protected requests.

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 🚀 Deployment

The application can be deployed using separate frontend and backend services.

### Frontend

Possible platforms:

* Vercel
* Netlify

### Backend

Possible platforms:

* Render
* Railway
* AWS
* VPS

### Production Database

For production, a persistent database such as:

* PostgreSQL
* MySQL

is recommended instead of local SQLite when deploying to infrastructure with ephemeral filesystems.

### Production Architecture

```text
                  Internet
                     │
                     ▼
              ┌──────────────┐
              │   Frontend   │
              │   Vercel     │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   Backend    │
              │ Render/AWS   │
              └──────┬───────┘
                     │
              ┌──────▼───────┐
              │ PostgreSQL   │
              │  Database    │
              └──────────────┘
```

---

## 🔒 Security Considerations

The project follows several security practices:

* Password hashing using bcrypt
* JWT-based authentication
* Protected routes
* Role-based authorization
* Input validation
* Secure environment variables
* CORS configuration
* Authentication middleware
* Server-side permission validation

Frontend role checks should **never** be treated as the primary security mechanism. Every sensitive admin operation must also be protected by backend authorization middleware.

---

## 📸 Application Modules

The project contains the following major modules:

```text
Authentication
     │
     ├── Register
     ├── Login
     └── Logout

Dashboard
     │
     ├── Admin Dashboard
     └── User Dashboard

Meetings
     │
     ├── Create
     ├── Join
     ├── Leave
     └── Manage

Real-Time
     │
     ├── Video
     ├── Audio
     ├── Participants
     └── Presence

Administration
     │
     ├── Users
     ├── Meetings
     └── Platform Management
```

---

## 🎯 Future Improvements

* Screen sharing
* Meeting recording
* Chat during meetings
* Meeting scheduling
* Email invitations
* Waiting room
* Host controls
* Mute/unmute participants
* Remove participant
* Meeting passwords
* Breakout rooms
* Cloud recording
* Notifications
* Analytics dashboard
* PostgreSQL production database
* Redis for scalable real-time sessions
* TURN/STUN infrastructure for reliable WebRTC connections

---

## 📚 Learning Objectives

This project demonstrates practical experience with:

* Full-stack web development
* React.js
* Node.js
* Express.js
* REST APIs
* Authentication
* JWT
* Role-based authorization
* Database design
* SQLite
* WebSockets
* WebRTC
* Real-time communication
* API security
* Deployment
* Production architecture

---

## 🤝 Contributing

Contributions are welcome.

```bash
git checkout -b feature/new-feature
```

Make your changes and commit:

```bash
git add .
git commit -m "Add new feature"
```

Push the branch:

```bash
git push origin feature/new-feature
```

Then create a Pull Request.

---

## 📄 License

This project is intended for educational and development purposes.

---

## 👨‍💻 Author

**Dhiraj Kumar**

Computer Science & Engineering Student

GitHub: `https://github.com/dhirajkumar62`

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

