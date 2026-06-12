
export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface EmployeeProfile {
  userId: string;
  designation: string;
  department: string;
  joinDate: string;
  salary: number;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn: string; // ISO string
  checkOut?: string; // ISO string
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
}

export interface LeaveRequest {
  id: string;
  userId: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Task {
  id: string;
  assignedTo: string; // userId
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate: string;
}

// MOCK DATA

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alice Admin',
    email: 'alice@company.com',
    role: 'ADMIN',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'u2',
    name: 'Bob Builder',
    email: 'bob@company.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  },
  {
    id: 'u3',
    name: 'Charlie Coder',
    email: 'charlie@company.com',
    role: 'EMPLOYEE',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
  }
];

export const EMPLOYEES: EmployeeProfile[] = [
  {
    userId: 'u2',
    designation: 'Senior Developer',
    department: 'Engineering',
    joinDate: '2023-01-15',
    salary: 85000
  },
  {
    userId: 'u3',
    designation: 'UI/UX Designer',
    department: 'Design',
    joinDate: '2023-03-10',
    salary: 75000
  }
];

export const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'l1',
    userId: 'u2',
    type: 'Sick Leave',
    startDate: '2023-11-20',
    endDate: '2023-11-21',
    reason: 'Flu',
    status: 'PENDING'
  },
  {
    id: 'l2',
    userId: 'u3',
    type: 'Casual Leave',
    startDate: '2023-12-01',
    endDate: '2023-12-05',
    reason: 'Vacation',
    status: 'APPROVED'
  }
];

export const TASKS: Task[] = [
  {
    id: 't1',
    assignedTo: 'u2',
    title: 'Fix Login Bug',
    description: 'Login page crashes on mobile.',
    status: 'IN_PROGRESS',
    dueDate: '2023-10-25'
  },
  {
    id: 't2',
    assignedTo: 'u3',
    title: 'Design Dashboard',
    description: 'Create high-fidelity mockups for admin dashboard.',
    status: 'TODO',
    dueDate: '2023-10-30'
  }
];
