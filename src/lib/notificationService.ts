import { Notification } from './models';

export type NotificationType =
    | 'TASK_ASSIGNED'
    | 'TASK_COMPLETED'
    | 'TASK_DEADLINE'
    | 'TASK_FILE_UPLOADED'
    | 'LEAVE_APPROVED'
    | 'LEAVE_REJECTED'
    | 'LEAVE_REQUESTED'
    | 'ATTENDANCE_APPROVED'
    | 'ATTENDANCE_REJECTED'
    | 'ATTENDANCE_REQUESTED'
    | 'MESSAGE_RECEIVED'
    | 'TASK_STATUS_CHANGED';

export type EntityType = 'TASK' | 'LEAVE' | 'ATTENDANCE' | 'MESSAGE';

interface CreateNotificationParams {
    recipientId: string;
    senderId?: string;
    type: NotificationType;
    message: string;
    relatedEntityId?: string;
    relatedEntityType?: EntityType;
    metadata?: any;
}

/**
 * Notification Service
 * Handles creation and management of in-app notifications
 */
class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(params: CreateNotificationParams) {
        try {
            const notification = await Notification.create({
                recipientId: params.recipientId,
                senderId: params.senderId,
                type: params.type,
                message: params.message,
                relatedEntityId: params.relatedEntityId,
                relatedEntityType: params.relatedEntityType,
                metadata: params.metadata,
                readStatus: false,
            });

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Create multiple notifications (bulk)
     */
    async createBulkNotifications(notificationsData: CreateNotificationParams[]) {
        try {
            const notifications = await Notification.insertMany(
                notificationsData.map(data => ({
                    recipientId: data.recipientId,
                    senderId: data.senderId,
                    type: data.type,
                    message: data.message,
                    relatedEntityId: data.relatedEntityId,
                    relatedEntityType: data.relatedEntityType,
                    metadata: data.metadata,
                    readStatus: false,
                }))
            );

            return notifications;
        } catch (error) {
            console.error('Error creating bulk notifications:', error);
            throw error;
        }
    }

    /**
     * Get user notifications with pagination
     */
    async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
        try {
            const skip = (page - 1) * limit;

            const notifications = await Notification.find({ recipientId: userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('senderId', 'name lastName avatar')
                .lean();

            const total = await Notification.countDocuments({ recipientId: userId });

            return {
                notifications,
                total,
                page,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + notifications.length < total,
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string) {
        try {
            const count = await Notification.countDocuments({
                recipientId: userId,
                readStatus: false,
            });

            return count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string) {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, recipientId: userId },
                { readStatus: true },
                { new: true }
            );

            return notification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string) {
        try {
            const result = await Notification.updateMany(
                { recipientId: userId, readStatus: false },
                { readStatus: true }
            );

            return result;
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string, userId: string) {
        try {
            const result = await Notification.findOneAndDelete({
                _id: notificationId,
                recipientId: userId,
            });

            return result;
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    /**
     * Delete old notifications (cleanup job)
     */
    async deleteOldNotifications(daysOld: number = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await Notification.deleteMany({
                createdAt: { $lt: cutoffDate },
                readStatus: true,
            });

            return result;
        } catch (error) {
            console.error('Error deleting old notifications:', error);
            throw error;
        }
    }

    // ===== HELPER METHODS FOR SPECIFIC EVENTS =====

    /**
     * Notify when task is assigned
     */
    async notifyTaskAssigned(employeeId: string, adminId: string, taskId: string, taskTitle: string) {
        return this.createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: 'TASK_ASSIGNED',
            message: `New task assigned: "${taskTitle}"`,
            relatedEntityId: taskId,
            relatedEntityType: 'TASK',
        });
    }

    /**
     * Notify when task is completed
     */
    async notifyTaskCompleted(adminId: string, employeeId: string, taskId: string, taskTitle: string) {
        return this.createNotification({
            recipientId: adminId,
            senderId: employeeId,
            type: 'TASK_COMPLETED',
            message: `Task completed: "${taskTitle}"`,
            relatedEntityId: taskId,
            relatedEntityType: 'TASK',
        });
    }

    /**
     * Notify when task deadline is approaching
     */
    async notifyTaskDeadline(employeeId: string, taskId: string, taskTitle: string, hoursLeft: number) {
        return this.createNotification({
            recipientId: employeeId,
            type: 'TASK_DEADLINE',
            message: `Task deadline approaching: "${taskTitle}" (${hoursLeft}h left)`,
            relatedEntityId: taskId,
            relatedEntityType: 'TASK',
            metadata: { hoursLeft },
        });
    }

    /**
     * Notify when file is uploaded to task
     */
    async notifyTaskFileUploaded(recipientId: string, uploaderId: string, taskId: string, fileName: string) {
        return this.createNotification({
            recipientId,
            senderId: uploaderId,
            type: 'TASK_FILE_UPLOADED',
            message: `New file uploaded: "${fileName}"`,
            relatedEntityId: taskId,
            relatedEntityType: 'TASK',
            metadata: { fileName },
        });
    }

    /**
     * Notify when leave is approved
     */
    async notifyLeaveApproved(employeeId: string, adminId: string, leaveId: string) {
        return this.createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: 'LEAVE_APPROVED',
            message: 'Your leave request has been approved',
            relatedEntityId: leaveId,
            relatedEntityType: 'LEAVE',
        });
    }

    /**
     * Notify when leave is rejected
     */
    async notifyLeaveRejected(employeeId: string, adminId: string, leaveId: string, reason?: string) {
        return this.createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: 'LEAVE_REJECTED',
            message: reason ? `Leave request rejected: ${reason}` : 'Your leave request has been rejected',
            relatedEntityId: leaveId,
            relatedEntityType: 'LEAVE',
            metadata: { reason },
        });
    }

    /**
     * Notify admin when leave is requested
     */
    async notifyLeaveRequested(adminId: string, employeeId: string, leaveId: string, employeeName: string) {
        return this.createNotification({
            recipientId: adminId,
            senderId: employeeId,
            type: 'LEAVE_REQUESTED',
            message: `${employeeName} has requested leave`,
            relatedEntityId: leaveId,
            relatedEntityType: 'LEAVE',
        });
    }

    /**
     * Notify when attendance correction is approved
     */
    async notifyAttendanceApproved(employeeId: string, adminId: string, attendanceId: string) {
        return this.createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: 'ATTENDANCE_APPROVED',
            message: 'Your attendance correction has been approved',
            relatedEntityId: attendanceId,
            relatedEntityType: 'ATTENDANCE',
        });
    }

    /**
     * Notify when attendance correction is rejected
     */
    async notifyAttendanceRejected(employeeId: string, adminId: string, attendanceId: string) {
        return this.createNotification({
            recipientId: employeeId,
            senderId: adminId,
            type: 'ATTENDANCE_REJECTED',
            message: 'Your attendance correction has been rejected',
            relatedEntityId: attendanceId,
            relatedEntityType: 'ATTENDANCE',
        });
    }

    /**
     * Notify admin when attendance correction is requested
     */
    async notifyAttendanceRequested(adminId: string, employeeId: string, attendanceId: string, employeeName: string) {
        return this.createNotification({
            recipientId: adminId,
            senderId: employeeId,
            type: 'ATTENDANCE_REQUESTED',
            message: `${employeeName} has requested attendance correction`,
            relatedEntityId: attendanceId,
            relatedEntityType: 'ATTENDANCE',
        });
    }

    /**
     * Notify when new message is received
     */
    async notifyMessageReceived(recipientId: string, senderId: string, taskId: string, message: string) {
        return this.createNotification({
            recipientId,
            senderId,
            type: 'MESSAGE_RECEIVED',
            message: `New message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
            relatedEntityId: taskId,
            relatedEntityType: 'MESSAGE',
        });
    }

    /**
     * Notify when task status changes
     */
    async notifyTaskStatusChanged(recipientId: string, senderId: string, taskId: string, taskTitle: string, newStatus: string) {
        return this.createNotification({
            recipientId,
            senderId,
            type: 'TASK_STATUS_CHANGED',
            message: `Task "${taskTitle}" status changed to ${newStatus}`,
            relatedEntityId: taskId,
            relatedEntityType: 'TASK',
            metadata: { newStatus },
        });
    }
}

// Export singleton instance
export const notificationService = new NotificationService();
