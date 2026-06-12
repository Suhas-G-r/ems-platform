# 🚀 Employee Management System (EMS) - Complete Implementation Guide

## 📋 Project Overview

A modern, enterprise-grade Employee Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). Features role-based dashboards for administrators and employees, real-time notifications, performance analytics, and AI-powered insights.

**Live Demo:** http://localhost:3000 (when running)

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with custom CSS variables
- **UI Components:** Custom components with glassmorphism design
- **State Management:** React hooks + Context API

### **Backend**
- **Runtime:** Node.js (Next.js API Routes)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** Built-in Next.js validation

### **Database**
- **Database:** MongoDB Atlas (Cloud)
- **ODM:** Mongoose
- **Connection:** MongoDB Node.js driver

### **AI Features**
- **Performance Summaries:** AI-generated employee insights
- **Sentiment Analysis:** Feedback analysis
- **Smart Responses:** Auto-generated leave approval/rejection messages
- **Dashboard Briefings:** Automated performance reports

### **Additional Tools**
- **Icons:** Lucide React
- **Charts:** Recharts
- **Notifications:** Real-time polling system
- **Search:** Global search with filters

---

## ✨ Core Features Implemented

### 🏠 **Landing Page**
- Premium hero section with call-to-action
- Feature highlights and testimonials
- Responsive design with dark mode

### 🔐 **Authentication System**
- **Signup:** User registration with role selection
- **Login:** JWT-based authentication
- **Role-based routing:** Admin vs Employee dashboards
- **Session management:** Secure token storage

### 👨‍💼 **Admin Dashboard**
- **Statistics Overview:** Total employees, pending requests, active tasks
- **AI Daily Briefing:** Automated performance summaries
- **Task Assignment:** Create and assign tasks to employees
- **Leave Management:** Approve/reject leave requests with AI suggestions
- **Employee Management:** View and manage all employees
- **Performance Analytics:** Detailed performance metrics and trends
- **Attendance Overview:** Calendar view with correction requests

### 👨‍💻 **Employee Dashboard**
- **Attendance Tracking:** One-click check-in/check-out
- **Task Management:** View and update assigned tasks
- **Leave Requests:** Submit leave applications
- **Performance View:** Personal performance metrics
- **Profile Management:** Update personal information
- **Feedback System:** Submit feedback with sentiment analysis

### 🔔 **Real-Time Notifications**
- **12 Event Types:** Task assignments, leave approvals, attendance reminders, etc.
- **Real-time Updates:** 30-second polling for new notifications
- **Mark as Read:** Individual and bulk read operations
- **Navigation:** Click notifications to navigate to relevant pages

### 📊 **Performance Analytics**
- **Scoring Formula:** Tasks (40%) + Attendance (30%) + Punctuality (20%) + Speed (10%)
- **Grade System:** A+, A, B, C, D based on scores
- **Department Analytics:** Team performance insights
- **Trend Analysis:** Monthly/yearly performance trends

### 🔍 **Smart Search & Filters**
- **Global Search:** Search across employees, tasks, and leaves
- **Advanced Filters:** Status, priority, date ranges, departments
- **Keyboard Shortcuts:** Ctrl+K / Cmd+K to open search
- **Categorized Results:** Organized search results

### 👤 **Employee Self-Service**
- **Profile Updates:** Phone, address, DOB, gender
- **Password Changes:** Secure password updates
- **Work History:** Task completion, attendance, leave history
- **Configurable Time Ranges:** 1-12 month history views

---

## 🗄️ Database Schema (MongoDB Atlas)

### **User Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String ("ADMIN" | "EMPLOYEE"),
  avatarUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **EmployeeDetails Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  department: String,
  designation: String,
  salary: Number,
  joiningDate: Date,
  phone: String,
  address: String,
  city: String,
  postalCode: String,
  dateOfBirth: Date,
  gender: String
}
```

### **Attendance Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String ("PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE"),
  createdAt: Date
}
```

### **Task Collection**
```javascript
{
  _id: ObjectId,
  assignedToUserId: ObjectId (ref: User),
  assignedByUserId: ObjectId (ref: User),
  title: String,
  description: String,
  status: String ("TODO" | "IN_PROGRESS" | "DONE"),
  priority: String ("LOW" | "MEDIUM" | "HIGH"),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **LeaveRequest Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String ("PENDING" | "APPROVED" | "REJECTED"),
  adminComment: String,
  approvedBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### **Notification Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (12 event types),
  title: String,
  message: String,
  isRead: Boolean,
  relatedId: ObjectId,
  createdAt: Date
}
```

