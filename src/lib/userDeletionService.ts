import { User, Task, Attendance, LeaveRequest, Notification } from './models';

/**
 * User Deletion Service
 * Handles safe deletion of user accounts with data cleanup
 */
class UserDeletionService {

    /**
     * Reassign tasks before deletion
     */
    async reassignTasks(fromUserId: string, toUserId: string) {
        try {
            // Reassign tasks assigned TO the user
            const result1 = await Task.updateMany(
                { assignedTo: fromUserId, status: { $ne: 'DONE' } },
                { assignedTo: toUserId }
            );

            // Reassign tasks assigned BY the user (if admin)
            const result2 = await Task.updateMany(
                { assignedBy: fromUserId },
                { assignedBy: toUserId }
            );

            return {
                tasksReassignedTo: result1.modifiedCount,
                tasksReassignedBy: result2.modifiedCount,
                total: result1.modifiedCount + result2.modifiedCount
            };
        } catch (error) {
            console.error('Error reassigning tasks:', error);
            throw error;
        }
    }

    async hardDeleteUser(userId: string) {
        try {
            const deletionSummary: any = {
                userId,
                timestamp: new Date(),
                deleted: {
                    user: false,
                    tasks: 0,
                    attendance: 0,
                    leaves: 0,
                    notifications: 0,
                    footprintScrubbed: false
                }
            };

            // 1. Delete tasks where user is the primary actor
            const taskResult = await Task.deleteMany({
                $or: [{ assignedTo: userId }, { assignedBy: userId }]
            });
            deletionSummary.deleted.tasks = taskResult.deletedCount;

            // 2. Scrub user footprint from remaining tasks (where they weren't assignedTo/assignedBy)
            // Remove their discussion messages, activity logs, and file references
            await Task.updateMany(
                {},
                {
                    $pull: {
                        discussionMessages: { senderId: userId },
                        activityLogs: { performedBy: userId },
                        uploadedFiles: { uploadedBy: userId }
                    }
                }
            );
            deletionSummary.deleted.footprintScrubbed = true;

            // 3. Delete attendance records
            const attendanceResult = await Attendance.deleteMany({ userId });
            deletionSummary.deleted.attendance = attendanceResult.deletedCount;

            // 4. Delete leave requests
            const leaveResult = await LeaveRequest.deleteMany({ userId });
            deletionSummary.deleted.leaves = leaveResult.deletedCount;

            // 5. Delete notifications
            const notificationResult = await Notification.deleteMany({
                $or: [{ recipientId: userId }, { senderId: userId }]
            });
            deletionSummary.deleted.notifications = notificationResult.deletedCount;

            // 6. Finally, delete the user
            await User.findByIdAndDelete(userId);
            deletionSummary.deleted.user = true;

            return deletionSummary;
        } catch (error) {
            console.error('Error hard deleting user:', error);
            throw error;
        }
    }

    /**
     * Get deletion preview (what will be deleted)
     */
    async getDeletionPreview(userId: string) {
        try {
            const user = await User.findById(userId).select('-password -securityAnswer');
            if (!user) {
                throw new Error('User not found');
            }

            const tasksAssignedTo = await Task.countDocuments({ assignedTo: userId });
            const tasksAssignedBy = await Task.countDocuments({ assignedBy: userId });
            const attendanceRecords = await Attendance.countDocuments({ userId });
            const leaveRequests = await LeaveRequest.countDocuments({ userId });
            const notifications = await Notification.countDocuments({
                $or: [{ recipientId: userId }, { senderId: userId }]
            });

            return {
                user: {
                    id: user._id,
                    name: `${user.name} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    department: user.department
                },
                dataToDelete: {
                    tasksAssignedTo,
                    tasksAssignedBy,
                    totalTasks: tasksAssignedTo + tasksAssignedBy,
                    attendanceRecords,
                    leaveRequests,
                    notifications
                }
            };
        } catch (error) {
            console.error('Error getting deletion preview:', error);
            throw error;
        }
    }

}

// Export singleton instance
export const userDeletionService = new UserDeletionService();
