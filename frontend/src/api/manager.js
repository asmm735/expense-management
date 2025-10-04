import api from "./index";

// Mock storage for team expenses
const TEAM_EXPENSES_KEY = 'mockTeamExpenses';

// Initialize mock team expenses in localStorage
const initializeMockTeamExpenses = () => {
  const stored = localStorage.getItem(TEAM_EXPENSES_KEY);
  if (!stored) {
    const mockExpenses = [
      // Pending expenses
      {
        id: "EXP001",
        employeeName: "John Smith",
        employeeId: "emp001", 
        category: "Travel",
        convertedAmount: "250.00",
        date: "2024-10-01",
        status: "pending"
      },
      {
        id: "EXP002",
        employeeName: "Sarah Johnson", 
        employeeId: "emp002",
        category: "Meals",
        convertedAmount: "75.50",
        date: "2024-10-02",
        status: "pending"
      },
      {
        id: "EXP003",
        employeeName: "Mike Wilson",
        employeeId: "emp003",
        category: "Office Supplies",
        convertedAmount: "125.00",
        date: "2024-10-03",
        status: "pending"
      },
      // Approved expenses  
      {
        id: "EXP004",
        employeeName: "Emily Davis",
        employeeId: "emp004",
        category: "Training",
        convertedAmount: "450.00",
        date: "2024-09-28",
        status: "approved"
      },
      {
        id: "EXP005",
        employeeName: "John Smith",
        employeeId: "emp001",
        category: "Software License",
        convertedAmount: "299.99",
        date: "2024-09-25",
        status: "approved"
      },
      {
        id: "EXP006",
        employeeName: "Lisa Garcia",
        employeeId: "emp005",
        category: "Travel",
        convertedAmount: "680.00", 
        date: "2024-09-20",
        status: "approved"
      },
      {
        id: "EXP007",
        employeeName: "Sarah Johnson",
        employeeId: "emp002",
        category: "Client Meeting",
        convertedAmount: "120.00",
        date: "2024-09-18",
        status: "approved"
      },
      // Rejected expenses
      {
        id: "EXP008",
        employeeName: "David Brown",
        employeeId: "emp006",
        category: "Equipment",
        convertedAmount: "320.00",
        date: "2024-09-25",
        status: "rejected"
      },
      {
        id: "EXP009",
        employeeName: "Mike Wilson",
        employeeId: "emp003",
        category: "Entertainment",
        convertedAmount: "89.99",
        date: "2024-09-22",
        status: "rejected"
      },
      // Paid expenses
      {
        id: "EXP010",
        employeeName: "Emily Davis",
        employeeId: "emp004",
        category: "Travel",
        convertedAmount: "890.00",
        date: "2024-09-10",
        status: "paid"
      },
      {
        id: "EXP011",
        employeeName: "Lisa Garcia",
        employeeId: "emp005",
        category: "Office Supplies",
        convertedAmount: "67.50",
        date: "2024-09-08",
        status: "paid"
      },
      {
        id: "EXP012",
        employeeName: "John Smith",
        employeeId: "emp001",
        category: "Meals",
        convertedAmount: "45.00",
        date: "2024-09-05",
        status: "paid"
      }
    ];
    localStorage.setItem(TEAM_EXPENSES_KEY, JSON.stringify(mockExpenses));
    return mockExpenses;
  }
  return JSON.parse(stored);
};

// Get manager stats
export const getManagerStats = async () => {
  try {
    const response = await api.get("/manager/stats");
    return response.data;
  } catch (error) {
    console.warn('Mock manager stats');
    // Mock data for development
    return {
      pendingApprovals: 5,
      approvedThisMonth: 12,
      approvedAmount: "15,250.00",
      totalTeamExpenses: 45,
      totalAmount: "89,750.00",
      currency: "USD"
    };
  }
};

// Get pending approvals for manager
export const getPendingApprovalsForManager = async () => {
  try {
    const response = await api.get("/manager/pending-approvals");
    return response.data;
  } catch (error) {
    console.warn('Mock pending approvals');
    
    // Get expenses from localStorage and filter only pending ones
    const allExpenses = initializeMockTeamExpenses();
    const pendingExpenses = allExpenses.filter(expense => expense.status === 'pending');
    
    // Add additional details for pending approvals
    return pendingExpenses.map(expense => ({
      ...expense,
      employeeEmail: `${expense.employeeName.toLowerCase().replace(' ', '.')}@company.com`,
      amount: expense.convertedAmount,
      currency: "USD",
      description: getExpenseDescription(expense.category, expense.employeeName)
    }));
  }
};

// Helper function to generate descriptions
const getExpenseDescription = (category, employeeName) => {
  const descriptions = {
    'Travel': `Business trip expenses for ${employeeName} - flight and accommodation`,
    'Meals': `Business meal expenses during client meetings`,
    'Office Supplies': `Essential office equipment and supplies for team productivity`,
    'Training': `Professional development and training course fees`,
    'Software License': `Annual software license renewal for development tools`,
    'Client Meeting': `Client entertainment and meeting expenses`,
    'Equipment': `New hardware equipment for team operations`,
    'Entertainment': `Team building and client entertainment expenses`
  };
  return descriptions[category] || `${category} expenses for business operations`;
};

// Get team expenses (amounts in company currency)
export const getTeamExpenses = async ({ status = "all" }) => {
  try {
    const response = await api.get("/manager/team-expenses", {
      params: { status },
    });
    return response.data;
  } catch (error) {
    console.warn('Mock team expenses');
    // Get expenses from localStorage
    const allExpenses = initializeMockTeamExpenses();

    // Filter by status if not "all"
    if (status !== "all") {
      return allExpenses.filter(expense => expense.status === status);
    }
    return allExpenses;
  }
};

// Approve expense with comment
export const approveExpense = async (expenseId, comment) => {
  try {
    const response = await api.post(`/manager/expenses/${expenseId}/approve`, {
      comment,
    });
    return response.data;
  } catch (error) {
    console.warn('Mock approve expense');
    
    // Update in localStorage
    const expenses = initializeMockTeamExpenses();
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    
    if (expenseIndex !== -1) {
      expenses[expenseIndex].status = 'approved';
      expenses[expenseIndex].approvedAt = new Date().toISOString();
      expenses[expenseIndex].approverComment = comment;
      localStorage.setItem(TEAM_EXPENSES_KEY, JSON.stringify(expenses));
    }
    
    return {
      success: true,
      message: `Expense ${expenseId} approved successfully`,
      expenseId,
      comment
    };
  }
};

// Reject expense with comment
export const rejectExpense = async (expenseId, comment) => {
  try {
    const response = await api.post(`/manager/expenses/${expenseId}/reject`, {
      comment,
    });
    return response.data;
  } catch (error) {
    console.warn('Mock reject expense');
    
    // Update in localStorage
    const expenses = initializeMockTeamExpenses();
    const expenseIndex = expenses.findIndex(exp => exp.id === expenseId);
    
    if (expenseIndex !== -1) {
      expenses[expenseIndex].status = 'rejected';
      expenses[expenseIndex].rejectedAt = new Date().toISOString();
      expenses[expenseIndex].rejectionReason = comment;
      localStorage.setItem(TEAM_EXPENSES_KEY, JSON.stringify(expenses));
    }
    
    return {
      success: true,
      message: `Expense ${expenseId} rejected`,
      expenseId,
      comment
    };
  }
};