### **PerformanceMetrics Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  month: Number,
  year: Number,
  taskScore: Number,
  attendanceScore: Number,
  punctualityScore: Number,
  speedScore: Number,
  totalScore: Number,
  grade: String,
  createdAt: Date
}
```

### **Feedback Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  content: String,
  sentiment: String ("POSITIVE" | "NEUTRAL" | "NEGATIVE"),
  date: Date,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/reset-password` - Password reset

### **Users**
- `GET /api/users` - Get all users (admin) or profile (employee)
- `GET /api/users/[id]` - Get specific user details
- `PATCH /api/profile/update` - Update profile information
- `PATCH /api/profile/change-password` - Change password

### **Attendance**
- `GET /api/attendance` - Get attendance history
- `POST /api/attendance` - Check-in/check-out
- `PATCH /api/attendance/[id]` - Update attendance record

### **Tasks**
- `GET /api/tasks` - Get tasks (assigned to user or all for admin)
- `POST /api/tasks` - Create new task (admin)
- `PATCH /api/tasks/[id]` - Update task status
- `DELETE /api/tasks/[id]` - Delete task

### **Leaves**
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `PATCH /api/leaves/[id]` - Approve/reject leave (admin)

### **Notifications**
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/[id]/read` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

### **Performance**
- `GET /api/performance` - Get performance metrics
- `GET /api/performance/all` - Get all employees performance (admin)
- `GET /api/performance/trends` - Get performance trends
- `POST /api/performance/recalculate` - Recalculate scores

### **Search**
- `GET /api/search` - Global search
- `GET /api/search/filters` - Get filter options

---

## 🔄 User Workflows

### **Employee Workflow**
1. **Registration:** Sign up with email, password, and role
2. **Daily Login:** Authenticate and access dashboard
3. **Check-in:** One-click attendance tracking
4. **Task Management:** View and update assigned tasks
5. **Leave Requests:** Submit leave applications
6. **Profile Updates:** Manage personal information
7. **Feedback:** Submit work feedback
8. **Check-out:** End of day attendance

### **Admin Workflow**
1. **Dashboard Overview:** View AI-generated daily briefing
2. **Employee Management:** Monitor all employees
3. **Task Assignment:** Create and assign tasks
4. **Leave Approval:** Review and respond to leave requests
5. **Performance Monitoring:** Analyze team performance
6. **Attendance Oversight:** Manage attendance corrections
7. **Reports Generation:** View analytics and reports

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js v18 or higher
- MongoDB Atlas account (free tier available)

### **Environment Configuration**
Create `.env.local` in the `ems-web` directory:

```env
MONGODB_URI=mongodb+srv://emsadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
JWT_SECRET=ems-super-secret-key-2026-change-in-production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Installation Steps**
1. **Clone/Navigate to project:**
   ```bash
   cd "c:\Users\SUHAS G R\Documents\Desktop\EMP - Management-SYS\ems-web"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access application:**
   - Frontend: http://localhost:3000
   - API endpoints: http://localhost:3000/api/*

### **MongoDB Atlas Setup**
1. Create account at https://mongodb.com/atlas
2. Create free cluster
3. Set up database user and network access
4. Get connection string and update `.env.local`

---

## 🧪 Testing Guide

### **Quick Test Flow**

#### **1. Create Employee Account**
- Visit: http://localhost:3000/signup
- Fill: Name, Email (employee@test.com), Password, Role: Employee
- Login and test check-in/check-out functionality

#### **2. Create Admin Account**
- Visit: http://localhost:3000/signup
- Fill: Name, Email (admin@test.com), Password, Role: Admin
- Login and test admin features

#### **3. Test Core Features**
- **Attendance:** Check-in/out, view history
- **Tasks:** Admin assigns, employee updates status
- **Leaves:** Employee applies, admin approves
- **Notifications:** Real-time updates
- **Search:** Global search functionality

### **API Testing with cURL**

#### **Signup Test:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"password123","role":"EMPLOYEE"}'
```

#### **Login Test:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## 📁 Project Structure

