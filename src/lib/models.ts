import mongoose, { Schema, models, model } from 'mongoose';

// User Schema
const userSchema = new Schema({
    name: { type: String, required: true }, // This will be First Name
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE' },
    department: { type: String, default: 'General' },
    designation: { type: String, default: 'Employee' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    securityQuestion: { type: String, required: true },
    securityAnswer: { type: String, required: true },
    joinDate: { type: Date, default: Date.now },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true }, // For soft delete
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastLogin: { type: Date },
    notificationPreferences: {
        email: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
    createdAt: { type: Date, default: Date.now },
});

// Attendance Schema
const attendanceSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    checkIn: { type: Date },
    checkOut: { type: Date },
    workHours: { type: Number, default: 0 }, // In hours
    isLate: { type: Boolean, default: false },
    locationType: { type: String, enum: ['OFFICE', 'REMOTE'], default: 'OFFICE' },
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'LATE', 'REMOTE'], default: 'PRESENT' },
    correctionRequest: {
        requested: { type: Boolean, default: false },
        reason: { type: String, default: '' },
        status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' }
    },
    createdAt: { type: Date, default: Date.now },
});

// Leave Request Schema
const leaveRequestSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // LEAVE, WFH, MISSED_PUNCH
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminResponse: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Task Schema
const taskSchema = new Schema({
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    subtasks: [{
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
        createdAt: { type: Date, default: Date.now }
    }],
    discussionMessages: [{
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderRole: { type: String, enum: ['ADMIN', 'EMPLOYEE'], required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false }
    }],
    uploadedFiles: [{
        name: { type: String, required: true },
        size: { type: String, required: true },
        url: { type: String, required: true },
        uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],
    activityLogs: [{
        action: { type: String, required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        details: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    dueDate: { type: Date, required: true },
    progress: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Indexing for faster queries
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ assignedBy: 1 });
attendanceSchema.index({ userId: 1, date: -1 });
leaveRequestSchema.index({ userId: 1, status: 1 });
userSchema.index({ isActive: 1 });

// Notification Schema
const notificationSchema = new Schema({
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: [
            'TASK_ASSIGNED',
            'TASK_COMPLETED',
            'TASK_DEADLINE',
            'TASK_FILE_UPLOADED',
            'LEAVE_APPROVED',
            'LEAVE_REJECTED',
            'LEAVE_REQUESTED',
            'ATTENDANCE_APPROVED',
            'ATTENDANCE_REJECTED',
            'ATTENDANCE_REQUESTED',
            'MESSAGE_RECEIVED',
            'TASK_STATUS_CHANGED'
        ],
        required: true
    },
    message: { type: String, required: true },
    readStatus: { type: Boolean, default: false },
    relatedEntityId: { type: Schema.Types.ObjectId },
    relatedEntityType: { type: String, enum: ['TASK', 'LEAVE', 'ATTENDANCE', 'MESSAGE'] },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
});

// Notification indexes for performance
notificationSchema.index({ recipientId: 1, readStatus: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }); // For cleanup


// Export models (check if already exists to prevent recompilation errors in Next.js)
export const User = models.User || model('User', userSchema);
export const Attendance = models.Attendance || model('Attendance', attendanceSchema);
export const LeaveRequest = models.LeaveRequest || model('LeaveRequest', leaveRequestSchema);
export const Task = models.Task || model('Task', taskSchema);
export const Notification = models.Notification || model('Notification', notificationSchema);
