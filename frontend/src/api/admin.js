import api from './index';

// Dashboard Stats
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

// Mock data storage
const MOCK_USERS_KEY = 'mock_users_data';

// Initialize mock users data
const initializeMockUsers = () => {
  const existingUsers = localStorage.getItem(MOCK_USERS_KEY);
  if (!existingUsers) {
    const defaultUsers = [
      {
        id: 1,
        name: 'John Admin',
        email: 'john.admin@company.com',
        role: 'admin',
        managerName: null,
        isApprover: true,
      },
      {
        id: 2,
        name: 'Jane CFO',
        email: 'jane.cfo@company.com',
        role: 'cfo',
        managerName: 'John Admin',
        isApprover: true,
      },
      {
        id: 3,
        name: 'Alice Director',
        email: 'alice.director@company.com',
        role: 'director',
        managerName: 'Jane CFO',
        isApprover: true,
      },
      {
        id: 4,
        name: 'Bob Manager',
        email: 'bob.manager@company.com',
        role: 'manager',
        managerName: 'Alice Director',
        isApprover: true,
      },
      {
        id: 5,
        name: 'Charlie Financer',
        email: 'charlie.financer@company.com',
        role: 'financer',
        managerName: 'Alice Director',
        isApprover: true,
      },
      {
        id: 6,
        name: 'Diana Employee',
        email: 'diana.employee@company.com',
        role: 'employee',
        managerName: 'Bob Manager',
        isApprover: false,
      },
      {
        id: 7,
        name: 'Eve Employee',
        email: 'eve.employee@company.com',
        role: 'employee',
        managerName: 'Bob Manager',
        isApprover: false,
      },
    ];
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(existingUsers);
};

// User Management
export const getAllUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    // Return mock data for development
    console.warn('Using mock users data');
    return initializeMockUsers();
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.warn('Mock user creation');
    // Add to mock storage
    const users = initializeMockUsers();
    const newUser = { 
      ...userData, 
      id: Date.now(),
      isApprover: ['admin', 'cfo', 'director', 'manager', 'financer'].includes(userData.role)
    };
    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    return newUser;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.warn('Mock user update');
    // Update in mock storage
    const users = initializeMockUsers();
    const userIndex = users.findIndex(u => u.id == id);
    if (userIndex !== -1) {
      users[userIndex] = { 
        ...userData, 
        id: id,
        isApprover: ['admin', 'cfo', 'director', 'manager', 'financer'].includes(userData.role)
      };
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
      return users[userIndex];
    }
    return { ...userData, id };
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Mock user deletion');
    // Remove from mock storage
    const users = initializeMockUsers();
    const filteredUsers = users.filter(u => u.id != id);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(filteredUsers));
    return { success: true };
  }
};

// Approval Rules
export const getApprovalRules = async () => {
  try {
    const response = await api.get('/admin/approval-rules');
    return response.data;
  } catch (error) {
    console.warn('Using mock approval rules data');
    return [
      {
        id: 1,
        name: 'Standard Sequential Approval',
        description: 'Sequential approval for expenses under $1000 with manager first',
        type: 'sequential',
        requireManagerApproval: true,
        threshold: '1000',
        currency: 'USD',
        steps: [
          { approverId: '2', approverName: 'Jane Manager', order: 1 },
          { approverId: '1', approverName: 'John Admin', order: 2 },
        ],
        isActive: true,
      },
      {
        id: 2,
        name: 'High Value Specific Approval',
        description: 'CFO approval for expenses over $5000',
        type: 'specific',
        requireManagerApproval: false,
        threshold: '5000',
        currency: 'USD',
        specificApproverId: '1',
        specificApproverName: 'John Admin (CFO)',
        isActive: true,
      },
      {
        id: 3,
        name: 'Department Percentage Approval',
        description: '60% of department heads must approve',
        type: 'percentage',
        requireManagerApproval: true,
        threshold: '2000',
        currency: 'USD',
        percentage: 60,
        approvers: [
          { id: '1', name: 'John Admin' },
          { id: '2', name: 'Jane Manager' },
          { id: '3', name: 'Bob Senior Manager' },
        ],
        isActive: true,
      },
      {
        id: 4,
        name: 'Hybrid Emergency Approval',
        description: 'Either 75% approval OR CFO override',
        type: 'hybrid',
        requireManagerApproval: true,
        threshold: '10000',
        currency: 'USD',
        percentage: 75,
        specificApproverId: '1',
        specificApproverName: 'John Admin (CFO)',
        approvers: [
          { id: '1', name: 'John Admin' },
          { id: '2', name: 'Jane Manager' },
          { id: '3', name: 'Bob Senior Manager' },
          { id: '4', name: 'Alice Director' },
        ],
        isActive: true,
      },
    ];
  }
};

