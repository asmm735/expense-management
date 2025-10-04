// Mock data for employee expenses
const mockEmployeeExpenses = [
  {
    id: "EXP-001",
    category: "Travel",
    description: "Business trip to New York",
    date: "2024-10-01",
    currency: "USD",
    amount: "1250.00",
    convertedAmount: "1250.00",
    status: "approved",
    approvalStep: "Fully Approved by Manager",
    lineItems: [
      { description: "Flight tickets", amount: "800.00" },
      { description: "Hotel accommodation", amount: "450.00" }
    ],
    submittedDate: "2024-10-01",
    approvedDate: "2024-10-02",
    receiptUrl: "/receipts/exp-001.jpg"
  },
  {
    id: "EXP-002",
    category: "Food",
    description: "Client dinner",
    date: "2024-10-03",
    currency: "USD",
    amount: "185.50",
    convertedAmount: "185.50",
    status: "pending",
    approvalStep: "Waiting for Manager approval",
    lineItems: [
      { description: "Dinner for 3 people", amount: "165.50" },
      { description: "Tip", amount: "20.00" }
    ],
    submittedDate: "2024-10-03",
    receiptUrl: "/receipts/exp-002.jpg"
  },
  {
    id: "EXP-003",
    category: "Office Supplies",
    description: "Laptop and accessories",
    date: "2024-09-28",
    currency: "USD",
    amount: "2150.00",
    convertedAmount: "2150.00",
    status: "rejected",
    approvalStep: "Rejected by Finance",
    rejectionReason: "Missing proper authorization for high-value purchase",
    lineItems: [
      { description: "MacBook Pro", amount: "1999.00" },
      { description: "USB-C Hub", amount: "79.00" },
      { description: "Wireless Mouse", amount: "72.00" }
    ],
    submittedDate: "2024-09-28",
    receiptUrl: "/receipts/exp-003.jpg"
  },
  {
    id: "EXP-004",
    category: "Transportation",
    description: "Uber rides for client meetings",
    date: "2024-10-02",
    currency: "USD",
    amount: "45.30",
    convertedAmount: "45.30",
    status: "paid",
    approvalStep: "Fully Approved and Paid",
    lineItems: [
      { description: "Uber to client office", amount: "22.50" },
      { description: "Uber return trip", amount: "22.80" }
    ],
    submittedDate: "2024-10-02",
    approvedDate: "2024-10-02",
    paidDate: "2024-10-03",
    receiptUrl: "/receipts/exp-004.jpg"
  }
];

// Initialize mock data in localStorage
export const initializeMockEmployeeData = () => {
  const existingData = localStorage.getItem('employeeExpenses');
  if (!existingData) {
    localStorage.setItem('employeeExpenses', JSON.stringify(mockEmployeeExpenses));
  }
};

// Get employee stats
export const getEmployeeStats = async () => {
  initializeMockEmployeeData();
  const expenses = JSON.parse(localStorage.getItem('employeeExpenses') || '[]');
  
  const stats = {
    totalExpenses: expenses.length,
    pendingExpenses: expenses.filter(e => e.status === 'pending').length,
    approvedExpenses: expenses.filter(e => e.status === 'approved' || e.status === 'paid').length,
    rejectedExpenses: expenses.filter(e => e.status === 'rejected').length,
    approvedAmount: expenses
      .filter(e => e.status === 'approved' || e.status === 'paid')
      .reduce((sum, e) => sum + parseFloat(e.convertedAmount || 0), 0)
      .toFixed(2),
    totalAmount: expenses
      .reduce((sum, e) => sum + parseFloat(e.convertedAmount || 0), 0)
      .toFixed(2)
  };
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(stats), 300);
  });
};

// Get employee expenses
export const getEmployeeExpenses = async ({ status = "all" }) => {
  initializeMockEmployeeData();
  const expenses = JSON.parse(localStorage.getItem('employeeExpenses') || '[]');
  
  let filteredExpenses = expenses;
  if (status !== "all") {
    filteredExpenses = expenses.filter(expense => expense.status === status);
  }
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(filteredExpenses), 300);
  });
};

// Submit expense
export const submitExpense = async (expenseData) => {
  initializeMockEmployeeData();
  const expenses = JSON.parse(localStorage.getItem('employeeExpenses') || '[]');
  
  const newExpense = {
    id: `EXP-${String(expenses.length + 1).padStart(3, '0')}`,
    ...expenseData,
    status: 'pending',
    approvalStep: 'Waiting for Manager approval',
    submittedDate: new Date().toISOString().split('T')[0],
    convertedAmount: expenseData.totalAmount
  };
  
  expenses.unshift(newExpense);
  localStorage.setItem('employeeExpenses', JSON.stringify(expenses));
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(newExpense), 500);
  });
};

