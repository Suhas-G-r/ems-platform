import { User, Task, LeaveRequest, Attendance } from './models';

/**
 * Search Service
 * Provides fast search and filter capabilities across the system
 */
class SearchService {
    /**
     * Search employees by name, email, department, or designation
     */
    async searchEmployees(query: string, filters?: {
        department?: string;
        role?: string;
        isActive?: boolean;
    }) {
        try {
            const searchRegex = new RegExp(query, 'i'); // Case-insensitive

            const searchQuery: any = {
                $or: [
                    { name: searchRegex },
                    { lastName: searchRegex },
                    { email: searchRegex },
                    { department: searchRegex },
                    { designation: searchRegex }
                ]
            };

            // Apply filters
            if (filters?.department) {
                searchQuery.department = filters.department;
            }
            if (filters?.role) {
                searchQuery.role = filters.role;
            }
            if (filters?.isActive !== undefined) {
                searchQuery.isActive = filters.isActive;
            }

            const employees = await User.find(searchQuery)
                .select('-password -securityAnswer')
                .limit(50)
                .lean();

            return employees;
        } catch (error) {
            console.error('Error searching employees:', error);
            throw error;
        }
    }

    /**
     * Search tasks with advanced filters
     */
    async searchTasks(query: string, filters?: {
        status?: string;
        priority?: string;
        assignedTo?: string;
        assignedBy?: string;
        dueDateFrom?: Date;
        dueDateTo?: Date;
    }) {
        try {
            const searchRegex = new RegExp(query, 'i');

            const searchQuery: any = {
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            };

            // Apply filters
            if (filters?.status) {
                searchQuery.status = filters.status;
            }
            if (filters?.priority) {
                searchQuery.priority = filters.priority;
            }
            if (filters?.assignedTo) {
                searchQuery.assignedTo = filters.assignedTo;
            }
            if (filters?.assignedBy) {
                searchQuery.assignedBy = filters.assignedBy;
            }
            if (filters?.dueDateFrom || filters?.dueDateTo) {
                searchQuery.dueDate = {};
                if (filters.dueDateFrom) {
                    searchQuery.dueDate.$gte = filters.dueDateFrom;
                }
                if (filters.dueDateTo) {
                    searchQuery.dueDate.$lte = filters.dueDateTo;
                }
            }

            const tasks = await Task.find(searchQuery)
                .populate('assignedTo', 'name lastName email')
                .populate('assignedBy', 'name lastName email')
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            return tasks;
        } catch (error) {
            console.error('Error searching tasks:', error);
            throw error;
        }
    }

    /**
     * Search leave requests with filters
     */
    async searchLeaves(query: string, filters?: {
        status?: string;
        userId?: string;
        startDateFrom?: Date;
        startDateTo?: Date;
        type?: string;
    }) {
        try {
            const searchRegex = new RegExp(query, 'i');

            const searchQuery: any = {
                $or: [
                    { reason: searchRegex },
                    { type: searchRegex },
                    { adminResponse: searchRegex }
                ]
            };

            // Apply filters
            if (filters?.status) {
                searchQuery.status = filters.status;
            }
            if (filters?.userId) {
                searchQuery.userId = filters.userId;
            }
            if (filters?.type) {
                searchQuery.type = filters.type;
            }
            if (filters?.startDateFrom || filters?.startDateTo) {
                searchQuery.startDate = {};
                if (filters.startDateFrom) {
                    searchQuery.startDate.$gte = filters.startDateFrom;
                }
                if (filters.startDateTo) {
                    searchQuery.startDate.$lte = filters.startDateTo;
                }
            }

            const leaves = await LeaveRequest.find(searchQuery)
                .populate('userId', 'name lastName email department')
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            return leaves;
        } catch (error) {
            console.error('Error searching leaves:', error);
            throw error;
        }
    }

    /**
     * Search attendance records with filters
     */
    async searchAttendance(filters: {
        userId?: string;
        dateFrom?: Date;
        dateTo?: Date;
        status?: string;
        locationType?: string;
    }) {
        try {
            const searchQuery: any = {};

            // Apply filters
            if (filters.userId) {
                searchQuery.userId = filters.userId;
            }
            if (filters.status) {
                searchQuery.status = filters.status;
            }
            if (filters.locationType) {
                searchQuery.locationType = filters.locationType;
            }
            if (filters.dateFrom || filters.dateTo) {
                searchQuery.date = {};
                if (filters.dateFrom) {
                    searchQuery.date.$gte = filters.dateFrom;
                }
                if (filters.dateTo) {
                    searchQuery.date.$lte = filters.dateTo;
                }
            }

            const attendance = await Attendance.find(searchQuery)
                .populate('userId', 'name lastName email department')
                .sort({ date: -1 })
                .limit(100)
                .lean();

            return attendance;
        } catch (error) {
            console.error('Error searching attendance:', error);
            throw error;
        }
    }

    /**
     * Global search across all entities
     */
    async globalSearch(query: string, userId?: string, role?: string) {
        try {
            const results: any = {
                employees: [],
                tasks: [],
                leaves: [],
                total: 0
            };

            // Search employees (admin only)
            if (role === 'ADMIN') {
                results.employees = await this.searchEmployees(query);
            }

            // Search tasks
            const taskFilters: any = {};
            if (role === 'EMPLOYEE' && userId) {
                taskFilters.assignedTo = userId;
            }
            results.tasks = await this.searchTasks(query, taskFilters);

            // Search leaves
            const leaveFilters: any = {};
            if (role === 'EMPLOYEE' && userId) {
                leaveFilters.userId = userId;
            }
            results.leaves = await this.searchLeaves(query, leaveFilters);

            results.total = results.employees.length + results.tasks.length + results.leaves.length;

            return results;
        } catch (error) {
            console.error('Error in global search:', error);
            throw error;
        }
    }

    /**
     * Get filter options for dropdowns
     */
    async getFilterOptions() {
        try {
            // Get unique departments
            const departments = await User.distinct('department');

            // Get unique designations
            const designations = await User.distinct('designation');

            return {
                departments: departments.filter((d: any) => d),
                designations: designations.filter((d: any) => d),
                taskStatuses: ['TODO', 'IN_PROGRESS', 'DONE'],
                taskPriorities: ['LOW', 'MEDIUM', 'HIGH'],
                leaveStatuses: ['PENDING', 'APPROVED', 'REJECTED'],
                leaveTypes: ['Leave Request', 'WFH', 'Missed Punch'],
                attendanceStatuses: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'LATE', 'REMOTE'],
                locationTypes: ['OFFICE', 'REMOTE']
            };
        } catch (error) {
            console.error('Error getting filter options:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const searchService = new SearchService();