```
ems-web/
├── src/
│   ├── app/
│   │   ├── globals.css                    # Global styles
│   │   ├── layout.tsx                     # Root layout
│   │   ├── page.tsx                       # Landing page
│   │   ├── login/page.tsx                 # Login page
│   │   ├── signup/page.tsx                # Signup page
│   │   ├── admin/                         # Admin routes
│   │   │   ├── layout.tsx                 # Admin layout
│   │   │   ├── dashboard/page.tsx         # Admin dashboard
│   │   │   ├── employees/page.tsx         # Employee management
│   │   │   ├── attendance/page.tsx        # Attendance overview
│   │   │   ├── leaves/page.tsx            # Leave management
│   │   │   ├── tasks/page.tsx             # Task management
│   │   │   ├── notifications/page.tsx     # Notifications
│   │   │   └── performance/page.tsx       # Performance analytics
│   │   ├── employee/                      # Employee routes
│   │   │   ├── layout.tsx                 # Employee layout
│   │   │   ├── dashboard/page.tsx         # Employee dashboard
│   │   │   ├── attendance/page.tsx        # Attendance tracking
│   │   │   ├── tasks/page.tsx             # Task management
│   │   │   ├── apply-leave/page.tsx       # Leave application
│   │   │   ├── notifications/page.tsx     # Notifications
│   │   │   └── profile/page.tsx           # Profile management
│   │   ├── api/                           # API routes
│   │   │   ├── auth/                      # Authentication
│   │   │   ├── users/                     # User management
│   │   │   ├── attendance/                # Attendance
│   │   │   ├── tasks/                     # Tasks
│   │   │   ├── leaves/                    # Leave requests
│   │   │   ├── notifications/             # Notifications
│   │   │   ├── performance/               # Performance
│   │   │   └── search/                    # Search
│   │   ├── about/page.tsx                 # About page
│   │   ├── contact/page.tsx               # Contact page
│   │   ├── privacy/page.tsx               # Privacy policy
│   │   └── terms/page.tsx                 # Terms of service
│   ├── components/                        # Reusable components
│   │   ├── Navbar.tsx                     # Navigation
│   │   ├── Footer.tsx                     # Footer
│   │   ├── Sidebar.tsx                    # Sidebar navigation
│   │   ├── NotificationBell.tsx           # Notification component
│   │   ├── GlobalSearch.tsx               # Search component
│   │   ├── LoginForm.tsx                  # Login form
│   │   ├── ProfileView.tsx                # Profile display
│   │   ├── CalendarModal.tsx              # Calendar component
│   │   ├── StatusModal.tsx                # Status update modal
│   │   └── DeletionManagementModal.tsx    # Deletion modal
│   ├── lib/                               # Utilities
│   │   ├── mongodb.ts                     # Database connection
│   │   ├── auth.ts                        # Authentication utilities
│   │   ├── ai.ts                          # AI utilities
│   │   ├── mockData.ts                    # Mock data (development)
│   │   ├── models.ts                      # Database models
│   │   ├── notificationService.ts         # Notification service
│   │   ├── searchService.ts               # Search service
│   │   └── userDeletionService.ts         # User deletion service
│   └── types/                             # TypeScript types
│       └── mongoose.d.ts                  # Mongoose type extensions
├── public/                                # Static assets
├── .env.local                             # Environment variables
├── package.json                           # Dependencies
├── tailwind.config.js                     # Tailwind config
├── next.config.ts                         # Next.js config
├── tsconfig.json                          # TypeScript config
└── README.md                              # Project documentation
```

---

## 🎨 Design System

### **Color Palette**
- **Primary:** Indigo/Purple gradient (`#6366f1` to `#8b5cf6`)
- **Secondary:** Emerald green (`#10b981`)
- **Accent:** Amber/Orange gradient (`#f59e0b` to `#f97316`)
- **Background:** Dark theme with subtle gradients
- **Text:** Light colors on dark background

### **Typography**
- **Font Family:** Geist Sans (Next.js default)
- **Headings:** Gradient text effects
- **Body:** Clean, readable text
- **Hierarchy:** Clear size and weight distinctions

### **UI Components**
- **Glassmorphism:** Translucent cards with backdrop blur
- **Animations:** Smooth transitions and micro-interactions
- **Status Indicators:** Color-coded badges and progress bars
- **Modals:** Overlay with blur backdrop
- **Buttons:** Gradient backgrounds with hover effects

---

## 🔮 Future Enhancements

### **Phase 1: Advanced Analytics**
- Real-time dashboard with WebSocket connections
- Advanced reporting with PDF/Excel exports
- Predictive analytics for employee performance

### **Phase 2: Mobile Application**
- React Native mobile app
- Push notifications
- Offline functionality

### **Phase 3: Integration APIs**
- Calendar integration (Google Calendar, Outlook)
- HR system integrations (Workday, BambooHR)
- Payroll system connections

### **Phase 4: Advanced AI Features**
- Computer vision for attendance (face recognition)
- Natural language processing for feedback analysis
- Predictive leave planning
- Automated task prioritization

---

## 📞 Support & Documentation

For questions or issues:
- Check the API documentation in this guide
- Review the project structure for component locations
- Test with the provided cURL examples
- Check MongoDB Atlas connection string format

**Happy coding! 🎉**</content>
<parameter name="filePath">c:\Users\SUHAS G R\Documents\Desktop\EMP - Management-SYS\ems-web\COMPLETE_IMPLEMENTATION_GUIDE.md