// Upload receipt (mock)
export const uploadReceipt = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fileId: `receipt_${Date.now()}`,
        fileName: file.name,
        url: URL.createObjectURL(file)
      });
    }, 1000);
  });
};

// Process OCR on receipt (mock)
export const processOCR = async (fileId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock OCR results
      const mockOcrResults = [
        {
          category: "Food",
          description: "Restaurant dinner",
          date: new Date().toISOString().split('T')[0],
          currency: "USD",
          lineItems: [
            { description: "Appetizers", amount: "15.50" },
            { description: "Main course", amount: "28.90" },
            { description: "Drinks", amount: "12.60" },
            { description: "Tax & tip", amount: "8.50" }
          ]
        },
        {
          category: "Transportation",
          description: "Taxi fare",
          date: new Date().toISOString().split('T')[0],
          currency: "USD",
          lineItems: [
            { description: "Taxi ride", amount: "25.80" }
          ]
        },
        {
          category: "Office Supplies",
          description: "Office equipment",
          date: new Date().toISOString().split('T')[0],
          currency: "USD",
          lineItems: [
            { description: "Wireless keyboard", amount: "89.99" },
            { description: "Desk lamp", amount: "45.50" }
          ]
        }
      ];
      
      // Return random mock result
      const randomResult = mockOcrResults[Math.floor(Math.random() * mockOcrResults.length)];
      resolve(randomResult);
    }, 2000);
  });
};

// Get country currency from API (mock)
export const getCountryCurrency = async (country) => {
  const mockCurrencies = {
    "United States": "USD",
    "United Kingdom": "GBP",
    "Germany": "EUR",
    "France": "EUR",
    "India": "INR",
    "Japan": "JPY",
    "Australia": "AUD",
    "Canada": "CAD"
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockCurrencies[country] || "USD");
    }, 300);
  });
};

// Convert currency (mock)
export const convertCurrency = async (from, to, amount) => {
  const mockRates = {
    USD: { EUR: 0.85, GBP: 0.73, INR: 74.5, JPY: 110, AUD: 1.35, CAD: 1.25 },
    EUR: { USD: 1.18, GBP: 0.86, INR: 87.8, JPY: 129, AUD: 1.59, CAD: 1.47 },
    GBP: { USD: 1.37, EUR: 1.16, INR: 102, JPY: 150, AUD: 1.85, CAD: 1.71 },
    INR: { USD: 0.013, EUR: 0.011, GBP: 0.0098, JPY: 1.48, AUD: 0.018, CAD: 0.017 },
    JPY: { USD: 0.009, EUR: 0.0078, GBP: 0.0067, INR: 0.68, AUD: 0.012, CAD: 0.011 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, INR: 55.2, JPY: 81.5, CAD: 0.93 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, INR: 59.6, JPY: 88, AUD: 1.08 }
  };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (from === to) {
        resolve(amount.toFixed(2));
      } else {
        const rate = mockRates[from]?.[to] || 1;
        resolve((amount * rate).toFixed(2));
      }
    }, 300);
  });
};

// Get expense details by ID
export const getExpenseDetails = async (expenseId) => {
  initializeMockEmployeeData();
  const expenses = JSON.parse(localStorage.getItem('employeeExpenses') || '[]');
  const expense = expenses.find(e => e.id === expenseId);
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(expense), 300);
  });
};

// Get expense by ID (alias for getExpenseDetails)
export const getExpenseById = async (expenseId) => {
  initializeMockEmployeeData();
  const expenses = JSON.parse(localStorage.getItem('employeeExpenses') || '[]');
  const expense = expenses.find(e => e.id === expenseId);
  
  if (expense) {
    // Add mock approval history
    expense.approvalHistory = [
      {
        approverName: "John Manager",
        approverRole: "Manager",
        action: expense.status === 'pending' ? 'pending' : expense.status,
        timestamp: expense.approvedDate || expense.submittedDate || new Date().toISOString(),
        comment: expense.status === 'rejected' ? expense.rejectionReason : 
                expense.status === 'approved' ? "Expense approved for reimbursement" :
                "Reviewing expense details"
      }
    ];
    
    // Add employee name if not present
    expense.employeeName = expense.employeeName || "Current User";
    
    // Add receipt URL if not present
    expense.receiptUrl = expense.receiptUrl || `https://picsum.photos/300/400?random=${expense.id}`;
    
    // Add timestamps
    expense.submittedAt = expense.submittedDate || new Date().toISOString();
    if (expense.status === 'approved' || expense.status === 'paid') {
      expense.reviewedAt = expense.approvedDate || new Date().toISOString();
    }
    if (expense.status === 'paid') {
      expense.paidAt = expense.paidDate || new Date().toISOString();
      expense.paymentStatus = 'paid';
    } else if (expense.status === 'approved') {
      expense.paymentStatus = 'pending';
    }
  }
  
  return new Promise((resolve) => {
    setTimeout(() => resolve(expense), 300);
  });
};