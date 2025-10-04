const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'mock-secret';

app.use(cors());
app.use(bodyParser.json());

// storage for receipts
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// In-memory db
const db = {
  users: [],
  expenses: [],
};

// Add some sample data on startup
async function seedDatabase() {
  // Add a sample user
  const sampleUser = {
    id: 'sample-user-123',
    name: 'Bushra Khan',
    companyName: 'Sample Corp',
    email: 'bushra.khan@example.com',
    password: await bcrypt.hash('password123', 8), // password is "password123"
    role: 'employee'
  };
  
  // Only add if doesn't exist
  if (!db.users.find(u => u.email === sampleUser.email)) {
    db.users.push(sampleUser);
  }
  
  // Add sample expenses with different statuses
  const sampleExpenses = [
    {
      id: 'exp-1',
      employee_name: 'Bushra Khan',
      userId: 'sample-user-123',
      description: 'Office supplies - notebooks and pens',
      category: 'Office Supplies',
      date: '2025-10-02',
      paid_by: 'yash',
      amount: 22.11,
      currency: 'USD',
      remarks: 'Monthly office supplies',
      status: 'Waiting approval',
      receipt_url: null,
      approval_history: [],
    },
    {
      id: 'exp-2',
      employee_name: 'Bushra Khan',
      userId: 'sample-user-123',
      description: 'Client lunch meeting',
      category: 'Meals',
      date: '2025-10-03',
      paid_by: 'khan',
      amount: 22.11,
      currency: 'USD',
      remarks: 'Business meeting with client',
      status: 'Approved',
      receipt_url: null,
      approval_history: [
        { approver_name: 'Manager Smith', action: 'Approved', timestamp: '2025-10-04T10:30:00Z' }
      ],
    },
    {
      id: 'exp-3',
      employee_name: 'Bushra Khan',
      userId: 'sample-user-123',
      description: 'Travel expenses - taxi',
      category: 'Travel',
      date: '2018-12-14',
      paid_by: 'Personal Card',
      amount: 22.11,
      currency: 'USD',
      remarks: 'Travel to client site',
      status: 'Rejected',
      receipt_url: null,
      approval_history: [
        { approver_name: 'Manager Smith', action: 'Rejected', timestamp: '2018-12-15T14:20:00Z' }
      ],
    },
    {
      id: 'exp-4',
      employee_name: 'Bushra Khan',
      userId: 'sample-user-123',
      description: 'Software subscription',
      category: 'kkk',
      date: '2025-10-01',
      paid_by: 'Company Card',
      amount: 22.11,
      currency: 'USD',
      remarks: 'Monthly software license',
      status: 'Waiting approval',
      receipt_url: null,
      approval_history: [],
    }
  ];
  
  // Only add sample expenses if the database is empty
  if (db.expenses.length === 0) {
    db.expenses.push(...sampleExpenses);
  }
}

// Helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ detail: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = db.users.find((u) => u.id === payload.id);
    if (!req.user) {
      return res.status(401).json({ detail: 'User not found' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}

// Auth
app.post('/auth/signup', async (req, res) => {
  const { name, companyName, email, password, country } = req.body;
  if (!email || !password) return res.status(400).json({ detail: 'Email and password are required' });
  if (db.users.find((u) => u.email === email)) return res.status(400).json({ detail: 'User already exists' });
  const hashed = await bcrypt.hash(password, 8);
  const user = { id: nanoid(), name, companyName, email, password: hashed, role: 'employee' };
  db.users.push(user);
  const token = generateToken(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, access_token: token });
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ detail: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ detail: 'Invalid credentials' });
  const token = generateToken(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, access_token: token });
});

app.get('/auth/me', authMiddleware, (req, res) => {
  const u = req.user;
  res.json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

// Expenses
app.get('/expenses/my', authMiddleware, (req, res) => {
  const my = db.expenses.filter((e) => e.userId === req.user.id);
  res.json(my);
});

app.post('/expenses', authMiddleware, upload.single('receipt'), (req, res) => {
  const { description, category, date, paid_by, amount, currency, remarks } = req.body;
  const expense = {
    id: nanoid(),
    employee_name: req.user.name,
    userId: req.user.id,
    description: description || '',
    category: category || '',
    date: date || new Date().toISOString(),
    paid_by: paid_by || '',
    amount: amount ? parseFloat(amount) : 0,
    currency: currency || 'USD',
    remarks: remarks || '',
    // accept status from client (e.g., 'Waiting approval') otherwise default to Draft
    status: (req.body && req.body.status) ? req.body.status : 'Draft',
    receipt_url: req.file ? `/uploads/${req.file.filename}` : null,
    approval_history: [],
  };
  db.expenses.push(expense);
  res.json(expense);
});

app.put('/expenses/:id', authMiddleware, upload.single('receipt'), (req, res) => {
  const id = req.params.id;
  const expense = db.expenses.find((e) => e.id === id && e.userId === req.user.id);
  if (!expense) return res.status(404).json({ detail: 'Expense not found' });
  const { description, category, date, paid_by, amount, currency, remarks, status } = req.body;
  if (description !== undefined) expense.description = description;
  if (category !== undefined) expense.category = category;
  if (date !== undefined) expense.date = date;
  if (paid_by !== undefined) expense.paid_by = paid_by;
  if (amount !== undefined) expense.amount = parseFloat(amount);
  if (currency !== undefined) expense.currency = currency;
  if (remarks !== undefined) expense.remarks = remarks;
  if (status !== undefined) expense.status = status;
  if (req.file) expense.receipt_url = `/uploads/${req.file.filename}`;
  res.json(expense);
});

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, async () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
  
  // Seed the database with sample data
  await seedDatabase();
  
  // Update any existing Draft expenses to Waiting approval for demo purposes
  db.expenses.forEach(expense => {
    if (expense.status === 'Draft') {
      expense.status = 'Waiting approval';
    }
  });
  
  console.log(`Database seeded. Total expenses: ${db.expenses.length}`);
});