export const createApprovalRule = async (ruleData) => {
  try {
    const response = await api.post('/admin/approval-rules', ruleData);
    return response.data;
  } catch (error) {
    console.warn('Mock approval rule creation');
    return { ...ruleData, id: Date.now() };
  }
};

export const updateApprovalRule = async (id, ruleData) => {
  try {
    const response = await api.put(`/admin/approval-rules/${id}`, ruleData);
    return response.data;
  } catch (error) {
    console.warn('Mock approval rule update');
    return { ...ruleData, id };
  }
};

export const deleteApprovalRule = async (id) => {
  try {
    const response = await api.delete(`/admin/approval-rules/${id}`);
    return response.data;
  } catch (error) {
    console.warn('Mock approval rule deletion');
    return { success: true };
  }
};

// Company Settings
export const getCompanySettings = async () => {
  try {
    const response = await api.get('/admin/company');
    return response.data;
  } catch (error) {
    console.warn('Using mock company settings data');
    return {
      name: 'Acme Corporation',
      country: 'United States',
      address: '123 Business St, Suite 100\nNew York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'contact@acme.com',
      defaultCurrency: 'USD',
      autoConvertCurrency: true,
      maxExpenseAmount: '10000',
      expenseCategories: ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training'],
      requireReceipt: true,
    };
  }
};

export const updateCompanySettings = async (settingsData) => {
  try {
    const response = await api.put('/admin/company', settingsData);
    return response.data;
  } catch (error) {
    console.warn('Mock company settings update');
    return settingsData;
  }
};

// Expenses Overview
export const getAllExpenses = async (filters = {}) => {
  try {
    const response = await api.get('/admin/expenses', { params: filters });
    return response.data;
  } catch (error) {
    console.warn('Using mock all expenses data');
    return [
      {
        id: 'EXP-001',
        employeeName: 'John Doe',
        category: 'Travel',
        amount: '250.00',
        currency: 'USD',
        date: '2025-10-03T10:30:00Z',
        status: 'pending',
      },
      {
        id: 'EXP-002',
        employeeName: 'Jane Smith',
        category: 'Meals',
        amount: '420.75',
        currency: 'USD',
        date: '2025-10-02T15:45:00Z',
        status: 'approved',
      },
      {
        id: 'EXP-003',
        employeeName: 'Mike Johnson',
        category: 'Office Supplies',
        amount: '125.50',
        currency: 'USD',
        date: '2025-10-01T09:15:00Z',
        status: 'rejected',
      },
      {
        id: 'EXP-004',
        employeeName: 'Sarah Wilson',
        category: 'Software',
        amount: '850.00',
        currency: 'USD',
        date: '2025-09-30T14:20:00Z',
        status: 'paid',
      },
    ];
  }
};

export const overrideExpenseStatus = async (id, status, comment) => {
  try {
    const response = await api.post(`/admin/expenses/${id}/override`, {
      status,
      comment,
    });
    return response.data;
  } catch (error) {
    console.warn('Mock expense status override');
    return { success: true, id, status, comment };
  }
};