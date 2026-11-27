# Example University - Student Portal

A full-stack university student portal web application built with Node.js, Express, MongoDB, and vanilla HTML/CSS/JS.

> **Disclaimer**: This is a fictional university portal using entirely **dummy/fake data**. "Example University" is not a real institution. All names, phone numbers, IDs, and other data are completely fabricated.

## Features

- **Landing Page** — Portal selection cards (Student, Employee, Parent, Alumni)
- **Student Login** — With server-generated SVG CAPTCHA, password show/hide toggle
- **Dashboard** — Course attendance table, CGPA stats, proctor message, session timer
- **Profile** — Photo upload, editable student information across 5 sections
- **Sidebar Flyout Menus** — Quick navigation to profile and other modules
- **Security** — JWT in httpOnly cookies, bcrypt password hashing, rate limiting, Helmet headers, upload validation

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Node.js + Express                   |
| Database   | MongoDB + Mongoose                  |
| Frontend   | Vanilla HTML/CSS/JS                 |
| Auth       | JWT (httpOnly cookie) + bcrypt      |
| Upload     | Multer (images only, 2MB max)       |
| Security   | Helmet, express-rate-limit, CORS    |
| CAPTCHA    | Server-side SVG generation          |

## Prerequisites

- **Node.js** v18+ (tested with v20+)
- **MongoDB** v6+ running locally or a remote URI
- **npm** v9+

## Setup & Run

### 1. Clone / Download

```bash
cd university-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env if needed (defaults work for local development):
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/university_portal
# JWT_SECRET=change_this_to_a_secure_random_string
# SESSION_TIMEOUT_MINUTES=30
```

### 4. Start MongoDB

Make sure MongoDB is running on your machine:

```bash
# If using mongod directly:
mongod

# Or if using MongoDB as a service, it should already be running
```

### 5. Seed Demo Data

```bash
npm run seed
```

This creates a demo student account with **fake data only**.

### 6. Start the Server

```bash
npm start

# Or for development with auto-reload:
npm run dev
```

### 7. Open in Browser

Navigate to: **http://localhost:3000**

## Demo Account

| Field             | Value                              |
|-------------------|------------------------------------|
| Register Number   | `DEMO0001`                         |
| Password          | `demo123`                          |
| Name              | Alex Johnson (fictional)           |
| Program           | B.Tech. Information Technology     |
| CGPA              | 8.56                               |

## Project Structure

```
university-portal/
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── server.js             # Express server entry point
├── seed.js               # Database seeding script
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   ├── rateLimiter.js    # Login rate limiting
│   └── upload.js         # Multer photo upload config
├── models/
│   └── Student.js        # Mongoose schema with nested subdocs
├── routes/
│   ├── auth.js           # POST /api/auth/captcha, login, logout
│   ├── student.js        # GET/PUT /api/me, POST /api/me/photo
│   └── courses.js        # GET /api/courses
├── utils/
│   └── captcha.js        # SVG CAPTCHA generator
├── uploads/              # Uploaded student photos
└── public/
    ├── index.html        # Landing page
    ├── login.html        # Login page
    ├── dashboard.html    # Student dashboard
    ├── profile.html      # Student profile
    ├── css/
    │   └── styles.css    # Complete stylesheet
    └── js/
        ├── landing.js    # Landing page logic
        ├── login.js      # Login form handling
        ├── dashboard.js  # Dashboard data loading & UI
        └── profile.js    # Profile editing & photo upload
```

## API Endpoints

| Method | Endpoint              | Auth | Description                        |
|--------|-----------------------|------|------------------------------------|
| POST   | `/api/auth/captcha`   | No   | Generate new CAPTCHA               |
| POST   | `/api/auth/login`     | No   | Authenticate student               |
| POST   | `/api/auth/logout`    | No   | Clear auth cookie                  |
| GET    | `/api/me`             | Yes  | Get current student profile        |
| PUT    | `/api/me/header`      | Yes  | Update program, email, school      |
| PUT    | `/api/me/:section`    | Yes  | Update profile section             |
| POST   | `/api/me/photo`       | Yes  | Upload profile photo               |
| GET    | `/api/courses`        | Yes  | Get courses, credits, CGPA         |

## Security Notes

- Passwords are hashed with **bcrypt** (10 salt rounds)
- JWT tokens stored in **httpOnly** cookies (not accessible to JavaScript)
- Login rate-limited to **10 attempts per 15 minutes** per IP
- **Helmet** adds security headers
- Photo uploads restricted to **images only** (JPEG, PNG, GIF, WebP), **2MB max**
- Government ID numbers are **masked** (only last 4 digits shown)
- Password hash is **never returned** in API responses

## License

MIT — This is a demo/educational project.
