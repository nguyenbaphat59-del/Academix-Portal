# Academix - Comprehensive Student Portal & Automated Alert System

## Project Overview
Academix is a modern, full-stack web application meticulously designed to help university students optimize their academic workflow. By integrating a dynamic scheduling interface with a reliable backend cron-job system, Academix ensures students never miss a class through automated, timely email notifications.

## Key Features
* Secure Authentication: Seamless user registration and secure login portal.
* Interactive Schedule Dashboard: Manage classes, view weekly and monthly timetables, and organize academic commitments via a clean, responsive UI.
* Automated Email Notifications: Powered by node-cron and nodemailer.
  * Daily Evening Recap: Automatically sends a summary of tomorrow's schedule every day at 21:00.
  * Urgent Class Alerts: Dispatches a precise email reminder exactly 1 hour before any scheduled class begins.
* Cloud-Ready Deployment: Fully optimized for modern cloud hosting environments with separate frontend and backend pipelines.

## Technology Stack
**Frontend Architecture:**
* Core: React, TypeScript, Vite
* Styling: Custom CSS, Responsive Design principles
* Hosting: Vercel (CI/CD integrated)

**Backend Architecture:**
* Core: Node.js, Express.js
* Services: Nodemailer (Gmail SMTP integration), Node-Cron (Task scheduling)
* Security & Config: CORS, Dotenv
* Hosting: Render Web Service

## Project Structure
```text
Academix-Portal/
├── academix-backend/       # Node.js Express Server
│   ├── server.js           # Main application logic & Cron Jobs
│   └── package.json        # Backend dependencies
├── src/                    # React Frontend Source Code
│   ├── AuthPage.tsx        # Authentication UI
│   ├── Dashboard.tsx       # Main portal interface
│   ├── Schedule.tsx        # Timetable management
│   └── SettingPage.tsx     # User configurations
├── vite.config.ts          # Vite bundler configuration
└── package.json            # Frontend dependencies
```

## Getting Started (Local Development)

**1. Clone the repository**
```bash
git clone [https://github.com/nguyenbaphat59-del/Academix-Portal.git](https://github.com/nguyenbaphat59-del/Academix-Portal.git)
cd Academix-Portal
```

**2. Backend Setup**
```bash
cd academix-backend
npm install
```
Create a .env file inside academix-backend with the following variables:
```env
PORT=3000
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```
Start the backend server:
```bash
npm start
```

**3. Frontend Setup**
Open a new terminal at the root directory (Academix-Portal):
```bash
npm install
npm run dev
```

## Production Links
* Frontend (Live Portal): https://academix-phat.vercel.app/
* Backend API: https://academix-portal-2.onrender.com

## Author
Developed and maintained by Nguyễn Bá Phát.
