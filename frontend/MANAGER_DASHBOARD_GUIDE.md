# Manager Dashboard - Testing Guide

## 🎯 **Manager Dashboard Features**

The Manager Dashboard is designed for users with roles: **CFO**, **Director**, **Manager**, and **Financer**. It provides comprehensive expense approval and team management capabilities.

## 🔑 **Test Credentials**

Use these email formats to test different manager roles:

### **CFO Role:**
- Email: `cfo@company.com` 
- Password: `any password`

### **Director Role:**
- Email: `director@company.com`
- Password: `any password`

### **Manager Role:**
- Email: `manager@company.com`
- Password: `any password`

### **Financer Role:**
- Email: `financer@company.com`
- Password: `any password`

### **For Comparison - Admin:**
- Email: `admin@company.com`
- Password: `any password` (redirects to Admin Dashboard)

### **For Comparison - Employee:**
- Email: `employee@company.com`
- Password: `any password` (redirects to Employee Dashboard)

## 📊 **Dashboard Features**

### **1. Statistics Cards**
- **Pending Approvals**: Shows expenses awaiting review
- **Approved This Month**: Monthly approval count and amount
- **Team Expenses**: Total team expense count
- **Total Amount**: Total amount in company currency (USD)

### **2. Quick Actions Panel**
- Bulk Approve functionality
- Team Analytics access
- Team Messages communication

### **3. Pending Approvals Section**
- View all expenses awaiting approval
- See employee details and expense information
- Amounts shown in both original and company currency
- **Actions Available:**
  - **View**: View expense details
  - **Approve**: Approve with mandatory comment
  - **Reject**: Reject with mandatory reason

### **4. Team Expenses Section**
- Filter by status: All, Pending, Approved, Rejected, Paid
- All amounts displayed in company's default currency
- Comprehensive expense tracking for the team

### **5. Approval/Rejection Modal**
- **Detailed expense information display**
- **Mandatory comment system**: Comments are required for both approval and rejection
- **Currency conversion display**: Shows both original and company currency amounts
- **Employee visibility**: Comments are visible to employees

## 🔄 **Role-Based Access Control**

### **Manager Roles Access:**
- ✅ **CFO**: Full manager dashboard access
- ✅ **Director**: Full manager dashboard access  
- ✅ **Manager**: Full manager dashboard access
- ✅ **Financer**: Full manager dashboard access

### **Restricted Access:**
- ❌ **Admin**: Redirected to Admin Dashboard
- ❌ **Employee**: Redirected to Employee Dashboard

## 🧪 **Testing Workflow**

### **Step 1: Login Test**
1. Go to login page
2. Use any of the manager role emails above
3. Enter any password
4. Verify redirect to `/manager/dashboard`

### **Step 2: Dashboard Features Test**
1. **Statistics**: Check if all 4 stat cards display correctly
2. **Quick Actions**: Verify the 3 action panels are visible
3. **Pending Approvals**: Should show 3 mock pending expenses
4. **Team Expenses**: Should show 5 mock team expenses

### **Step 3: Approval Process Test**
1. Click **"Approve"** on any pending expense
2. Verify modal opens with expense details
3. Try submitting without comment (should show error)
4. Add a comment and submit
5. Verify success message and data refresh

### **Step 4: Rejection Process Test**
1. Click **"Reject"** on any pending expense
2. Verify modal opens with expense details
3. Add rejection reason and submit
4. Verify success message and data refresh

### **Step 5: Filtering Test**
1. Use the status filter dropdown in Team Expenses
2. Test filters: All, Pending, Approved, Rejected, Paid
3. Verify data updates accordingly

## 💡 **Key Features Implemented**

### **✅ Completed Features:**
- ✅ Role-based authentication and routing
- ✅ Manager dashboard with real-time stats
- ✅ Pending approvals management
- ✅ Team expense tracking with filtering
- ✅ Approval/rejection with mandatory comments
- ✅ Currency conversion display (original → company currency)
- ✅ Responsive design with emerald theme
- ✅ Toast notifications for user feedback
- ✅ Protected routes based on user roles
- ✅ Mock API integration ready for backend

### **🚀 Technical Implementation:**
- **React Query**: For data fetching and cache management
- **React Router**: For role-based navigation
- **Tailwind CSS**: For consistent emerald-themed styling
- **Lucide Icons**: For professional iconography
- **React Hot Toast**: For user feedback notifications
- **Protected Routes**: For security and role management

## 🔧 **Technical Notes**

- **Mock API**: Currently using mock data for development
- **Real-time Updates**: React Query invalidates cache after actions
- **Role Detection**: Based on email keywords for testing
- **Currency Conversion**: Mock conversion rates applied
- **Comments System**: Mandatory for all approval/rejection actions

## 🎨 **Design Consistency**

The Manager Dashboard maintains the same emerald green theme (`#10b981`, `#34d399`, `#059669`) as the Admin Dashboard for brand consistency while providing role-appropriate functionality.

---

**Ready for Backend Integration**: All API endpoints are defined and mock responses match expected backend data structure.