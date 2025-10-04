import api from './index';

export const getAdminStats = async () => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error) {
    // Return mock data for development
    console.warn('Using mock admin stats data');
    return {
      totalExpenses: 156,
      totalAmount: "45,230.50",
      currency: "USD",
      pendingApprovals: 23,
      totalUsers: 47,
      activeUsers: 42,
      approvedThisMonth: 89,
      rejectedThisMonth: 12,
    };
  }
};

export const getPendingApprovals = async ({ limit = 10 }) => {
  try {
    const response = await api.get('/admin/pending-approvals', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    // Return mock data for development
    console.warn('Using mock pending approvals data');
    return [
      {
        id: 'EXP-001',
        employeeName: 'John Doe',
        amount: '250.00',
        currency: 'USD',
        submittedAt: '2025-10-03T10:30:00Z',
        currentStep: 'Manager Review',
      },
      {
        id: 'EXP-002',
        employeeName: 'Jane Smith',
        amount: '420.75',
        currency: 'USD',
        submittedAt: '2025-10-02T15:45:00Z',
        currentStep: 'Finance Review',
      },
      {
        id: 'EXP-003',
        employeeName: 'Mike Johnson',
        amount: '125.50',
        currency: 'USD',
        submittedAt: '2025-10-01T09:15:00Z',
        currentStep: 'Pending',
      },
    ];
  }
};

export const getRecentExpenses = async ({ limit = 10 }) => {
  try {
    const response = await api.get('/admin/recent-expenses', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    // Return mock data for development
    console.warn('Using mock recent expenses data');
    return [
      {
        id: 'EXP-004',
        employeeName: 'Sarah Wilson',
        category: 'Travel',
        amount: '850.00',
        currency: 'USD',
        status: 'approved',
      },
      {
        id: 'EXP-005',
        employeeName: 'Tom Brown',
        category: 'Meals',
        amount: '65.25',
        currency: 'USD',
        status: 'pending',
      },
      {
        id: 'EXP-006',
        employeeName: 'Lisa Davis',
        category: 'Office Supplies',
        amount: '150.00',
        currency: 'USD',
        status: 'paid',
      },
      {
        id: 'EXP-007',
        employeeName: 'Mark Taylor',
        category: 'Software',
        amount: '299.99',
        currency: 'USD',
        status: 'rejected',
      },
    ];
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    // Return mock data for development
    console.warn('Using mock users data');
    return {
      totalUsers: 47,
      activeUsers: 42,
      inactiveUsers: 5,
      adminUsers: 3,
      managerUsers: 8,
      employeeUsers: 36,
    };
  }
};